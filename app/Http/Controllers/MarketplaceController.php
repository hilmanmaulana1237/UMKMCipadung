<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\UmkmStore;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    /**
     * Show marketplace index with stores and their products.
     */
    public function index(Request $request)
    {
        $query = Product::with('store')
            ->active()
            ->inStock();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by store
        if ($request->has('store')) {
            $query->where('umkm_store_id', $request->store);
        }

        // Get user location for distance calculation
        $userLat = $request->filled('lat') ? floatval($request->lat) : null;
        $userLng = $request->filled('lng') ? floatval($request->lng) : null;
        $sortBy = $request->get('sort', 'latest'); // nearest, popular, latest

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('store', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    });
            });


            // Search for stores matching the name (limit to 1 as requested)
            $stores = UmkmStore::with([
                'products' => function ($q) {
                    $q->active()->inStock()->latest()->take(4);
                }
            ])
                ->where('name', 'like', "%{$search}%")
                ->take(1)
                ->get()
                ->map(function ($store) use ($userLat, $userLng) {
                    $distance = null;
                    if ($userLat && $userLng && $store->latitude && $store->longitude) {
                        $distance = $this->calculateDistance($userLat, $userLng, $store->latitude, $store->longitude);
                    }
                    return [
                        'id' => $store->id,
                        'name' => $store->name,
                        'description' => $store->description,
                        'products' => $store->products,
                        'product_count' => $store->products()->active()->inStock()->count(),
                        'average_rating' => $store->average_rating,
                        'total_ratings' => $store->total_ratings,
                        'is_open' => $store->isOpen(),
                        'is_open_today' => $store->is_open_today,
                        'open_time' => $store->open_time?->format('H:i'),
                        'close_time' => $store->close_time?->format('H:i'),
                        'distance_km' => $distance,
                        'orders_count' => $store->orders()->where('status', 'completed')->count(),
                    ];
                });
        } else {
            // Fetch stores with their products for per-store layout (only if not searching)
            $stores = UmkmStore::with([
                'products' => function ($q) use ($request) {
                    $q->active()->inStock()->latest();

                    if ($request->has('category')) {
                        $q->where('category', $request->category);
                    }

                    $q->take(4);
                }
            ])
                ->where(function ($query) use ($request) {
                    // Filter by products having the category
                    $query->whereHas('products', function ($q) use ($request) {
                        $q->active()->inStock();

                        if ($request->has('category')) {
                            $q->where('category', $request->category);
                        }
                    });

                    // OR if the store itself has the category (new feature)
                    if ($request->has('category')) {
                        $query->orWhere('category', $request->category);
                    }
                })
                ->get()
                ->map(function ($store) use ($userLat, $userLng) {
                    $distance = null;
                    if ($userLat && $userLng && $store->latitude && $store->longitude) {
                        $distance = $this->calculateDistance($userLat, $userLng, $store->latitude, $store->longitude);
                    }
                    return [
                        'id' => $store->id,
                        'name' => $store->name,
                        'description' => $store->description,
                        'products' => $store->products,
                        'product_count' => $store->products()->active()->inStock()->count(),
                        'average_rating' => $store->average_rating,
                        'total_ratings' => $store->total_ratings,
                        'is_open' => $store->isOpen(),
                        'is_open_today' => $store->is_open_today,
                        'open_time' => $store->open_time?->format('H:i'),
                        'close_time' => $store->close_time?->format('H:i'),
                        'distance_km' => $distance,
                        'orders_count' => $store->orders()->where('status', 'completed')->count(),
                    ];
                });

            // Apply sorting based on sort parameter
            $stores = match ($sortBy) {
                'nearest' => $stores->sortBy(function ($store) {
                        // Put stores without distance at the end
                        return $store['distance_km'] ?? 9999;
                    })->values(),
                'popular' => $stores->sortByDesc('orders_count')->values(),
                default => $stores->shuffle()->sortByDesc('is_open')->values(), // latest: open stores first, but randomized
            };
        }

        $products = $query->latest()->paginate(12);

        $categories = [
            ['id' => 'kuliner', 'name' => 'Kuliner', 'icon' => '🍜'],
            ['id' => 'kriya', 'name' => 'Kriya', 'icon' => '🎨'],
            ['id' => 'jasa', 'name' => 'Jasa', 'icon' => '🛠️'],
        ];

        return Inertia::render('marketplace/index', [
            'products' => $products,
            'stores' => $stores,
            'categories' => $categories,
            'filters' => [
                'category' => $request->category,
                'search' => $request->search,
                'sort' => $sortBy,
            ],
        ]);
    }

    /**
     * Show single product detail.
     */
    public function show(Product $product)
    {
        if (!$product->is_active) {
            abort(404);
        }

        $product->load('store');

        $relatedProducts = Product::with('store')
            ->active()
            ->inStock()
            ->where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return Inertia::render('marketplace/product', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Show store page.
     */
    public function store(UmkmStore $store)
    {
        // Try to load with categories; if migration not run yet, fallback gracefully
        try {
            $products = $store->products()
                ->with('productCategory')
                ->active()
                ->inStock()
                ->orderByRaw('CASE WHEN product_category_id IS NULL THEN 1 ELSE 0 END, product_category_id ASC')
                ->orderBy('name')
                ->paginate(50);

            $productCategories = $store->productCategories()->withCount('products')->get();
        } catch (\Exception $e) {
            // Fallback: categories table/column might not exist yet
            $products = $store->products()
                ->active()
                ->inStock()
                ->orderBy('name')
                ->paginate(50);

            $productCategories = collect();
        }

        // Get review statistics (sentiment-based)
        $reviewStats = [
            'positive_count' => $store->reviews()->where('sentiment', 'positive')->count(),
            'negative_count' => $store->reviews()->where('sentiment', 'negative')->count(),
        ];

        return Inertia::render('marketplace/store', [
            'store' => array_merge($store->toArray(), [
                'review_stats' => $reviewStats,
                'average_rating' => $store->average_rating,
                'total_ratings' => $store->total_ratings,
            ]),
            'products' => $products,
            'productCategories' => $productCategories,
        ]);
    }

    /**
     * Search products (AJAX).
     */
    public function search(Request $request)
    {
        $search = $request->get('q', '');

        $products = Product::with('store')
            ->active()
            ->inStock()
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->take(10)
            ->get();

        return response()->json($products);
    }

    /**
     * Calculate distance between two coordinates (Haversine formula).
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        if (!$lat1 || !$lng1 || !$lat2 || !$lng2) {
            return 0;
        }

        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 1);
    }
}
