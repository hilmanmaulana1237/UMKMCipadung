<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\UmkmStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Services\ImageService;

class UmkmController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Show UMKM dashboard with store stats.
     */
    public function dashboard()
    {
        $user = auth()->user();
        $store = $user->umkmStore;

        if (!$store) {
            // Render dashboard with null store - frontend will show setup prompt
            return Inertia::render('umkm/dashboard', [
                'store' => null,
                'stats' => [
                    'totalProducts' => 0,
                    'activeProducts' => 0,
                    'pendingOrders' => 0,
                    'processingOrders' => 0,
                    'totalRevenue' => 0,
                ],
                'reviewStats' => [
                    'positive_count' => 0,
                    'negative_count' => 0,
                ],
                'recentOrders' => [],
            ]);
        }

        $stats = [
            'totalProducts' => $store->products()->count(),
            'activeProducts' => $store->products()->active()->count(),
            'pendingOrders' => $store->orders()->where('status', 'waiting_verification')->count(),
            'processingOrders' => $store->orders()->where('status', 'processing')->count(),
            'totalRevenue' => $store->orders()->where('status', 'completed')->sum('total_amount'),
        ];

        // Get review statistics
        $reviewStats = [
            'positive_count' => $store->reviews()->where('sentiment', 'positive')->count(),
            'negative_count' => $store->reviews()->where('sentiment', 'negative')->count(),
        ];

        $recentOrders = $store->orders()
            ->with(['buyer', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('umkm/dashboard', [
            'store' => array_merge($store->toArray(), [
                'average_rating' => $store->average_rating,
                'total_ratings' => $store->total_ratings,
            ]),
            'stats' => $stats,
            'reviewStats' => $reviewStats,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Show store setup form.
     */
    public function storeSetup()
    {
        // dd('Reached storeSetup');
        $store = auth()->user()->umkmStore;

        return Inertia::render('umkm/store-setup', [
            'store' => $store,
        ]);
    }

    /**
     * Save/update store info.
     */
    public function storeUpdate(Request $request)
    {
        // Sanitize admin_fee: replace comma with nothing (if 500,00 for 500) or dot?
        // Usage pattern: "500,00" usually means 500. "500.00" means 500. 
        // Simplest: remove non-numeric chars logic matching frontend.
        if ($request->has('admin_fee') && is_string($request->admin_fee)) {
            $fee = (int) preg_replace('/[^0-9]/', '', $request->admin_fee);
            if ($fee > 500)
                $fee = 500; // Cap at 500
            $request->merge(['admin_fee' => $fee]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address_pickup' => 'required|string',
            'latitude' => 'required|string',
            'longitude' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'bank_name' => 'required|string|max:100',
            'bank_account' => 'required|string|max:50',
            'bank_holder' => 'required|string|max:100',
            'qris_handle' => 'nullable|string|max:100',
            'qris' => 'nullable|image|max:10240',
            'banner' => 'nullable|image|max:10240',
            'store_photo' => 'nullable|image|max:10240',
            'profile_photo' => 'nullable|image|max:10240',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'operating_days' => 'required|array|min:1',
            'admin_fee' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();
        $store = $user->umkmStore ?? new UmkmStore(['user_id' => $user->id]);

        $store->fill($validated);

        // Handle QRIS upload
        if ($request->hasFile('qris')) {
            if ($store->qris_path) {
                Storage::disk('public')->delete($store->qris_path);
            }
            // QRIS requires high clarity, maybe less compression? But current service default (80) is usually fine.
            $store->qris_path = $this->imageService->upload($request->file('qris'), 'qris');
        }

        // Handle Banner upload
        if ($request->hasFile('banner')) {
            if ($store->banner_path) {
                Storage::disk('public')->delete($store->banner_path);
            }
            $store->banner_path = $this->imageService->upload($request->file('banner'), 'banners', 1200);
        }

        // Handle Store Photo upload (for courier navigation)
        if ($request->hasFile('store_photo')) {
            if ($store->store_photo_path) {
                Storage::disk('public')->delete($store->store_photo_path);
            }
            $store->store_photo_path = $this->imageService->upload($request->file('store_photo'), 'store-photos');
        }

        if ($request->hasFile('profile_photo')) {
            if ($store->profile_photo_path) {
                Storage::disk('public')->delete($store->profile_photo_path);
            }
            $store->profile_photo_path = $this->imageService->upload($request->file('profile_photo'), 'store-profiles', 500); // Smaller for profile
        }

        $store->save();

        return redirect()->route('umkm.dashboard')
            ->with('success', 'Toko berhasil disimpan!');
    }

    /**
     * Delete QRIS image from store.
     */
    public function deleteQris()
    {
        $user = auth()->user();
        $store = $user->umkmStore;

        if (!$store || !$store->qris_path) {
            return redirect()->back()->with('error', 'Tidak ada QRIS untuk dihapus.');
        }

        Storage::disk('public')->delete($store->qris_path);
        $store->qris_path = null;
        $store->qris_handle = null;
        $store->save();

        return redirect()->back()->with('success', 'Foto QRIS berhasil dihapus!');
    }

    /**
     * List pending orders for verification.
     */
    public function orders(Request $request)
    {
        $store = auth()->user()->umkmStore;
        $status = $request->get('status', 'waiting_verification');

        if ($status === 'completed') {
            $orders = $store->orders()
                ->with(['buyer', 'items.product'])
                ->whereIn('status', ['completed', 'cancelled'])
                ->latest()
                ->paginate(10);
        } else {
            $orders = $store->orders()
                ->with(['buyer', 'items.product'])
                ->where('status', $status)
                ->latest()
                ->paginate(10);
        }

        $stats = [
            'waiting' => $store->orders()->where('status', 'waiting_verification')->count(),
            'processing' => $store->orders()->where('status', 'processing')->count(),
            'ready' => $store->orders()->where('status', 'ready_to_ship')->count(),
            'completed' => $store->orders()->whereIn('status', ['completed', 'cancelled'])->count(),
        ];

        return Inertia::render('umkm/orders', [
            'orders' => $orders,
            'currentStatus' => $status,
            'stats' => $stats,
        ]);
    }

    /**
     * Show order detail.
     */
    public function orderDetail(Order $order)
    {
        $store = auth()->user()->umkmStore;

        if ($order->umkm_store_id !== $store->id) {
            abort(403);
        }

        $order->load(['buyer', 'items.product', 'affiliateReward.affiliator']);

        return Inertia::render('umkm/order-detail', [
            'order' => $order,
        ]);
    }

    /**
     * Serve payment proof securely.
     */
    public function showProof($filename)
    {
        $path = 'proofs/' . $filename;

        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $file = \Illuminate\Support\Facades\Storage::disk('local')->get($path);
        $type = \Illuminate\Support\Facades\Storage::disk('local')->mimeType($path);

        return response($file, 200)->header('Content-Type', $type);
    }

    /**
     * Verify/accept an order.
     */
    public function verifyOrder(Order $order)
    {
        $store = auth()->user()->umkmStore;

        if ($order->umkm_store_id !== $store->id) {
            abort(403);
        }

        if ($order->status !== 'waiting_verification') {
            return back()->with('error', 'Pesanan tidak dapat diverifikasi.');
        }

        $order->update(['status' => 'processing']);

        // Update affiliate reward status if exists
        $reward = $order->affiliateReward;
        if ($reward && $reward->isPotential()) {
            $reward->markAsVerified();
        }

        return back()->with('success', 'Pesanan diterima! Komisi affiliator tercatat.');
    }

    /**
     * Mark order as ready to ship.
     */
    public function readyToShip(Order $order)
    {
        $store = auth()->user()->umkmStore;

        if ($order->umkm_store_id !== $store->id) {
            abort(403);
        }

        if ($order->status !== 'processing') {
            return back()->with('error', 'Pesanan tidak dapat diproses.');
        }

        $order->update([
            'status' => 'ready_to_ship',
            'courier_status' => 'finding_driver',
        ]);

        return back()->with('success', 'Pesanan siap untuk dikirim!');
    }

    /**
     * Reject an order (e.g., product out of stock).
     */
    public function rejectOrder(Order $order)
    {
        $store = auth()->user()->umkmStore;

        if ($order->umkm_store_id !== $store->id) {
            abort(403);
        }

        if ($order->status !== 'waiting_verification') {
            return back()->with('error', 'Hanya bisa menolak pesanan yang belum diverifikasi.');
        }

        DB::transaction(function () use ($order) {
            // 1. Restore product stock
            foreach ($order->items as $item) {
                \App\Models\Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }

            // 2. Cancel order
            $order->update([
                'status' => 'cancelled',
                'cancelled_by' => 'seller', // Add who cancelled it
                'cancelled_at' => now(),
            ]);
        });

        return back()->with('success', 'Pesanan ditolak dan stok dikembalikan.');
    }

    /**
     * Toggle store open/closed for today.
     */
    public function toggleOpen()
    {
        $store = auth()->user()->umkmStore;

        if (!$store) {
            return back()->with('error', 'Toko belum dibuat.');
        }

        $store->update([
            'is_open_today' => !$store->is_open_today,
        ]);

        $status = $store->is_open_today ? 'dibuka' : 'ditutup';
        return back()->with('success', "Toko berhasil $status untuk hari ini!");
    }

    /**
     * Complete a digital/service order directly (no courier needed).
     */
    public function completeDigitalOrder(Order $order)
    {
        $store = auth()->user()->umkmStore;

        if ($order->umkm_store_id !== $store->id) {
            abort(403);
        }

        if (!$order->is_digital_order) {
            return back()->with('error', 'Hanya pesanan digital yang bisa diselesaikan langsung.');
        }

        if (!in_array($order->status, ['processing'])) {
            return back()->with('error', 'Pesanan harus dalam status diproses.');
        }

        $order->update([
            'status' => 'completed',
            'courier_status' => 'not_required',
        ]);

        return back()->with('success', 'Pesanan digital berhasil diselesaikan!');
    }

    /**
     * Show analytics/statistics page.
     */
    public function analytics()
    {
        $store = auth()->user()->umkmStore;

        if (!$store) {
            return redirect()->route('umkm.dashboard');
        }

        // Sales Statistics
        $totalRevenue = $store->orders()->where('status', 'completed')->sum('total_amount');
        $totalOrders = $store->orders()->where('status', 'completed')->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Daily sales for last 30 days
        $dailySales = $store->orders()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw("date(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Monthly sales for last 12 months
        $monthlySales = $store->orders()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("strftime('%Y-%m', created_at) as month, SUM(total_amount) as revenue, COUNT(*) as orders")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top products
        $topProducts = \DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.umkm_store_id', $store->id)
            ->where('orders.status', 'completed')
            ->select('products.name', \DB::raw('SUM(order_items.quantity) as total_sold'), \DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // AI Usage Statistics
        $aiChatSessions = \App\Models\AIChatSession::where('user_id', auth()->id())->count();
        $aiMessages = \App\Models\AIChatMessage::whereHas('session', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('role', 'user')->count();

        $aiGeneratedContent = \App\Models\AIGeneratedContent::where('user_id', auth()->id())->count();
        $postersGenerated = \App\Models\AIGeneratedContent::where('user_id', auth()->id())
            ->where('type', 'poster')->count();
        $videoScriptsGenerated = \App\Models\AIGeneratedContent::where('user_id', auth()->id())
            ->where('type', 'video_script')->count();

        return Inertia::render('umkm/analytics', [
            'store' => $store,
            'salesStats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'avgOrderValue' => round($avgOrderValue, 2),
                'dailySales' => $dailySales,
                'monthlySales' => $monthlySales,
            ],
            'topProducts' => $topProducts,
            'aiStats' => [
                'chatSessions' => $aiChatSessions,
                'messages' => $aiMessages,
                'totalGenerated' => $aiGeneratedContent,
                'postersGenerated' => $postersGenerated,
                'videoScriptsGenerated' => $videoScriptsGenerated,
            ],
        ]);
    }
}
