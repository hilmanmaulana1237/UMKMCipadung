<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promo;
use App\Models\Setting;
use App\Models\UmkmStore;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Models\AffiliateReward;
use App\Models\AIGeneratedContent;
use App\Models\ApiSetting;
use App\Models\UmkmLandingPage;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Admin dashboard with KPIs and charts.
     */
    public function dashboard()
    {
        // User stats by role
        $userStats = [
            'total' => User::count(),
            'buyers' => User::where('role', 'buyer')->count(),
            'umkm' => User::where('role', 'umkm')->count(),
            'couriers' => User::where('role', 'courier')->count(),
            'affiliators' => User::where('role', 'affiliator')->count(),
            'admins' => User::where('role', 'admin')->count(),
        ];

        // Order stats
        $orderStats = [
            'total' => Order::count(),
            'completed' => Order::where('status', 'completed')->count(),
            'pending' => Order::whereNotIn('status', ['completed', 'cancelled'])->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('total_amount'),
            'thisMonthRevenue' => Order::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
        ];

        // Store stats
        $storeStats = [
            'total' => UmkmStore::count(),
            'active' => UmkmStore::whereHas('orders', function ($q) {
                $q->whereMonth('created_at', now()->month);
            })->count(),
        ];

        // Pending items
        $pendingComplaints = Complaint::where('status', 'pending')->count();
        $pendingWithdrawals = WithdrawalRequest::where('status', 'pending')->count();
        $pendingWithdrawalAmount = WithdrawalRequest::where('status', 'pending')->sum('amount');

        // Active couriers
        $activeCouriers = User::where('role', 'courier')
            ->where('is_courier_active', true)
            ->count();

        // Recent orders
        $recentOrders = Order::with(['store', 'buyer'])
            ->latest()
            ->take(10)
            ->get();

        // Orders chart data (last 30 days)
        $ordersChart = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count'),
                DB::raw('sum(total_amount) as revenue')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('admin/dashboard', [
            'userStats' => $userStats,
            'orderStats' => $orderStats,
            'storeStats' => $storeStats,
            'pendingComplaints' => $pendingComplaints,
            'pendingWithdrawals' => $pendingWithdrawals,
            'pendingWithdrawalAmount' => $pendingWithdrawalAmount,
            'activeCouriers' => $activeCouriers,
            'recentOrders' => $recentOrders,
            'ordersChart' => $ordersChart,
        ]);
    }

    /**
     * List all users with filtering.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->withCount(['orders', 'deliveries'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
        ]);
    }

    /**
     * Show form to create a new user.
     */
    public function createUser()
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Store a new user with role-specific fields.
     */
    public function storeUser(Request $request)
    {
        $baseRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:buyer,umkm,courier,affiliator',
            'wa_number' => 'nullable|string|max:20',
        ];

        // Role-specific validation
        $roleRules = [];
        switch ($request->role) {
            case 'umkm':
                $roleRules = [
                    'store_name' => 'required|string|max:255',
                    'store_category' => 'required|in:kuliner,kriya,jasa',
                    'store_description' => 'nullable|string|max:1000',
                    'store_address' => 'required|string|max:500',
                ];
                break;
            case 'affiliator':
                $roleRules = [
                    'affiliate_code' => 'required|string|max:20|unique:users,affiliate_code',
                ];
                break;
        }

        $validated = $request->validate(array_merge($baseRules, $roleRules));

        // Create user (Strict Mode: Manual assignment for protected fields)
        $user = new User();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = bcrypt($validated['password']);
        $user->role = $validated['role']; // Explicitly set protected field
        $user->wa_number = $validated['wa_number'] ?? null;
        $user->affiliate_code = $validated['affiliate_code'] ?? null;
        $user->wallet_balance = 0;
        $user->save();

        // Create UMKM store if role is umkm
        if ($validated['role'] === 'umkm') {
            UmkmStore::create([
                'user_id' => $user->id,
                'name' => $validated['store_name'],
                'category' => $validated['store_category'],
                'description' => $validated['store_description'] ?? null,
                'address_pickup' => $validated['store_address'],
            ]);
        }

        return redirect()->route('admin.users')->with('success', 'Pengguna berhasil ditambahkan!');
    }

    /**
     * View user detail.
     */
    public function userDetail(User $user)
    {
        $user->load(['umkmStore', 'orders.store', 'deliveries.store']);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * List all stores.
     */
    public function stores(Request $request)
    {
        $query = UmkmStore::with('owner')
            ->withCount(['products', 'orders']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $stores = $query->latest()->paginate(20);

        return Inertia::render('admin/stores/index', [
            'stores' => $stores,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * View store detail.
     */
    /**
     * View store detail.
     */
    public function storeDetail(UmkmStore $store)
    {
        $store->load(['owner', 'products']);

        // Stats Key
        $totalRevenue = $store->orders()->where('status', 'completed')->sum('total_amount');
        $totalOrders = $store->orders()->count();
        $completedOrders = $store->orders()->where('status', 'completed')->count();
        $successRate = $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100) : 0;

        // Revenue Chart (Last 6 Months)
        // Check driver for date formatting compatibility
        $driver = config('database.default');
        $dateFormat = $driver === 'sqlite' ? '%Y-%m' : '%Y-%m'; 

        // Generate last 6 months keys
        $res = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $res[$key] = [
                'label' => $date->translatedFormat('M Y'),
                'value' => 0
            ];
        }

        $revenueData = $store->orders()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->select(
                DB::raw("strftime('$dateFormat', created_at) as month"),
                DB::raw('sum(total_amount) as revenue')
            )
            ->groupBy('month')
            ->pluck('revenue', 'month');

        // Merge data
        foreach ($revenueData as $month => $revenue) {
            if (isset($res[$month])) {
                $res[$month]['value'] = $revenue;
            }
        }

        $revenueChart = array_values($res);

        // Top Selling Products
        $topProducts = $store->products()
            ->withCount(['orderItems as sold_count' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('status', 'completed');
                });
            }])
            ->orderByDesc('sold_count')
            ->take(5)
            ->get();

        // Recent Orders
        $recentOrders = $store->orders()
            ->with('buyer')
            ->latest()
            ->take(10)
            ->get();
            
        // Recent Reviews (if relationship exists, assuming via products or direct)
        // Corrected to use store_reviews table
        $reviews = DB::table('store_reviews')
            ->join('users', 'store_reviews.user_id', '=', 'users.id')
            ->where('store_reviews.umkm_store_id', $store->id)
            ->select('store_reviews.*', 'users.name as user_name', 'store_reviews.created_at')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($review) {
                // Determine rating based on sentiment (since we don't have a star rating column)
                // Positive = 5 stars, Negative = 1 star
                $review->rating = $review->sentiment === 'positive' ? 5 : 1;
                return $review;
            });

        return Inertia::render('admin/stores/show', [
            'store' => $store,
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'successRate' => $successRate,
                'averageRating' => $store->average_rating ?? 0,
            ],
            'chartData' => $revenueChart,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'reviews' => $reviews,
        ]);
    }

    /**
     * List all orders.
     */
    public function orders(Request $request)
    {
        $query = Order::with(['store', 'buyer', 'courier']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('order_number', 'like', "%{$request->search}%");
        }

        $orders = $query->latest()->paginate(20);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }



    /**
     * List all complaints.
     */
    public function complaints(Request $request)
    {
        $query = Complaint::with(['user', 'order.store']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $complaints = $query->latest()->paginate(20);

        return Inertia::render('admin/complaints/index', [
            'complaints' => $complaints,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Respond to a complaint.
     */
    public function complaintRespond(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:in_review,resolved,rejected',
            'admin_response' => 'required|string|max:1000',
        ]);

        $complaint->update($validated);

        return back()->with('success', 'Keluhan berhasil diperbarui.');
    }

    /**
     * List all promos.
     */
    public function promos()
    {
        $promos = Promo::latest()->paginate(20);

        return Inertia::render('admin/promos/index', [
            'promos' => $promos,
        ]);
    }

    /**
     * Store new promo.
     */
    public function storePromo(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promos,code|max:20|uppercase',
            'type' => 'required|in:free_shipping,discount',
            'value' => 'required|numeric|min:0',
            'quota' => 'required|integer|min:1',
            'min_purchase' => 'required|numeric|min:0',
        ]);

        Promo::create($validated);

        return back()->with('success', 'Kode promo berhasil dibuat.');
    }

    /**
     * Delete/Deactivate promo.
     */
    public function destroyPromo(Promo $promo)
    {
        $promo->delete();
        return back()->with('success', 'Kode promo dihapus.');
    }

    /**
     * Serve private payment proof.
     */
    public function showProof($filename)
    {
        $path = storage_path('app/private/proofs/' . $filename); // In Laravel 11 structure it might be just 'app/proofs' or 'app/private/proofs' depending on config. 
        // Standard 'local' disk usually maps to storage/app.
        $path = storage_path('app/proofs/' . $filename);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }

    /**
     * List affiliates with performance.
     */
    public function affiliates()
    {
        $affiliates = User::where('role', 'affiliator')
            ->withCount('affiliateRewards')
            ->withSum('affiliateRewards', 'amount')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/affiliates/index', [
            'affiliates' => $affiliates,
        ]);
    }

    /**
     * List withdrawal requests.
     */
    public function withdrawals(Request $request)
    {
        $query = WithdrawalRequest::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate(20);

        $pendingTotal = WithdrawalRequest::where('status', 'pending')->sum('amount');

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'pendingTotal' => $pendingTotal,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * General Settings Page.
     */
    public function generalSettings()
    {
        $settings = \Illuminate\Support\Facades\DB::table('settings')->pluck('value', 'key');
        
        $activeOrdersQuery = Order::whereIn('status', ['waiting_verification', 'processing', 'ready_to_ship', 'on_delivery']);
        
        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'maintenanceMode' => Setting::isMaintenanceMode(),
            'activeOrdersCount' => $activeOrdersQuery->count(),
            'activeOrdersByStatus' => [
                'waiting_verification' => (clone $activeOrdersQuery)->where('status', 'waiting_verification')->count(),
                'processing' => (clone $activeOrdersQuery)->where('status', 'processing')->count(),
                'ready_to_ship' => (clone $activeOrdersQuery)->where('status', 'ready_to_ship')->count(),
                'on_delivery' => (clone $activeOrdersQuery)->where('status', 'on_delivery')->count(),
            ],
        ]);
    }

    /**
     * Save API/General Settings.
     */


    /**
     * Approve a withdrawal request.
     */
    public function approveWithdrawal(Request $request, WithdrawalRequest $withdrawal)
    {
        if (!$withdrawal->isPending()) {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        $user = $withdrawal->user;

        if ($user->wallet_balance < $withdrawal->amount) {
            return back()->with('error', 'Saldo pengguna tidak mencukupi.');
        }

        DB::transaction(function () use ($withdrawal, $user, $request) {
            // Deduct balance
            $user->decrement('wallet_balance', $withdrawal->amount);

            // Update withdrawal
            $withdrawal->update([
                'status' => 'approved',
                'admin_notes' => $request->notes ?? 'Disetujui',
                'processed_at' => now(),
            ]);
        });

        return back()->with('success', 'Penarikan disetujui. Saldo telah dikurangi.');
    }

    /**
     * Reject a withdrawal request.
     */
    public function rejectWithdrawal(Request $request, WithdrawalRequest $withdrawal)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!$withdrawal->isPending()) {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        $withdrawal->update([
            'status' => 'rejected',
            'admin_notes' => $validated['reason'],
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Penarikan ditolak.');
    }

    /**
     * API Settings page.
     */
    public function apiSettings()
    {
        $settings = ApiSetting::all()->keyBy('key');

        return Inertia::render('admin/settings/api', [
            'settings' => [
                'primary' => [
                    'key' => 'api_primary',
                    'model' => $settings['api_primary']->model ?? '',
                    'provider' => $settings['api_primary']->provider ?? 'openrouter',
                    'base_url' => $settings['api_primary']->base_url ?? '',
                    'description' => $settings['api_primary']->description ?? '',
                    'is_active' => $settings['api_primary']->is_active ?? true,
                    'is_configured' => $settings['api_primary']->is_configured ?? false,
                    'masked_key' => $settings['api_primary']->masked_value ?? null,
                ],
                'secondary' => [
                    'key' => 'api_secondary',
                    'model' => $settings['api_secondary']->model ?? '',
                    'provider' => $settings['api_secondary']->provider ?? 'openrouter',
                    'base_url' => $settings['api_secondary']->base_url ?? '',
                    'description' => $settings['api_secondary']->description ?? '',
                    'is_active' => $settings['api_secondary']->is_active ?? true,
                    'is_configured' => $settings['api_secondary']->is_configured ?? false,
                    'masked_key' => $settings['api_secondary']->masked_value ?? null,
                ],
                'video' => [
                    'key' => 'api_video',
                    'model' => $settings['api_video']->model ?? '',
                    'provider' => $settings['api_video']->provider ?? 'openrouter',
                    'base_url' => $settings['api_video']->base_url ?? '',
                    'description' => $settings['api_video']->description ?? '',
                    'is_active' => $settings['api_video']->is_active ?? false,
                    'is_configured' => $settings['api_video']->is_configured ?? false,
                    'masked_key' => $settings['api_video']->masked_value ?? null,
                ],
            ],
        ]);
    }

    /**
     * Save API/General settings.
     */
    public function saveApiSettings(Request $request)
    {
        // Handle General Settings (Courier/Admin Fee + WhatsApp)
        if ($request->has('courier_fee') || $request->has('admin_fee') || $request->has('fonnte_api_token') || $request->has('whatsapp_notifications_enabled')) {
            $validated = $request->validate([
                'courier_fee' => 'nullable|numeric|min:0',
                'admin_fee' => 'nullable|numeric|min:0',
                'fonnte_api_token' => 'nullable|string|max:500',
                'whatsapp_notifications_enabled' => 'nullable|boolean',
            ]);

            if ($request->has('courier_fee')) {
                DB::table('settings')->updateOrInsert(
                    ['key' => 'courier_fee'],
                    ['value' => $validated['courier_fee']]
                );
            }

            if ($request->has('admin_fee')) {
                DB::table('settings')->updateOrInsert(
                    ['key' => 'admin_fee'],
                    ['value' => $validated['admin_fee']]
                );
            }

            // Save WhatsApp settings
            if ($request->has('fonnte_api_token')) {
                DB::table('settings')->updateOrInsert(
                    ['key' => 'fonnte_api_token'],
                    ['value' => $validated['fonnte_api_token']]
                );
                // Clear cache
                \Illuminate\Support\Facades\Cache::forget('setting.fonnte_api_token');
            }

            if ($request->has('whatsapp_notifications_enabled')) {
                DB::table('settings')->updateOrInsert(
                    ['key' => 'whatsapp_notifications_enabled'],
                    ['value' => $validated['whatsapp_notifications_enabled'] ? 'true' : 'false']
                );
                // Clear cache
                \Illuminate\Support\Facades\Cache::forget('setting.whatsapp_notifications_enabled');
            }
            
            return back()->with('success', 'Pengaturan berhasil disimpan!');
        }

        $validated = $request->validate([
            'tier' => 'required|in:primary,secondary,video',
            'api_key' => 'nullable|string',
            'model' => 'nullable|string|max:100',
            'provider' => 'required|in:openrouter,openai,google,anthropic,kie-ai',
            'base_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        $setting = ApiSetting::firstOrCreate(
            ['key' => 'api_' . $validated['tier']],
            ['description' => 'API ' . ucfirst($validated['tier'])]
        );

        // Only update API key if provided (not empty)
        if (!empty($validated['api_key'])) {
            $setting->value = $validated['api_key'];
        }

        $setting->model = $validated['model'];
        $setting->provider = $validated['provider'];
        $setting->base_url = $validated['base_url'];
        $setting->is_active = $validated['is_active'] ?? true;
        $setting->save();

        return back()->with('success', 'Pengaturan API berhasil disimpan!');
    }



    /**
     * Test API connection.
     */
    public function testApi(Request $request)
    {
        $validated = $request->validate([
            'tier' => 'required|in:primary,secondary,video',
        ]);

        $config = ApiSetting::getConfig($validated['tier']);

        if (empty($config['api_key'])) {
            return response()->json([
                'success' => false,
                'message' => 'API key belum dikonfigurasi.',
            ]);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'Content-Type' => 'application/json',
            ])->timeout(15)->post($config['base_url'], [
                'model' => $config['model'],
                'messages' => [
                    ['role' => 'user', 'content' => 'Jawab singkat: 1+1=?']
                ],
                'max_tokens' => 10,
            ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? 'OK';
                return response()->json([
                    'success' => true,
                    'message' => 'Koneksi berhasil! Response: ' . substr($content, 0, 50),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $response->status() . ' - ' . substr($response->body(), 0, 100),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Exception: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * AI Assistant page for admin.
     */
    public function aiAssistant()
    {
        // Get marketplace stats for context
        $stats = [
            'total_stores' => UmkmStore::count(),
            'active_stores' => UmkmStore::where('is_active', true)->count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::whereNotIn('status', ['completed', 'cancelled'])->count(),
            'pending_complaints' => Complaint::where('status', 'pending')->count(),
            'total_users' => User::count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
        ];

        $quickActions = [
            ['id' => 'add_umkm', 'label' => 'Bagaimana cara menambah UMKM baru?', 'icon' => 'store'],
            ['id' => 'increase_sales', 'label' => 'Strategi meningkatkan penjualan marketplace', 'icon' => 'trending'],
            ['id' => 'handle_complaint', 'label' => 'Cara menangani keluhan pelanggan', 'icon' => 'help'],
            ['id' => 'create_promo', 'label' => 'Buat pengumuman untuk pelaku UMKM', 'icon' => 'megaphone'],
            ['id' => 'analyze_data', 'label' => 'Analisis performa marketplace saat ini', 'icon' => 'chart'],
            ['id' => 'website_guide', 'label' => 'Panduan mengelola website ini', 'icon' => 'book'],
        ];

        return Inertia::render('admin/ai-assistant', [
            'stats' => $stats,
            'quickActions' => $quickActions,
        ]);
    }

    /**
     * Chat with Admin AI Assistant.
     */
    public function aiAssistantChat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'array',
        ]);

        // Get current marketplace stats for context
        $stats = [
            'total_stores' => UmkmStore::count(),
            'active_stores' => UmkmStore::where('is_active', true)->count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'pending_orders' => Order::whereNotIn('status', ['completed', 'cancelled'])->count(),
            'pending_complaints' => Complaint::where('status', 'pending')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
        ];

        $systemPrompt = "Kamu adalah Asisten AI untuk Admin Marketplace Cipadung - platform digital untuk UMKM desa.

DATA MARKETPLACE SAAT INI:
- Total Toko UMKM: {$stats['total_stores']} ({$stats['active_stores']} aktif)
- Total Produk: {$stats['total_products']}
- Total Pesanan: {$stats['total_orders']} ({$stats['completed_orders']} selesai, {$stats['pending_orders']} pending)
- Keluhan Pending: {$stats['pending_complaints']}
- Total Pendapatan: Rp " . number_format($stats['total_revenue'], 0, ',', '.') . "

TUGASMU:
1. Bantu admin desa memahami cara mengelola marketplace
2. Berikan strategi pengembangan UMKM yang praktis
3. Jawab pertanyaan teknis tentang website dengan bahasa sederhana
4. Buat template pengumuman, promo, atau komunikasi jika diminta
5. Analisis data dan berikan insight yang actionable

PANDUAN WEBSITE:
- Tambah UMKM: Admin > Pengguna > Tambah Pengguna > Pilih Role UMKM
- Lihat Keluhan: Admin > Keluhan > Respond setiap keluhan
- Approve Penarikan: Admin > Penarikan > Approve/Reject
- Lihat Statistik: Admin > Dashboard

GAYA BAHASA:
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami
- Jangan gunakan istilah teknis yang rumit
- Berikan langkah-langkah yang jelas dan terstruktur
- JANGAN gunakan format markdown seperti ** atau *
- Gunakan numbering sederhana 1. 2. 3. jika perlu

INGAT: Kamu membantu perangkat desa yang mungkin tidak familiar dengan teknologi. Sabar dan jelaskan dengan detail.";

        $config = ApiSetting::getConfig('primary');
        
        try {
            $messages = [['role' => 'system', 'content' => $systemPrompt]];
            
            // Add history
            foreach ($validated['history'] ?? [] as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }
            
            $messages[] = ['role' => 'user', 'content' => $validated['message']];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'HTTP-Referer' => config('app.url'),
                'X-Title' => 'Admin Assistant - Marketplace Cipadung',
                'Content-Type' => 'application/json',
            ])->timeout(45)->post($config['base_url'], [
                'model' => $config['model'],
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 1500,
            ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? null;
                
                // Cleanup
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
                $content = preg_replace('/\*\*([^*]+)\*\*/', '$1', $content);
                $content = preg_replace('/\*([^*]+)\*/', '$1', $content);
                $content = preg_replace('/^#{1,6}\s+/m', '', $content);
                
                return response()->json([
                    'success' => true,
                    'message' => trim($content),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Maaf, ada gangguan koneksi. Silakan coba lagi.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * General Settings page with maintenance mode toggle.
     */


    /**
     * Toggle maintenance mode.
     */
    /**
     * Toggle maintenance mode.
     */
    public function toggleMaintenance()
    {
        $newStatus = Setting::toggleMaintenanceMode();

        return back()->with('success', 
            $newStatus 
                ? 'Mode maintenance AKTIF. Pemesanan baru diblokir.' 
                : 'Mode maintenance NONAKTIF. Pemesanan kembali normal.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Courier Management
    |--------------------------------------------------------------------------
    */

    /**
     * List all couriers.
     */
    public function couriers(Request $request)
    {
        $query = User::where('role', 'courier')
            ->withCount(['deliveries' => function ($q) {
                $q->where('status', 'completed');
            }]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $isActive = $request->status === 'active';
            $query->where('is_courier_active', $isActive);
        }

        $couriers = $query->latest()->paginate(20);

        // Append rating manually since it's an accessor
        $couriers->getCollection()->transform(function ($courier) {
            $courier->rating = $courier->courier_average_rating;
            $courier->total_ratings = $courier->courier_total_ratings;
            return $courier;
        });

        return Inertia::render('admin/couriers/index', [
            'couriers' => $couriers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * View courier detail.
     */
    public function courierDetail(User $courier)
    {
        if (!$courier->isCourier()) {
            abort(404);
        }

        $courier->load(['deliveries.store']);

        // Stats
        $stats = [
            'completed_deliveries' => $courier->deliveries()->where('status', 'completed')->count(),
            'total_earnings' => 0, // In a real app, calculate from delivery fees
            'average_rating' => $courier->courier_average_rating,
            'active_days' => (int) $courier->created_at->diffInDays(now()),
        ];

        // Recent Deliveries
        $recentDeliveries = $courier->deliveries()
            ->with(['store', 'buyer'])
            ->latest()
            ->take(10)
            ->get();
        // Complaints (Linked via Order)
        // Find complaints where the order was handled by this courier
        // AND the complaint type is 'courier' OR 'delivery'
        $complaints = Complaint::whereHas('order', function ($q) use ($courier) {
                $q->where('courier_id', $courier->id);
            })
            ->whereIn('type', ['courier', 'delivery'])
            ->with('order')
            ->latest()
            ->get()
            ->map(function ($complaint) {
                $complaint->type_label = $complaint->type_label;
                $complaint->status_label = $complaint->status_label;
                return $complaint;
            });

        return Inertia::render('admin/couriers/show', [
            'courier' => $courier,
            'stats' => $stats,
            'recentDeliveries' => $recentDeliveries,
            'complaints' => $complaints,
        ]);
    }

    /**
     * Toggle courier active status.
     */
    public function toggleCourierStatus(User $courier)
    {
        if (!$courier->isCourier()) {
            abort(404);
        }

        $courier->is_suspended = !$courier->is_suspended;
        $courier->save();

        return back()->with('success', $courier->is_suspended 
            ? 'Kurir berhasil di-suspend (dinonaktifkan sementara).' 
            : 'Suspensi kurir dicabut. Kurir dapat aktif kembali.');
    }

    /**
     * View order detail with full actor info.
     */
    public function orderDetail(Order $order)
    {
        $order->load([
            'buyer',
            'store',
            'courier.courierRatings' => function($q) {
                // Determine if we want to show all ratings or just this order's
                // For "Courier Profile Card", we probably want their general repute
            },
            'items.product',
            'review.user' // If review exists
        ]);

        // Check for complaints related to this order
        $complaints = Complaint::where('order_id', $order->id)
            ->with('user')
            ->latest()
            ->get();

        // Additional courier stats for context (if assigned)
        $courierStats = null;
        if ($order->courier) {
            $courierStats = [
                'rating' => $order->courier->courier_average_rating,
                'total_deliveries' => $order->courier->deliveries()->where('status', 'completed')->count(),
            ];
        }

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'complaints' => $complaints,
            'courierStats' => $courierStats
        ]);
    }

    /**
     * Resolve order dispute or perform manual action.
     */
    public function resolveOrder(Request $request, Order $order)
    {
        $request->validate([
            'action' => 'required|in:refund_buyer,force_complete,cancel_order',
            'reason' => 'required|string|min:10',
        ]);

        DB::transaction(function () use ($request, $order) {
            switch ($request->action) {
                case 'refund_buyer':
                    // Logic: Return money to user wallet (if implemented) or just mark as cancelled/refunded
                    // For now, we'll mark as cancelled and assume manual refund or wallet logic
                    $order->update([
                        'status' => 'cancelled',
                        'cancellation_code' => 'ADMIN_REFUND',
                        'cancelled_by' => 'admin',
                        'cancelled_at' => now(),
                        'admin_fee_status' => 'void', // Void admin fee
                    ]);
                    
                    // Consider returning funds to wallet if balance system exists
                     if ($order->buyer && $order->payment_method !== 'cod') { // Example condition
                         $order->buyer->increment('wallet_balance', $order->total_amount);
                     }
                    break;

                case 'force_complete':
                    // Logic: Force status to completed, transfer money to seller/courier
                    $order->update([
                        'status' => 'completed',
                        'courier_status' => 'delivered', // If courier involved
                    ]);
                    // Trigger earnings logic (simplified)
                    // In real app, you'd trigger the same logic as normal completion
                    break;

                case 'cancel_order':
                    // Just cancel
                    $order->update([
                        'status' => 'cancelled',
                        'cancellation_code' => 'ADMIN_CANCEL',
                        'cancelled_by' => 'admin',
                        'cancelled_at' => now(),
                        'admin_fee_status' => 'void', // Void admin fee
                    ]);
                    break;
            }

            // Log this admin action (could be in a separate table, but for now we rely on status/cancellation fields)
             // Maybe add a complaint resolved note?
        });

        return back()->with('success', 'Tindakan berhasil dilakukan: ' . $request->action);
    }

    /**
     * Innovillage Competition Reports - Comprehensive platform statistics for jury.
     */
    public function innovillageReports()
    {
        // === AI CONTENT STATISTICS ===
        $aiVideoStats = [
            'total' => AIGeneratedContent::whereIn('type', ['video', 'video_generation'])->count(),
            'completed' => AIGeneratedContent::whereIn('type', ['video', 'video_generation'])->whereIn('status', ['completed', 'success'])->count(),
            'generating' => AIGeneratedContent::whereIn('type', ['video', 'video_generation'])->whereIn('status', ['generating', 'waiting', 'queuing'])->count(),
            'failed' => AIGeneratedContent::whereIn('type', ['video', 'video_generation'])->whereIn('status', ['failed', 'fail'])->count(),
        ];

        $aiPosterStats = [
            'total' => AIGeneratedContent::whereIn('type', ['poster', 'poster_generation'])->count(),
            'completed' => AIGeneratedContent::whereIn('type', ['poster', 'poster_generation'])->whereIn('status', ['completed', 'success'])->count(),
            'generating' => AIGeneratedContent::whereIn('type', ['poster', 'poster_generation'])->whereIn('status', ['generating', 'waiting'])->count(),
            'failed' => AIGeneratedContent::whereIn('type', ['poster', 'poster_generation'])->whereIn('status', ['failed', 'fail'])->count(),
        ];

        $aiCopywritingStats = $aiPosterStats['completed'];

        // Recent AI Content (for detailed view)
        $recentAIContent = AIGeneratedContent::with('user.umkmStore')
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($content) {
                return [
                    'id' => $content->id,
                    'type' => $content->type,
                    'status' => $content->status,
                    'user_name' => $content->user?->name ?? 'Unknown',
                    'store_name' => $content->user?->umkmStore?->name ?? '-',
                    'created_at' => $content->created_at->format('d M Y H:i'),
                    'result_preview' => $content->generated_result ? substr($content->generated_result, 0, 100) : null,
                ];
            });

        // === USER STATISTICS ===
        $userStats = [
            'total' => User::count(),
            'buyers' => User::where('role', 'buyer')->count(),
            'umkm' => User::where('role', 'umkm')->count(),
            'couriers' => User::where('role', 'courier')->count(),
            'affiliators' => User::where('role', 'affiliator')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'active_couriers' => User::where('role', 'courier')->where('is_courier_active', true)->count(),
            'this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
            'this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        // === UMKM STORE STATISTICS ===
        $storeStats = [
            'total' => UmkmStore::count(),
            'with_products' => UmkmStore::has('products')->count(),
            'with_orders' => UmkmStore::has('orders')->count(),
            'total_products' => Product::count(),
            'avg_products_per_store' => UmkmStore::count() > 0 ? round(Product::count() / UmkmStore::count(), 1) : 0,
        ];

        // Top performing stores
        $topStores = UmkmStore::withCount('orders')
            ->withSum('orders', 'total_amount')
            ->with('owner') // Eager load owner
            ->orderByDesc('orders_count')
            ->take(10)
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'owner' => $store->owner?->name ?? '-', // Use correct relationship
                    'orders_count' => $store->orders_count,
                    'total_revenue' => $store->orders_sum_total_amount ?? 0,
                    'products_count' => $store->products()->count(),
                ];
            });

        // === LANDING PAGE STATISTICS ===
        $landingPageStats = [
            'total' => UmkmLandingPage::count(),
            'published' => UmkmLandingPage::where('is_published', true)->count(),
            'with_products' => UmkmLandingPage::whereNotNull('products')
                ->where('products', '!=', '[]')
                ->where('products', '!=', '')
                ->count(),
        ];

        // Landing pages by template
        $landingByTemplate = UmkmLandingPage::select('template', DB::raw('count(*) as count'))
            ->groupBy('template')
            ->orderByDesc('count')
            ->get();

        // === ORDER STATISTICS ===
        $orderStats = [
            'total' => Order::count(),
            'completed' => Order::where('status', 'completed')->count(),
            'pending' => Order::whereNotIn('status', ['completed', 'cancelled'])->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
            'this_week_revenue' => Order::where('status', 'completed')
                ->where('created_at', '>=', now()->startOfWeek(\Carbon\Carbon::SUNDAY)) // Start week on Sunday
                ->sum('total_amount'),
            'this_month_revenue' => Order::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            'avg_order_value' => Order::where('status', 'completed')->count() > 0 
                ? round(Order::where('status', 'completed')->sum('total_amount') / Order::where('status', 'completed')->count(), 0)
                : 0,
        ];

        // === AFFILIATE STATISTICS ===
        $affiliateStats = [
            'total_affiliators' => User::where('role', 'affiliator')->count(),
            'total_rewards' => AffiliateReward::sum('amount'),
            'pending_rewards' => AffiliateReward::where('status', 'pending')->sum('amount'),
            'paid_rewards' => AffiliateReward::where('status', 'paid')->sum('amount'),
        ];

        // === COMPLAINT STATISTICS ===
        $complaintStats = [
            'total' => Complaint::count(),
            'pending' => Complaint::where('status', 'pending')->count(),
            'resolved' => Complaint::where('status', 'resolved')->count(),
        ];

        // === WITHDRAWAL STATISTICS ===
        $withdrawalStats = [
            'total_requests' => WithdrawalRequest::count(),
            'pending' => WithdrawalRequest::where('status', 'pending')->count(),
            'approved' => WithdrawalRequest::where('status', 'approved')->count(),
            'total_amount' => WithdrawalRequest::where('status', 'approved')->sum('amount'),
        ];

        // === PLATFORM SUMMARY (For Report Header) ===
        $platformSummary = [
            'app_name' => 'Marketplace Cipadung',
            'competition' => 'Innovillage 2025',
            'report_date' => now()->format('d F Y'),
            'report_time' => now()->format('H:i'),
            'total_users' => $userStats['total'],
            'total_umkm' => $userStats['umkm'],
            'total_transactions' => $orderStats['total'],
            'total_ai_content' => $aiVideoStats['total'] + $aiPosterStats['total'] + $aiCopywritingStats,
            'total_landing_pages' => $landingPageStats['total'],
        ];

        // === GROWTH CHART DATA (Last 30 days) ===
        $growthChart = [
            'users' => User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'orders' => Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count'),
                DB::raw('sum(total_amount) as revenue')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'ai_content' => AIGeneratedContent::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];

        return Inertia::render('admin/innovillage-reports', [
            'platformSummary' => $platformSummary,
            'aiVideoStats' => $aiVideoStats,
            'aiPosterStats' => $aiPosterStats,
            'aiCopywritingStats' => $aiCopywritingStats,
            'recentAIContent' => $recentAIContent,
            'userStats' => $userStats,
            'storeStats' => $storeStats,
            'topStores' => $topStores,
            'landingPageStats' => $landingPageStats,
            'landingByTemplate' => $landingByTemplate,
            'orderStats' => $orderStats,
            'affiliateStats' => $affiliateStats,
            'complaintStats' => $complaintStats,
            'withdrawalStats' => $withdrawalStats,
            'growthChart' => $growthChart,
        ]);
    }

    /**
     * Serve payment proof image securely.
     */
    public function showPaymentProof($filename)
    {
        $path = 'proofs/' . $filename;
        
        // Debug: Log to see what's happening
        $diskRoot = \Illuminate\Support\Facades\Storage::disk('local')->path('');
        $exists = \Illuminate\Support\Facades\Storage::disk('local')->exists($path);
        
        \Log::info('Admin showPaymentProof debug', [
            'filename' => $filename,
            'path' => $path,
            'disk_root' => $diskRoot,
            'exists' => $exists,
        ]);
        
        if (!$exists) {
            abort(404, 'File not found: ' . $path);
        }

        $file = \Illuminate\Support\Facades\Storage::disk('local')->get($path);
        $type = \Illuminate\Support\Facades\Storage::disk('local')->mimeType($path);

        return response($file, 200)->header('Content-Type', $type);
    }
}
