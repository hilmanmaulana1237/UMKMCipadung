<?php

namespace App\Http\Controllers;

use App\Models\AffiliateReward;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promo;
use App\Models\Setting;
use App\Models\UmkmStore;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /**
     * Check status of multiple stores.
     */
    public function checkStoreStatus(Request $request)
    {
        $request->validate([
            'store_ids' => 'required|array',
            'store_ids.*' => 'integer|exists:umkm_stores,id',
        ]);

        $statuses = [];
        $stores = UmkmStore::whereIn('id', $request->store_ids)->get();

        foreach ($stores as $store) {
            $statuses[$store->id] = [
                'is_open' => $store->is_open, // Use Accessor (Time Aware)
                'open_time' => $store->open_time ? \Carbon\Carbon::parse($store->open_time)->format('H:i') : null,
                'close_time' => $store->close_time ? \Carbon\Carbon::parse($store->close_time)->format('H:i') : '21:00',
                'admin_fee' => (int)$store->admin_fee,
            ];
        }

        return response()->json($statuses);
    }

    /**
     * Show checkout page.
     */
    public function index(Request $request)
    {
        // Get store info if store_id is provided
        $store = null;
        if ($request->has('store_id')) {
            $store = UmkmStore::find($request->store_id);
        }

        // Fetch Global Fees for Frontend Display
        $adminFee = DB::table('settings')->where('key', 'admin_fee')->value('value');
        $courierFee = DB::table('settings')->where('key', 'courier_fee')->value('value');

        return Inertia::render('checkout/index', [
            'store' => $store,
            'maintenanceMode' => Setting::isMaintenanceMode(),
            'adminFee' => $adminFee ? (int)$adminFee : 0, // Global App Fee
            'storeAdminFee' => ($store && $store->admin_fee) ? (int)$store->admin_fee : 0, // Store Service Fee
            'courierFee' => $courierFee ? (int)$courierFee : 10000,
        ]);
    }

    /**
     * Process checkout and create order.
     */
    public function store(Request $request)
    {
        // Check Maintenance Mode
        if (Setting::isMaintenanceMode()) {
            return back()->with('error', 'Sistem sedang dalam mode maintenance. Pemesanan sementara diblokir.');
        }

        $validated = $request->validate([
            'store_id' => 'required|exists:umkm_stores,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_lat' => 'nullable|numeric',
            'shipping_lng' => 'nullable|numeric',
            'promo_code' => 'nullable|string',
            'proof' => 'required|image|max:5120', // 5MB max
        ]);

        $store = UmkmStore::findOrFail($validated['store_id']);

        // Check if store is open (Time Aware)
        if (!$store->is_open) {
            $openTime = $store->open_time ? \Carbon\Carbon::parse($store->open_time)->format('H:i') : '08:00';
            return back()->withErrors(['store' => "Maaf, toko sedang tutup. Silakan checkout kembali besok jam $openTime."]); 
        }


        // Calculate totals
        $totalAmount = 0;
        $orderItems = [];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            
            if ($product->umkm_store_id !== $store->id) {
                return back()->withErrors(['items' => 'Produk tidak sesuai dengan toko.']);
            }

            if ($product->stock < $item['quantity']) {
                return back()->withErrors(['items' => "Stok {$product->name} tidak mencukupi. Hanya tersedia {$product->stock} item."]);
            }

            $orderItems[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ];

            $totalAmount += $product->price * $item['quantity'];
        }

        // Add admin fee if exists
        $adminFee = $store->admin_fee ?? 0;
        $totalAmount += $adminFee;

        // Store payment proof
        // SECURE: Use 'local' disk instead of 'public' so it's not accessible via URL directly
        $proofPath = $request->file('proof')->store('proofs', 'local');

        // Check if ALL products are digital (e-book, voucher, etc.)
        // Digital products don't need courier and auto-complete after verification
        $allDigital = true;
        foreach ($orderItems as $item) {
            $product = Product::find($item['product_id']);
            if ($product && !$product->is_digital) {
                $allDigital = false;
                break;
            }
        }

        // Fetch Global Settings
        $settingCourierFee = DB::table('settings')->where('key', 'courier_fee')->value('value');
        $baseCourierFee = $settingCourierFee ? (int)$settingCourierFee : 10000;
        
        $settingAdminFee = DB::table('settings')->where('key', 'admin_fee')->value('value');
        $globalAdminFee = $settingAdminFee ? (int)$settingAdminFee : 0;

        // === PROMO CODE VALIDATION (BEFORE TRANSACTION) ===
        $promo = null;
        $affiliator = null;
        if (!empty($validated['promo_code'])) {
            // Check if it's an Affiliate Code first
            $affiliator = User::where('affiliate_code', strtoupper($validated['promo_code']))->first();
            
            if (!$affiliator || $affiliator->id === auth()->id()) {
                // Not an affiliate code, check if it's a promo code
                $affiliator = null;
                $promo = Promo::where('code', strtoupper($validated['promo_code']))
                    ->where('is_active', true)
                    ->first();
                
                if (!$promo) {
                    return back()->withErrors(['promo_code' => 'Kode promo tidak valid atau sudah kadaluarsa.']);
                }

                if ($promo->used_count >= $promo->quota) {
                    return back()->withErrors(['promo_code' => 'Kuota promo sudah habis.']);
                }

                // Calculate items total (without fees) for min purchase check
                $itemsTotal = 0;
                foreach ($orderItems as $item) {
                    $itemsTotal += $item['price'] * $item['quantity'];
                }

                if ($itemsTotal < $promo->min_purchase) {
                    $minPurchase = number_format($promo->min_purchase, 0, ',', '.');
                    return back()->withErrors(['promo_code' => "Minimal belanja Rp {$minPurchase} belum terpenuhi. Total belanja Anda: Rp " . number_format($itemsTotal, 0, ',', '.') . "."]);
                }
            }
        }

        // Create order in transaction
        $order = DB::transaction(function () use ($validated, $store, $orderItems, $totalAmount, $proofPath, $allDigital, $baseCourierFee, $globalAdminFee, $promo, $affiliator) {
            
            // Logic: 
            // - total_amount sent from frontend is Product + Admin Fee (Transfer Amount).
            // - Courier Fee is PAID CASH to courier, unless Free Shipping promo is used.
            // - We store the calculated courier_fee in DB for record.

            $finalAdminFee = $globalAdminFee; 
            $finalStoreFee = $store->admin_fee ? (int)$store->admin_fee : 0;
            if ($finalStoreFee > 500) $finalStoreFee = 500;
            
            $courierFee = $allDigital ? 0 : $baseCourierFee;
            
            $itemsTotal = 0;
            foreach ($orderItems as $item) {
                $itemsTotal += $item['price'] * $item['quantity'];
            }
            // Total Transfer = Items + Global Admin Fee + Store Fee
            $finalTransferAmount = $itemsTotal + $finalAdminFee + $finalStoreFee;

            $order = Order::create([
                'buyer_id' => auth()->id(),
                'umkm_store_id' => $store->id,
                'status' => 'waiting_verification',
                'courier_status' => $allDigital ? 'not_required' : 'idle',
                'total_amount' => $finalTransferAmount, 
                'courier_fee' => $courierFee,
                'admin_fee' => $finalAdminFee,
                'store_fee' => $finalStoreFee,
                'admin_fee_status' => 'pending', // Default status for billing
                'payment_proof_path' => $proofPath,
                'shipping_address' => $validated['shipping_address'],
                'shipping_lat' => $validated['shipping_lat'] ?? null,
                'shipping_lng' => $validated['shipping_lng'] ?? null,
                'promo_code_used' => $validated['promo_code'] ?? null,
                'is_digital_order' => $allDigital,
            ]);

            // Create order items and decrease stock
            foreach ($orderItems as $item) {
                $order->items()->create($item);
                Product::where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            // Handle Promo Code (already validated before transaction)
            $discountAmount = 0;
            $shippingDiscount = 0;
            $promoId = null;
            $finalTotal = $finalTransferAmount; // Start with ALL fees included
            
            // Re-fetch base courier fee just in case, though locally available
            $currentCourierFee = $baseCourierFee; 

            if (!empty($validated['promo_code'])) {
                // Use pre-validated $affiliator from outer scope
                if ($affiliator && $affiliator->id !== auth()->id()) {
                    AffiliateReward::create([
                        'affiliate_id' => $affiliator->id,
                        'order_id' => $order->id,
                        'amount' => AffiliateReward::COMMISSION_AMOUNT,
                        'status' => 'potential',
                    ]);
                } elseif ($promo) {
                    $promoId = $promo->id;
                    
                    if ($promo->type === 'free_shipping') {
                        // For free shipping, we discount the COURIER FEE (Cash), not the TRANSFER AMOUNT.
                        // So $finalTotal (Transfer) remains same.
                        // We just record the discount.
                        $discount = min($currentCourierFee, $promo->value);
                        $shippingDiscount = $discount;
                        $discountAmount = $discount; // For stats
                    } elseif ($promo->type === 'discount') {
                        // For product discount, we reduce the TRANSFER AMOUNT.
                        $discount = min($finalTotal, $promo->value);
                        $finalTotal -= $discount;
                        $discountAmount = $discount;
                    }

                    // Increment used count
                    $promo->increment('used_count');
                }
            }

            // Update order with final amounts if changed by promo
            if ($promoId) {
                $order->update([
                    'courier_fee' => $allDigital ? 0 : $currentCourierFee,
                    'total_amount' => $finalTotal,
                    'shipping_discount' => $shippingDiscount,
                    'promo_code_used' => $validated['promo_code'],
                ]);
            }

            return $order;
        });

        // Send WhatsApp notification to seller
        try {
            $order->load(['store', 'buyer', 'items.product']);
            $storeContact = $order->store?->contact_number;
            
            $token = \App\Models\Setting::get('fonnte_api_token');
            $enabled = \App\Models\Setting::get('whatsapp_notifications_enabled', 'false');
            
            if ($storeContact && $token && ($enabled === 'true' || $enabled === true)) {
                $phone = preg_replace('/[^0-9]/', '', $storeContact);
                if (str_starts_with($phone, '0')) {
                    $phone = '62' . substr($phone, 1);
                }
                if (!str_starts_with($phone, '62')) {
                    $phone = '62' . $phone;
                }
                
                $itemsList = '';
                foreach ($order->items as $item) {
                    $itemsList .= "- {$item->product->name} x{$item->quantity} - Rp " . number_format($item->price * $item->quantity, 0, ',', '.') . "\n";
                }
                
                $message = "*PESANAN BARU!*\n\n";
                $message .= "Halo kak {$order->store->name}, ada pesanan masuk!\n\n";
                $message .= "*Order:* #{$order->order_number}\n";
                $message .= "*Pembeli:* {$order->buyer->name}\n";
                $message .= "*Alamat:* {$order->shipping_address}\n";
                $message .= "*Total:* Rp " . number_format($order->total_amount, 0, ',', '.') . "\n\n";
                $message .= "*Detail Pesanan:*\n{$itemsList}\n";
                $message .= "Segera cek aplikasi untuk verifikasi!\n\n";
                $message .= "---\n_Pesan otomatis dari UMKM Cipadung_";
                
                \Illuminate\Support\Facades\Http::withHeaders([
                    'Authorization' => $token,
                ])->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => $message,
                    'countryCode' => '62',
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp notification failed: ' . $e->getMessage());
        }

        return redirect()->route('orders.status', $order)
            ->with('success', 'Pesanan berhasil dibuat! Menunggu verifikasi penjual.');
    }

    /**
     * Show order status page.
     */
    public function status(Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        $order->load(['store', 'items.product', 'courier', 'review']);

        // Inject Shipping Discount for Frontend Display
        $order->shipping_discount = 0;
        if ($order->promo_code_used) {
            $promo = Promo::where('code', $order->promo_code_used)->first();
            if ($promo && $promo->type === 'free_shipping') {
                $order->shipping_discount = min($order->courier_fee, $promo->value);
            }
        }

        // Check if order has been waiting too long (more than 2 hours)
        $waitingTooLong = false;
        if ($order->status === 'waiting_verification') {
            $hoursSinceCreated = now()->diffInHours($order->created_at);
            $waitingTooLong = $hoursSinceCreated >= 2;
        }

        // Check if user can review this order (old sentiment system)
        $canReview = $order->status === 'completed' && !$order->review;
        
        // Check if user can rate (new star rating system)
        $ratingInfo = \App\Http\Controllers\RatingController::canRate($order, auth()->id());
        
        // Get courier rating info for display during delivery
        $courierRating = null;
        if ($order->courier) {
            $courierRating = [
                'average' => $order->courier->courier_average_rating,
                'total' => $order->courier->courier_total_ratings,
            ];
        }
        
        // Get store rating info
        $storeRating = null;
        if ($order->store) {
            $storeRating = [
                'average' => $order->store->average_rating,
                'total' => $order->store->total_ratings,
            ];
        }

        return Inertia::render('checkout/status', [
            'order' => $order,
            'waitingTooLong' => $waitingTooLong,
            'canReview' => $canReview,
            'canRateCourier' => $ratingInfo['canRateCourier'],
            'canRateStore' => $ratingInfo['canRateStore'],
            'canRate' => $ratingInfo['canRate'],
            'courierRating' => $courierRating,
            'storeRating' => $storeRating,
        ]);
    }

    /**
     * Cancel order by buyer (only for waiting_verification status).
     * Buyer must get refund from seller offline.
     */
    public function cancelOrder(Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== 'waiting_verification') {
            return back()->with('error', 'Hanya bisa membatalkan pesanan yang menunggu verifikasi.');
        }

        // Generate cancellation code for refund claim
        $cancellationCode = 'BTL-' . strtoupper(substr(md5($order->id . now()), 0, 8));

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_code' => $cancellationCode,
            'cancelled_by' => 'buyer',
        ]);

        // Restore product stock
        foreach ($order->items as $item) {
            Product::where('id', $item->product_id)
                ->increment('stock', $item->quantity);
        }

        return redirect()->route('orders.status', $order)
            ->with('success', 'Pesanan dibatalkan. Tunjukkan kode ke penjual untuk pengembalian dana.');
    }
}
