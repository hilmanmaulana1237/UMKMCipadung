<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AffiliateController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\CourierController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UmkmController;
use App\Http\Controllers\LandingPageController;
use App\Models\Order;
use App\Http\Middleware\RoleCheck;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Public Landing Page (No Auth Required)
Route::get('/toko/{slug}', [LandingPageController::class, 'show'])->name('landingpage.show');

// Landing Page Management (Auth Required)
Route::middleware(['auth'])->prefix('umkm/landing-page')->group(function () {
    Route::post('/', [LandingPageController::class, 'store'])->name('landingpage.store');
    Route::delete('/{id}', [LandingPageController::class, 'destroy'])->name('landingpage.destroy');
    Route::post('/generate-content', [LandingPageController::class, 'generateContent'])->name('landingpage.generate');
});

// Universal Payment Proof Route (Any authenticated user can access)
Route::middleware(['auth'])->group(function () {
    Route::get('proofs/{filename}', function ($filename) {
        $path = 'proofs/' . $filename;
        
        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
            abort(404, 'File not found');
        }

        $file = \Illuminate\Support\Facades\Storage::disk('local')->get($path);
        $type = \Illuminate\Support\Facades\Storage::disk('local')->mimeType($path);

        return response($file, 200)->header('Content-Type', $type);
    })->where('filename', '.*')->name('proofs.show');
});

Route::get('/', function () {
    $featuredStores = \App\Models\UmkmStore::query()
        ->where('is_active', true)
        ->withCount('products')
        ->with(['products' => function($q) {
            $q->where('is_active', true)->take(4);
        }])
        ->inRandomOrder()
        ->take(6)
        ->get();

    // Fallback dummy data for featuredStores if no active stores
    if ($featuredStores->isEmpty()) {
        $featuredStores = collect([
            (object) [
                'id' => 1,
                'name' => 'Warung Sembako Bu Iti',
                'category' => 'kuliner',
                'logo_path' => null,
                'products_count' => 15,
                'products' => [
                    (object) ['id' => 1, 'name' => 'Beras Premium 5kg', 'price' => 75000, 'image_path' => null],
                    (object) ['id' => 2, 'name' => 'Minyak Goreng 2L', 'price' => 35000, 'image_path' => null],
                    (object) ['id' => 3, 'name' => 'Gula Pasir 1kg', 'price' => 18000, 'image_path' => null],
                ],
            ],
            (object) [
                'id' => 2,
                'name' => 'Cuci Rapi Laundry',
                'category' => 'jasa',
                'logo_path' => null,
                'products_count' => 7,
                'products' => [
                    (object) ['id' => 4, 'name' => 'Cuci Kiloan', 'price' => 7000, 'image_path' => null],
                    (object) ['id' => 5, 'name' => 'Setrika Only', 'price' => 5000, 'image_path' => null],
                    (object) ['id' => 6, 'name' => 'Express 6 Jam', 'price' => 15000, 'image_path' => null],
                ],
            ],
            (object) [
                'id' => 3,
                'name' => 'Kerajinan Bambu Asli',
                'category' => 'kriya',
                'logo_path' => null,
                'products_count' => 12,
                'products' => [
                    (object) ['id' => 7, 'name' => 'Keranjang Bambu', 'price' => 45000, 'image_path' => null],
                    (object) ['id' => 8, 'name' => 'Tikar Anyaman', 'price' => 85000, 'image_path' => null],
                    (object) ['id' => 9, 'name' => 'Vas Bambu', 'price' => 35000, 'image_path' => null],
                ],
            ],
        ]);
    }

    // 1. Get Top Rated Active Stores
    $topRatedStores = \App\Models\UmkmStore::query()
        ->where('is_active', true)
        ->withAvg('ratings', 'stars')
        ->withCount('ratings')
        ->orderByDesc('ratings_avg_stars')
        ->orderByDesc('ratings_count')
        ->take(3)
        ->get();

    // 2. If fewer than 3, fill with Random Active Stores to showcase more UMKM
    if ($topRatedStores->count() < 3) {
        $existingIds = $topRatedStores->pluck('id');
        $randomStores = \App\Models\UmkmStore::query()
            ->where('is_active', true)
            ->whereNotIn('id', $existingIds)
            ->withAvg('ratings', 'stars')
            ->withCount('ratings')
            ->inRandomOrder()
            ->take(3 - $topRatedStores->count())
            ->get();
        
        $topRatedStores = $topRatedStores->merge($randomStores);
    }

    // 3. Fallback Dummy Data (ONLY if no active stores exist at all)
    // This ensures the section is visible for development/demo purposes
    if ($topRatedStores->isEmpty()) {
        $topRatedStores = collect([
            (object) [
                'id' => 1,
                'name' => 'Dapur Bu Aminah',
                'category' => 'kuliner',
                'logo_path' => null, // Will use default emoji
                'store_photo_path' => null,
                'banner_path' => null,
                'ratings_avg_stars' => 5.0,
                'ratings_count' => 128,
                'slug' => 'dapur-bu-aminah'
            ],
            (object) [
                'id' => 2,
                'name' => 'Kerajinan Bambu Cipadung',
                'category' => 'kriya',
                'logo_path' => null, 
                'store_photo_path' => null,
                'banner_path' => null,
                'ratings_avg_stars' => 4.9,
                'ratings_count' => 85,
                'slug' => 'kerajinan-bambu'
            ],
            (object) [
                'id' => 3,
                'name' => 'Jasa Servis Elektronik',
                'category' => 'jasa',
                'logo_path' => null,
                'store_photo_path' => null,
                'banner_path' => null,
                'ratings_avg_stars' => 4.8,
                'ratings_count' => 64,
                'slug' => 'servis-elektronik'
            ]
        ]);
    }
    
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'featuredStores' => $featuredStores,
        'topRatedStores' => $topRatedStores,
    ]);
})->name('home');



/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Marketplace (Authenticated)
    Route::prefix('marketplace')->name('marketplace.')->middleware(['block.role:courier'])->group(function () {
        Route::get('/', [MarketplaceController::class, 'index'])->name('index');
        Route::get('/search', [MarketplaceController::class, 'search'])->name('search');
        Route::get('/product/{product}', [MarketplaceController::class, 'show'])->name('product');
        Route::get('/store/{store}', [MarketplaceController::class, 'store'])->name('store');
        
        // AI Shopping Assistant
        Route::get('/ai-assistant', [\App\Http\Controllers\ShoppingAssistantController::class, 'index'])->name('ai-assistant');
        Route::post('/ai-assistant/chat', [\App\Http\Controllers\ShoppingAssistantController::class, 'chat'])->name('ai-assistant.chat');
    });

    // Universal Dashboard - redirects based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        return match ($user->role) {
            'umkm' => redirect()->route('umkm.dashboard'),
            'courier' => redirect()->route('courier.radar'),
            'affiliator' => redirect()->route('affiliate.dashboard'),
            'admin' => redirect()->route('admin.dashboard'),
            default => redirect()->route('marketplace.index'), // Buyers go to marketplace
        };
    })->name('dashboard');

    // Profile/Wallet (All roles)
    Route::get('profile', function () {
        $user = auth()->user();
        $totalRevenue = 0;
        
        // Calculate total revenue for UMKM users
        if ($user->role === 'umkm' && $user->umkmStore) {
            $totalRevenue = $user->umkmStore->orders()
                ->where('status', 'completed')
                ->sum('total_amount');
        }
        
        return Inertia::render('profile/index', [
            'totalRevenue' => $totalRevenue,
        ]);
    })->name('profile');

    Route::get('wallet', function () {
        $user = auth()->user();

        // Redirect buyers to profile as they don't have wallet feature
        if ($user->role === 'buyer') {
            return redirect()->route('profile');
        }        
        
        // Get courier delivery history if user is a courier
        $courierDeliveries = [];
        $courierStats = null;
        
        if ($user->role === 'courier') {
            $courierDeliveries = Order::with(['store', 'buyer'])
                ->where('courier_id', $user->id)
                ->where('courier_status', 'delivered')
                ->orderBy('updated_at', 'desc')
                ->take(20)
                ->get();
                
            $courierStats = [
                'totalDeliveries' => Order::where('courier_id', $user->id)
                    ->where('courier_status', 'delivered')
                    ->count(),
                'totalEarnings' => Order::where('courier_id', $user->id)
                    ->where('courier_status', 'delivered')
                    ->sum('courier_fee'),
                'thisMonthEarnings' => Order::where('courier_id', $user->id)
                    ->where('courier_status', 'delivered')
                    ->whereMonth('updated_at', now()->month)
                    ->whereYear('updated_at', now()->year)
                    ->sum('courier_fee'),
            ];
        }

        // Get withdrawal requests for couriers and affiliators
        $withdrawalRequests = [];
        if (in_array($user->role, ['courier', 'affiliator'])) {
            $withdrawalRequests = \App\Models\WithdrawalRequest::where('user_id', $user->id)
                ->latest()
                ->take(10)
                ->get();
        }
        
        return Inertia::render('wallet/index', [
            'balance' => $user->wallet_balance,
            'courierDeliveries' => $courierDeliveries,
            'courierStats' => $courierStats,
            'userRole' => $user->role,
            'withdrawalRequests' => $withdrawalRequests,
            'canWithdraw' => in_array($user->role, ['courier', 'affiliator']),
        ]);
    })->name('wallet');

    // Withdrawal Request
    Route::post('wallet/withdraw', function () {
        $user = auth()->user();
        
        if (!in_array($user->role, ['courier', 'affiliator'])) {
            return back()->with('error', 'Anda tidak dapat melakukan penarikan.');
        }

        $validated = request()->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string|max:100',
            'bank_account' => 'required|string|max:50',
            'bank_holder' => 'required|string|max:100',
        ]);

        if ($validated['amount'] > $user->wallet_balance) {
            return back()->with('error', 'Saldo tidak mencukupi.');
        }

        // Check if there's pending withdrawal
        $pendingExists = \App\Models\WithdrawalRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($pendingExists) {
            return back()->with('error', 'Anda masih memiliki permintaan penarikan yang menunggu.');
        }

        \App\Models\WithdrawalRequest::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'bank_account' => $validated['bank_account'],
            'bank_holder' => $validated['bank_holder'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permintaan penarikan berhasil diajukan! Dana akan ditransfer setelah disetujui admin.');
    })->name('wallet.withdraw');

    // AI Chat (UMKM Mentor - only for UMKM)
    Route::middleware([RoleCheck::class . ':umkm'])->group(function () {
        Route::get('search', function () {
            return Inertia::render('search/index');
        })->name('search');
    });

    /*
    |--------------------------------------------------------------------------
    | Buyer-Only Routes (blocked for courier, umkm, affiliator)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['block.role:courier,umkm,affiliator,admin'])->group(function () {
        // Order History (Buyer)
        Route::get('history', function () {
            $orders = auth()->user()->orders()
                ->with(['store', 'items.product'])
                ->latest()
                ->paginate(10);
            return Inertia::render('buyer/history', ['orders' => $orders]);
        })->name('history');

        // Checkout
        Route::prefix('checkout')->name('checkout.')->group(function () {
            Route::get('/', [CheckoutController::class, 'index'])->name('index');
            // Throttled: 5 requests per minute to prevent spam orders
            Route::post('/', [CheckoutController::class, 'store'])->middleware(['maintenance', 'throttle:5,1'])->name('store');
            Route::post('/check-status', [CheckoutController::class, 'checkStoreStatus'])->name('check-status');
        });

        Route::get('orders/{order}/status', [CheckoutController::class, 'status'])->name('orders.status');
        Route::post('orders/{order}/cancel', [CheckoutController::class, 'cancelOrder'])->name('orders.cancel');

        // Validate promo code (AJAX) - Throttled: 10 per minute
        Route::post('promo/validate', [AffiliateController::class, 'validateCode'])
            ->middleware('throttle:10,1')
            ->name('promo.validate');

        // Review routes
        Route::post('orders/{order}/review', [\App\Http\Controllers\ReviewController::class, 'store'])->name('orders.review');
        Route::get('stores/{store}/reviews', [\App\Http\Controllers\ReviewController::class, 'index'])->name('stores.reviews');
        
        // Star Rating routes
        Route::post('orders/{order}/rate', [\App\Http\Controllers\RatingController::class, 'store'])->name('orders.rate');

        // Complaint routes
        Route::prefix('complaints')->name('complaints.')->group(function () {
            Route::get('/', [ComplaintController::class, 'index'])->name('index');
            Route::get('create/{order}', [ComplaintController::class, 'create'])->name('create');
            Route::post('/', [ComplaintController::class, 'store'])->name('store');
            Route::get('{complaint}', [ComplaintController::class, 'show'])->name('show');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | UMKM Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware([RoleCheck::class . ':umkm'])->prefix('umkm')->name('umkm.')->group(function () {
        Route::get('dashboard', [UmkmController::class, 'dashboard'])->name('dashboard');
        
        // Store Setup
        Route::get('setup-toko', [UmkmController::class, 'storeSetup'])->name('store.setup');
        Route::post('store', [UmkmController::class, 'storeUpdate'])->name('store.update');
        
        // Orders
        Route::get('orders', [UmkmController::class, 'orders'])->name('orders');
        Route::get('orders/{order}', [UmkmController::class, 'orderDetail'])->name('orders.detail');
        Route::post('orders/{order}/verify', [UmkmController::class, 'verifyOrder'])->name('orders.verify');
        Route::post('orders/{order}/ready', [UmkmController::class, 'readyToShip'])->name('orders.ready');
        Route::post('orders/{order}/reject', [UmkmController::class, 'rejectOrder'])->name('orders.reject');
        Route::post('orders/{order}/complete-digital', [UmkmController::class, 'completeDigitalOrder'])->name('orders.complete-digital');
        Route::get('proofs/{filename}', [UmkmController::class, 'showProof'])->name('proofs.show');
        
        // Analytics
        Route::get('analytics', [UmkmController::class, 'analytics'])->name('analytics');
        
        // Store Open Toggle
        Route::post('store/toggle-open', [UmkmController::class, 'toggleOpen'])->name('store.toggle-open');
    });

    // Products (UMKM)
    Route::middleware([RoleCheck::class . ':umkm'])->group(function () {
        Route::resource('products', ProductController::class);
        Route::post('products/{product}/toggle', [ProductController::class, 'toggleActive'])->name('products.toggle');
    });

    /*
    |--------------------------------------------------------------------------
    | Courier Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware([RoleCheck::class . ':courier'])->prefix('courier')->name('courier.')->group(function () {
        Route::get('radar', [CourierController::class, 'radar'])->name('radar');
        Route::post('toggle', [CourierController::class, 'toggleActive'])->name('toggle');
        Route::post('location', [CourierController::class, 'updateLocation'])->name('update-location');
        Route::post('jobs/{order}/accept', [CourierController::class, 'acceptJob'])->name('jobs.accept');
        
        Route::get('active', [CourierController::class, 'activeTrip'])->name('active');
        Route::get('history', [CourierController::class, 'history'])->name('history');
        Route::post('orders/{order}/pickup-otw', [CourierController::class, 'pickupOtw'])->name('orders.pickup-otw');
        Route::post('orders/{order}/picked-up', [CourierController::class, 'pickedUp'])->name('orders.picked-up');
        Route::post('orders/{order}/complete', [CourierController::class, 'complete'])->name('orders.complete');
        Route::post('orders/{order}/cancel', [CourierController::class, 'cancelOrder'])->name('orders.cancel');
        
        // AI Insights
        Route::get('ai-insights', [\App\Http\Controllers\CourierAIController::class, 'insights'])->name('ai-insights');
        
        // Check active order (for logout warning)
        Route::get('check-active-order', function () {
            $user = auth()->user();
            $activeOrder = \App\Models\Order::where('courier_id', $user->id)
                ->whereIn('courier_status', ['driver_assigned', 'pickup_otw', 'delivery_otw'])
                ->first();
            
            return response()->json([
                'has_active_order' => (bool) $activeOrder,
                'order' => $activeOrder ? [
                    'id' => $activeOrder->id,
                    'order_number' => $activeOrder->order_number,
                    'courier_status' => $activeOrder->courier_status,
                ] : null,
            ]);
        })->name('check-active-order');
    });

    /*
    |--------------------------------------------------------------------------
    | Affiliate Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware([RoleCheck::class . ':affiliator'])->prefix('affiliate')->name('affiliate.')->group(function () {
        Route::get('dashboard', [AffiliateController::class, 'dashboard'])->name('dashboard');
        Route::get('share', [AffiliateController::class, 'share'])->name('share');
        Route::post('code', [AffiliateController::class, 'generateCode'])->name('code');
    });

    /*
    |--------------------------------------------------------------------------
    | AI Feature Routes (UMKM Only)
    |--------------------------------------------------------------------------
    */
    Route::middleware([RoleCheck::class . ':umkm'])->prefix('ai')->name('ai.')->group(function () {
        Route::post('/generate-description', [\App\Http\Controllers\AIController::class, 'generateDescription'])->name('generate-description');
        Route::post('/suggest-price', [\App\Http\Controllers\AIController::class, 'suggestPrice'])->name('suggest-price');
        Route::get('/insights', [\App\Http\Controllers\AIController::class, 'getInsights'])->name('insights');
        Route::post('/smart-replies', [\App\Http\Controllers\AIController::class, 'getSmartReplies'])->name('smart-replies');
        Route::get('/bundle-suggestions', [\App\Http\Controllers\AIController::class, 'getBundleSuggestions'])->name('bundle-suggestions');
        Route::get('/sentiment', [\App\Http\Controllers\AIController::class, 'getSentiment'])->name('sentiment');
        Route::get('/trending', [\App\Http\Controllers\AIController::class, 'getTrending'])->name('trending');
    });

    // UMKM Advanced AI Features
    Route::middleware([RoleCheck::class . ':umkm'])->prefix('umkm')->name('umkm.')->group(function () {
        // AI Mentor
        Route::get('ai-mentor', [\App\Http\Controllers\AIChatController::class, 'index'])->name('ai-mentor.index');
        Route::post('ai-mentor', [\App\Http\Controllers\AIChatController::class, 'store'])->name('ai-mentor.store');
        Route::get('ai-mentor/{id}', [\App\Http\Controllers\AIChatController::class, 'show'])->name('ai-mentor.chat');
        Route::post('ai-mentor/{id}/message', [\App\Http\Controllers\AIChatController::class, 'sendMessage'])->name('ai-mentor.message');

        // AI Content Generator
        Route::get('ai-content', [\App\Http\Controllers\AIContentController::class, 'index'])->name('ai-content.index');
        Route::post('ai-content/video-script', [\App\Http\Controllers\AIContentController::class, 'generateVideoScript'])->name('ai-content.video');
        Route::post('ai-content/video-prompt', [\App\Http\Controllers\AIContentController::class, 'generateVideoPrompt'])->name('ai-content.video-prompt');
        Route::post('ai-content/generate-video-description', [\App\Http\Controllers\AIContentController::class, 'generateVideoDescription'])->name('ai-content.generate-video-description');
        Route::post('ai-content/generate-video', [\App\Http\Controllers\AIContentController::class, 'generateVideo'])->name('ai-content.generate-video');
        Route::post('ai-content/check-video-status', [\App\Http\Controllers\AIContentController::class, 'checkVideoStatus'])->name('ai-content.check-video-status');
        Route::post('ai-content/poster', [\App\Http\Controllers\AIContentController::class, 'generatePoster'])->name('ai-content.poster');
        
        // AI Poster Generator (New Template-Based)
        Route::get('ai-content/poster-templates', [\App\Http\Controllers\AIContentController::class, 'getPosterTemplates'])->name('ai-content.poster-templates');
        Route::post('ai-content/generate-poster-template', [\App\Http\Controllers\AIContentController::class, 'generatePosterFromTemplate'])->name('ai-content.generate-poster-template');
        Route::post('ai-content/check-poster-status', [\App\Http\Controllers\AIContentController::class, 'checkPosterStatus'])->name('ai-content.check-poster-status');
        Route::post('ai-content/generate-poster-copywriting', [\App\Http\Controllers\AIContentController::class, 'generatePosterCopywriting'])->name('ai-content.generate-poster-copywriting');

        // AI Landing Page Generator
        Route::get('landing-page', [LandingPageController::class, 'index'])->name('landing-page.index');
        Route::post('landing-page', [LandingPageController::class, 'store'])->name('landing-page.store');
        Route::get('landing-page/preview/{id}', [LandingPageController::class, 'preview'])->name('landing-page.preview');
        Route::delete('landing-page/{id}', [LandingPageController::class, 'destroy'])->name('landing-page.destroy');
        Route::post('landing-page/generate-content', [LandingPageController::class, 'generateContent'])->name('landing-page.generate-content');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    // Public route for admin to view proofs (outside auth check so any logged-in user can view)
    Route::middleware(['auth'])->prefix('admin')->group(function () {
        Route::get('proofs/{filename}', [AdminController::class, 'showPaymentProof'])->where('filename', '.*')->name('admin.proofs.show');
    });
    
    Route::middleware([RoleCheck::class . ':admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        // Users
        Route::get('users', [AdminController::class, 'users'])->name('users');
        Route::get('users/create', [AdminController::class, 'createUser'])->name('users.create');
        Route::post('users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::get('users/{user}', [AdminController::class, 'userDetail'])->name('users.show');
        
        // Stores
        Route::get('stores', [AdminController::class, 'stores'])->name('stores');
        Route::get('stores/{store}', [AdminController::class, 'storeDetail'])->name('stores.show');
        
        // Orders
        Route::get('orders', [AdminController::class, 'orders'])->name('orders');
        Route::get('orders/{order}', [AdminController::class, 'orderDetail'])->name('orders.show');
        Route::post('orders/{order}/resolve', [AdminController::class, 'resolveOrder'])->name('orders.resolve');
        
        // Couriers
        Route::get('couriers', [AdminController::class, 'couriers'])->name('couriers');
        Route::get('couriers/{courier}', [AdminController::class, 'courierDetail'])->name('couriers.show');
        Route::post('couriers/{courier}/toggle-status', [AdminController::class, 'toggleCourierStatus'])->name('couriers.toggle-status');
        
        // Complaints
        Route::get('complaints', [AdminController::class, 'complaints'])->name('complaints');
        Route::post('complaints/{complaint}/respond', [AdminController::class, 'complaintRespond'])->name('complaints.respond');
        
        // Promos
        Route::get('promos', [AdminController::class, 'promos'])->name('promos');
        Route::post('promos', [AdminController::class, 'storePromo'])->name('promos.store');
        Route::delete('promos/{promo}', [AdminController::class, 'destroyPromo'])->name('promos.destroy');
        
        // Secure File Serving
        Route::get('proofs/{filename}', [AdminController::class, 'showProof'])->name('admin.proofs.show');

        // Affiliates
        Route::get('affiliates', [AdminController::class, 'affiliates'])->name('affiliates');
        
        // Withdrawals
        Route::get('withdrawals', [AdminController::class, 'withdrawals'])->name('withdrawals');
        Route::post('withdrawals/{withdrawal}/approve', [AdminController::class, 'approveWithdrawal'])->name('withdrawals.approve');
        Route::post('withdrawals/{withdrawal}/reject', [AdminController::class, 'rejectWithdrawal'])->name('withdrawals.reject');
        
        // API Settings
        Route::get('settings/api', [AdminController::class, 'apiSettings'])->name('settings.api');
        Route::post('settings/api', [AdminController::class, 'saveApiSettings'])->name('settings.api.save');
        Route::post('settings/api/test', [AdminController::class, 'testApi'])->name('settings.api.test');
        
        // General Settings
        Route::get('settings', [AdminController::class, 'generalSettings'])->name('settings');
        Route::post('settings/maintenance/toggle', [AdminController::class, 'toggleMaintenance'])->name('settings.maintenance.toggle');
        
        // Database Backups
        Route::get('database', [App\Http\Controllers\Admin\BackupController::class, 'index'])->name('database.index');
        Route::post('database', [App\Http\Controllers\Admin\BackupController::class, 'store'])->name('database.store');
        Route::get('database/{backup}/download', [App\Http\Controllers\Admin\BackupController::class, 'download'])->name('database.download');
        Route::post('database/restore', [App\Http\Controllers\Admin\BackupController::class, 'restore'])->name('database.restore');
        Route::delete('database/{backup}', [App\Http\Controllers\Admin\BackupController::class, 'destroy'])->name('database.destroy');

        // Service Fees
        Route::get('service-fees', [App\Http\Controllers\Admin\ServiceFeeController::class, 'index'])->name('service-fees');
        Route::post('service-fees/{store}/bill', [App\Http\Controllers\Admin\ServiceFeeController::class, 'markAsBilled'])->name('service-fees.bill');

        // AI Assistant
        Route::get('ai-assistant', [AdminController::class, 'aiAssistant'])->name('ai-assistant');
        Route::post('ai-assistant/chat', [AdminController::class, 'aiAssistantChat'])->name('ai-assistant.chat');

        // Innovillage Competition Reports
        Route::get('innovillage-reports', [AdminController::class, 'innovillageReports'])->name('innovillage-reports');

        // Poster Templates Management
        Route::get('poster-templates', [App\Http\Controllers\Admin\PosterTemplateController::class, 'index'])->name('poster-templates.index');
        Route::post('poster-templates', [App\Http\Controllers\Admin\PosterTemplateController::class, 'store'])->name('poster-templates.store');
        Route::delete('poster-templates/{posterTemplate}', [App\Http\Controllers\Admin\PosterTemplateController::class, 'destroy'])->name('poster-templates.destroy');
    });
});

require __DIR__.'/settings.php';
