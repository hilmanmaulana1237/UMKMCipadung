<?php

namespace App\Http\Controllers;

use App\Models\UmkmLandingPage;
use App\Models\UmkmStore;
use App\Models\Product;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Show landing page builder interface
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $store = $user->umkmStore;

        if (!$store) {
            return redirect()->route('umkm.dashboard')->with('error', 'Anda harus memiliki toko terlebih dahulu.');
        }

        // Get existing landing page if any
        $landingPage = UmkmLandingPage::where('umkm_store_id', $store->id)->first();

        // Fetch products from this store to allow selection
        $products = Product::where('umkm_store_id', $store->id)
            ->where('is_active', true)
            ->select('id', 'name', 'price', 'image_path', 'description')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('umkm/landing-page/index', [
            'store' => $store,
            'landingPage' => $landingPage,
            'products' => $products,
            'templates' => UmkmLandingPage::getTemplates(),
        ]);
    }

    /**
     * Create or update landing page
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'template' => 'required|string|in:tema1,tema2,tema3,tema4,tema5',
            'tagline' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'feature1_title' => 'nullable|string|max:50',
            'feature1_desc' => 'nullable|string|max:200',
            'feature2_title' => 'nullable|string|max:50',
            'feature2_desc' => 'nullable|string|max:200',
            'feature3_title' => 'nullable|string|max:50',
            'feature3_desc' => 'nullable|string|max:200',
            'hero_image' => 'nullable|image|max:5120',
            'products' => 'nullable|array|max:10',
            'products.*.name' => 'required|string|max:100',
            'products.*.price' => 'nullable|string|max:50',
            'products.*.description' => 'nullable|string|max:200',
            'products.*.image_path' => 'nullable|string', // Support for existing product images
            'product_images' => 'nullable|array|max:10',
            'product_images.*' => 'nullable|image|max:5120',
            'business_phone' => 'nullable|string|max:20',
            'business_address' => 'nullable|string',
            'business_hours' => 'nullable|string|max:50',
            'instagram' => 'nullable|string|max:100',
            'email' => 'nullable|string|max:100',
            'is_published' => 'boolean',
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $store = $user->umkmStore;

        if (!$store) {
            return response()->json(['error' => 'Toko tidak ditemukan.'], 400);
        }

        // Find or create landing page
        $landingPage = UmkmLandingPage::firstOrNew(['umkm_store_id' => $store->id]);

        // Generate slug if new
        if (!$landingPage->exists) {
            $landingPage->slug = UmkmLandingPage::generateSlug($store->name);
        }

        $landingPage->template = $validated['template'];
        $landingPage->tagline = $validated['tagline'] ?? null;
        $landingPage->description = $validated['description'] ?? null;
        $landingPage->feature1_title = $validated['feature1_title'] ?? null;
        $landingPage->feature1_desc = $validated['feature1_desc'] ?? null;
        $landingPage->feature2_title = $validated['feature2_title'] ?? null;
        $landingPage->feature2_desc = $validated['feature2_desc'] ?? null;
        $landingPage->feature3_title = $validated['feature3_title'] ?? null;
        $landingPage->feature3_desc = $validated['feature3_desc'] ?? null;
        $landingPage->business_phone = $validated['business_phone'] ?? null;
        $landingPage->business_address = $validated['business_address'] ?? null;
        $landingPage->business_hours = $validated['business_hours'] ?? null;
        $landingPage->instagram = $validated['instagram'] ?? null;
        $landingPage->email = $validated['email'] ?? null;
        
        $existingProducts = is_array($landingPage->products) ? $landingPage->products : [];
        $preparedProducts = [];

        foreach (($validated['products'] ?? []) as $index => $product) {
            // Safe access to existing product data
            $existingProduct = $existingProducts[$index] ?? null;
            
            // Check if we already have an image path from existing product or previous upload
            $currentImagePath = $product['image_path'] ?? ($existingProduct['image_path'] ?? null);
            
            if ($request->hasFile("product_images.$index")) {
                // If uploading a new image, delete the old one if it was a landing page upload
                if ($currentImagePath && str_contains($currentImagePath, 'landing-pages/products')) {
                    Storage::disk('public')->delete($currentImagePath);
                }

                $currentImagePath = $request->file("product_images.$index")->store('landing-pages/products', 'public');
            }

            $preparedProducts[] = [
                'name' => $product['name'] ?? '',
                'price' => $product['price'] ?? '',
                'description' => $product['description'] ?? '',
                'image_path' => $currentImagePath,
            ];
        }

        // Cleanup old images that are no longer used after product removal
        if (count($existingProducts) > count($preparedProducts)) {
            foreach (array_slice($existingProducts, count($preparedProducts)) as $removedProduct) {
                if (!empty($removedProduct['image_path']) && is_string($removedProduct['image_path']) && str_contains($removedProduct['image_path'], 'landing-pages/products')) {
                    Storage::disk('public')->delete($removedProduct['image_path']);
                }
            }
        }

        $landingPage->products = $preparedProducts;
        $landingPage->is_published = $validated['is_published'] ?? false;

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            // Delete old image if exists
            if ($landingPage->hero_image_path) {
                Storage::disk('public')->delete($landingPage->hero_image_path);
            }

            $path = $request->file('hero_image')->store('landing-pages/hero', 'public');
            $landingPage->hero_image_path = $path;
        }

        $landingPage->save();

        return response()->json(['success' => true, 'message' => 'Landing page berhasil disimpan!']);
    }

    /**
     * Show a public portal of published UMKM websites.
     */
    public function portal(Request $request)
    {
        $search = trim((string) $request->get('search', ''));
        $category = $request->get('category');
        $sort = $request->get('sort', 'latest');

        $allowedCategories = ['kuliner', 'kriya', 'jasa', 'fashion', 'kerajinan', 'pertanian', 'lainnya'];
        $allowedSorts = ['latest', 'oldest', 'name'];

        if (!in_array($category, $allowedCategories, true)) {
            $category = null;
        }

        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'latest';
        }

        $baseQuery = UmkmLandingPage::query()
            ->where('is_published', true)
            ->whereHas('store');

        $publishedPages = (clone $baseQuery)->with('store')->get();

        $categoryOptions = $publishedPages
            ->groupBy(fn ($page) => $page->store?->category ?: 'lainnya')
            ->map(fn ($items, $key) => [
                'id' => $key,
                'name' => $this->portalCategoryLabel($key),
                'count' => $items->count(),
            ])
            ->sortBy('name')
            ->values();

        $query = (clone $baseQuery)->with('store');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('tagline', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('store', function ($storeQuery) use ($search) {
                        $storeQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('address_pickup', 'like', "%{$search}%");
                    });
            });
        }

        if ($category) {
            $query->whereHas('store', fn ($storeQuery) => $storeQuery->where('category', $category));
        }

        match ($sort) {
            'oldest' => $query->oldest('updated_at'),
            'name' => $query->orderBy(
                UmkmStore::select('name')
                    ->whereColumn('umkm_stores.id', 'umkm_landing_pages.umkm_store_id')
            ),
            default => $query->latest('updated_at'),
        };

        $websites = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (UmkmLandingPage $landingPage) => $this->formatPortalWebsite($landingPage));

        return Inertia::render('portal-umkm/index', [
            'websites' => $websites,
            'categories' => $categoryOptions,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'sort' => $sort,
            ],
            'stats' => [
                'published_count' => $publishedPages->count(),
                'open_count' => $publishedPages->filter(fn ($page) => $page->store?->isOpen())->count(),
                'product_count' => $publishedPages->sum(fn ($page) => count($page->products ?? [])),
                'store_count' => $publishedPages->pluck('umkm_store_id')->unique()->count(),
            ],
        ]);
    }

    /**
     * Show public landing page
     */
    public function show($slug)
    {
        $landingPage = UmkmLandingPage::where('slug', $slug)
            ->where('is_published', true)
            ->with('store')
            ->firstOrFail();

        $store = $landingPage->store;

        // Get manual products from JSON array
        $manualProducts = $landingPage->products ?? [];
        $products = collect($manualProducts)->map(function ($p, $index) {
            return (object) [
                'id' => $index,
                'name' => $p['name'] ?? '',
                'price' => preg_replace('/[^0-9]/', '', $p['price'] ?? '0'),
                'image_path' => $p['image_path'] ?? null,
                'description' => $p['description'] ?? '',
            ];
        });

        // Map template selection to actual file names
        $templateMap = [
            'tema1' => 'dynamic-tema1-luxury-dark.html',
            'tema2' => 'dynamic-tema2-cute-pastel.html',
            'tema3' => 'dynamic-tema3-minimalist-catalog.html',
            'tema4' => 'dynamic-tema4-traditional-warm.html',
            'tema5' => 'dynamic-tema5-professional-blue.html',
        ];

        $templateFile = $templateMap[$landingPage->template] ?? 'dynamic-tema1-luxury-dark.html';
        $templatePath = resource_path('views/landing-page-templates/' . $templateFile);

        if (!file_exists($templatePath)) {
            // Fallback to tema1 if specific template not found
            $templatePath = resource_path('views/landing-page-templates/dynamic-tema1-luxury-dark.html');
            if (!file_exists($templatePath)) {
                abort(404, 'Template tidak ditemukan.');
            }
        }

        $html = file_get_contents($templatePath);

        // Use the replacePlaceholders method to inject content into the template
        $html = $this->replacePlaceholders($html, $landingPage, $store, $products);

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Generate product cards for dynamic template
     */
    private function generateDynamicProductCards($products, $waNumber)
    {
        if ($products->isEmpty()) {
            return '<p style="text-align: center; color: #999;">Belum ada produk yang ditampilkan.</p>';
        }

        $html = '';
        foreach ($products as $product) {
            $price = $this->formatProductPrice($product->price);
            $imgUrl = $product->image_path
                ? (str_starts_with($product->image_path, 'http') ? $product->image_path : asset('storage/' . $product->image_path))
                : 'https://via.placeholder.com/400x300?text=' . urlencode($product->name);
            $waLink = 'https://wa.me/' . $waNumber . '?text=' . urlencode("Halo, saya tertarik dengan produk: {$product->name}");
            $description = $product->description ?? 'Produk berkualitas dari toko kami.';

            $html .= "
            <div class=\"product-card fade-up\">
                <img src=\"{$imgUrl}\" alt=\"" . htmlspecialchars($product->name) . "\">
                <div class=\"card-body\">
                    <h3>" . htmlspecialchars($product->name) . "</h3>
                    <p>" . htmlspecialchars($description) . "</p>
                    <div class=\"price\">{$price}</div>
                    <a href=\"{$waLink}\" class=\"btn\" target=\"_blank\">Pesan via WA</a>
                </div>
            </div>";
        }

        return $html;
    }

    /**
     * Preview landing page (owner only)
     */
    public function preview($id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $store = $user->umkmStore;

        $landingPage = UmkmLandingPage::where('id', $id)
            ->where('umkm_store_id', $store->id)
            ->with('store')
            ->firstOrFail();

        $manualProducts = $landingPage->products ?? [];
        $products = collect($manualProducts)->map(function ($p, $index) {
            return (object) [
                'id' => $index,
                'name' => $p['name'] ?? '',
                'price' => preg_replace('/[^0-9]/', '', $p['price'] ?? '0'),
                'image_path' => $p['image_path'] ?? null,
                'description' => $p['description'] ?? '',
            ];
        });

        // Use same template map as show() method
        $templateMap = [
            'tema1' => 'dynamic-tema1-luxury-dark.html',
            'tema2' => 'dynamic-tema2-cute-pastel.html',
            'tema3' => 'dynamic-tema3-minimalist-catalog.html',
            'tema4' => 'dynamic-tema4-traditional-warm.html',
            'tema5' => 'dynamic-tema5-professional-blue.html',
        ];

        $templateFile = $templateMap[$landingPage->template] ?? 'dynamic-tema1-luxury-dark.html';
        $templatePath = resource_path('views/landing-page-templates/' . $templateFile);

        if (!file_exists($templatePath)) {
            $templatePath = resource_path('views/landing-page-templates/dynamic-tema1-luxury-dark.html');
            if (!file_exists($templatePath)) {
                abort(404, 'Template tidak ditemukan.');
            }
        }

        $html = file_get_contents($templatePath);
        $html = $this->replacePlaceholders($html, $landingPage, $landingPage->store, $products);

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Delete landing page
     */
    public function destroy($id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $store = $user->umkmStore;

        if (!$store) {
            return response()->json(['error' => 'Toko tidak ditemukan.'], 400);
        }

        $landingPage = UmkmLandingPage::where('id', $id)
            ->where('umkm_store_id', $store->id)
            ->first();

        if (!$landingPage) {
            return response()->json(['error' => 'Landing page tidak ditemukan.'], 404);
        }

        // Delete hero image
        if ($landingPage->hero_image_path) {
            Storage::disk('public')->delete($landingPage->hero_image_path);
        }

        // Delete product images (only those uploaded specifically for landing page)
        foreach (($landingPage->products ?? []) as $product) {
            if (!empty($product['image_path']) && str_contains($product['image_path'], 'landing-pages/products')) {
                Storage::disk('public')->delete($product['image_path']);
            }
        }

        $landingPage->delete();

        return response()->json(['success' => true, 'message' => 'Landing page berhasil dihapus.']);
    }

    /**
     * Preview template with sample data (public access for iframe)
     */
    public function previewTemplate($templateId)
    {
        $templateMap = [
            'tema1' => 'dynamic-tema1-luxury-dark',
            'tema2' => 'dynamic-tema2-cute-pastel',
            'tema3' => 'dynamic-tema3-minimalist-catalog',
            'tema4' => 'dynamic-tema4-traditional-warm',
            'tema5' => 'dynamic-tema5-professional-blue',
        ];

        $templateFile = $templateMap[$templateId] ?? 'dynamic-tema1-luxury-dark';
        $templatePath = resource_path('views/landing-page-templates/' . $templateFile . '.html');

        if (!file_exists($templatePath)) {
            abort(404, 'Template tidak ditemukan.');
        }

        $html = file_get_contents($templatePath);

        // Sample data for preview
        $sampleData = [
            'STORE_NAME' => 'Nama Toko Anda',
            'TAGLINE' => 'Tagline Toko yang Menarik',
            'DESCRIPTION' => 'Deskripsi singkat tentang toko Anda. Jelaskan apa yang membuat toko Anda spesial dan mengapa pelanggan harus memilih Anda.',
            'STORE_DESCRIPTION' => 'Deskripsi lengkap toko Anda akan muncul di sini.',
            'ADDRESS' => 'Jl. Contoh No. 123, Kota Anda',
            'PHONE' => '081234567890',
            'WA_LINK' => 'https://wa.me/6281234567890',
            'WA_NUMBER' => '6281234567890',
            'EMAIL' => 'toko@contoh.com',
            'EMAIL_LINK' => 'mailto:toko@contoh.com',
            'INSTAGRAM' => '@tokoanda',
            'INSTAGRAM_LINK' => 'https://instagram.com/tokoanda',
            'CATEGORY' => '🍽️ Kuliner',
            'HERO_IMAGE' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            'NAV_PRODUCTS' => 'Produk',
            'WHY_US' => 'Mengapa Kami',
            'FOOTER_YEAR' => date('Y'),
            'OPERATING_HOURS' => 'Senin - Minggu: 08:00 - 22:00',
        ];

        // Replace placeholders
        foreach ($sampleData as $key => $value) {
            $html = str_replace('{{' . $key . '}}', $value, $html);
        }

        // Generate sample product cards
        $sampleProducts = $this->generateSampleProductCards($templateId);

        // Replace product section
        if (preg_match('/<!-- PRODUCT_START -->(.*?)<!-- PRODUCT_END -->/s', $html)) {
            $html = preg_replace(
                '/<!-- PRODUCT_START -->(.*?)<!-- PRODUCT_END -->/s',
                $sampleProducts,
                $html
            );
        }

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Generate sample product cards for template preview
     */
    private function generateSampleProductCards($templateId)
    {
        $products = [
            ['name' => 'Produk Unggulan 1', 'price' => 50000, 'image' => null],
            ['name' => 'Produk Best Seller', 'price' => 75000, 'image' => null],
            ['name' => 'Produk Premium', 'price' => 100000, 'image' => null],
            ['name' => 'Produk Favorit', 'price' => 65000, 'image' => null],
        ];

        $cards = '';
        foreach ($products as $product) {
            $formattedPrice = 'Rp ' . number_format($product['price'], 0, ',', '.');

            $cards .= '<div class="card" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="height: 150px; background: linear-gradient(135deg, #f5f5f5, #e5e5e5); display: flex; align-items: center; justify-content: center; font-size: 2rem;">📦</div>
                <div style="padding: 16px;">
                    <h3 style="font-size: 1rem; margin-bottom: 8px;">' . htmlspecialchars($product['name']) . '</h3>
                    <p style="color: #22c55e; font-weight: 700; margin-bottom: 12px;">' . $formattedPrice . '</p>
                    <a href="#" style="display: block; text-align: center; padding: 10px; background: #22c55e; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">Pesan via WA</a>
                </div>
            </div>';
        }

        return $cards;
    }

    /**
     * Generate AI content for landing page
     */
    public function generateContent(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string',
            'category' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $this->aiService->usePrimaryApi();

        $prompt = "Buatkan konten lengkap untuk landing page UMKM dengan detail berikut:
Nama Toko: {$request->store_name}
Kategori: {$request->category}
Deskripsi Singkat: {$request->description}

Buat konten yang menarik, profesional, dan sesuai dengan kategori usaha. Gunakan Bahasa Indonesia yang baik.

Format output (JSON):
{
    \"tagline\": \"Tagline singkat dan menarik maksimal 8 kata yang catchy\",
    \"description\": \"Deskripsi profesional 2-3 kalimat tentang usaha ini yang meyakinkan pelanggan\",
    \"feature1_title\": \"Judul keunggulan 1 (maks 3 kata)\",
    \"feature1_desc\": \"Deskripsi singkat keunggulan 1 (1 kalimat)\",
    \"feature2_title\": \"Judul keunggulan 2 (maks 3 kata)\",
    \"feature2_desc\": \"Deskripsi singkat keunggulan 2 (1 kalimat)\",
    \"feature3_title\": \"Judul keunggulan 3 (maks 3 kata)\",
    \"feature3_desc\": \"Deskripsi singkat keunggulan 3 (1 kalimat)\"
}

Pastikan konten sesuai dengan kategori: {$request->category}. Jika kategori kuliner, fokus pada kualitas bahan dan rasa. Jika fashion, fokus pada style dan kualitas. Jika jasa, fokus pada profesionalisme dan kepercayaan.";

        $systemPrompt = "Kamu adalah copywriter profesional khusus UMKM Indonesia. Tugasmu adalah membuat konten landing page yang menarik, profesional, dan sesuai konteks lokal. Output HARUS dalam format JSON valid tanpa penjelasan tambahan.";

        $result = $this->aiService->chat($prompt, $systemPrompt);

        try {
            // Clean JSON from markdown code blocks if any
            $cleanResult = preg_replace('/```json\s*|\s*```/', '', $result);
            $data = json_decode($cleanResult, true);

            return response()->json([
                'success' => true,
                'tagline' => $data['tagline'] ?? '',
                'description' => $data['description'] ?? '',
                'feature1_title' => $data['feature1_title'] ?? 'Kualitas Terjamin',
                'feature1_desc' => $data['feature1_desc'] ?? 'Produk berkualitas tinggi.',
                'feature2_title' => $data['feature2_title'] ?? 'Pengiriman Cepat',
                'feature2_desc' => $data['feature2_desc'] ?? 'Pesanan diproses dengan cepat.',
                'feature3_title' => $data['feature3_title'] ?? 'Pelayanan Ramah',
                'feature3_desc' => $data['feature3_desc'] ?? 'Tim kami siap membantu.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to parse AI response',
            ], 500);
        }
    }

    /**
     * Replace template placeholders with actual data
     */
    private function replacePlaceholders($html, $landingPage, $store, $products)
    {
        // ===== PRIORITY: Replace {{PLACEHOLDER}} format (new templates) =====
        $html = str_replace('{{STORE_NAME}}', htmlspecialchars($store->name), $html);
        $html = str_replace('{{TAGLINE}}', htmlspecialchars($landingPage->tagline ?? 'Selamat Datang'), $html);
        $html = str_replace('{{DESCRIPTION}}', htmlspecialchars($landingPage->description ?? ''), $html);

        // Hero image
        if ($landingPage->hero_image_path) {
            $heroUrl = asset('storage/' . $landingPage->hero_image_path);
            $html = str_replace('{{HERO_IMAGE}}', $heroUrl, $html);
        } else {
            // More neutral placeholder: a nice storefront image from Unsplash
            $html = str_replace('{{HERO_IMAGE}}', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', $html);
        }

        // WhatsApp link placeholder (use landing page phone if available)
        $waNumber = preg_replace('/[^0-9]/', '', $landingPage->business_phone ?: ($store->contact_number ?: ($store->phone ?: '')));
        if ($waNumber) {
            if (!str_starts_with($waNumber, '62')) {
                $waNumber = '62' . ltrim($waNumber, '0');
            }
            $waLink = 'https://wa.me/' . $waNumber;
            $html = str_replace('{{WA_LINK}}', $waLink, $html);
        } else {
            $html = str_replace('{{WA_LINK}}', '#', $html);
        }

        // Address placeholder (prioritize landing page data)
        $address = $landingPage->business_address ?: ($store->address ?: ($store->location ?: ''));
        $html = str_replace('{{ADDRESS}}', htmlspecialchars($address ?: 'Alamat tidak tersedia'), $html);

        // Phone placeholder (prioritize landing page data)
        $phone = $landingPage->business_phone ?: ($store->contact_number ?: ($store->phone ?: ''));
        $html = str_replace('{{PHONE}}', htmlspecialchars($phone ?: '-'), $html);

        // Category placeholder (formatted with emoji)
        $categoryFormatted = $this->formatCategory($store->category ?? 'lainnya');
        $html = str_replace('{{CATEGORY}}', htmlspecialchars($categoryFormatted), $html);

        // Operating hours placeholder (prioritize landing page data)
        $operatingHours = $landingPage->business_hours ?: $this->formatOperatingHours($store);
        $html = str_replace('{{OPERATING_HOURS}}', htmlspecialchars($operatingHours), $html);

        // Email placeholder
        $email = $landingPage->email ?: '';
        $html = str_replace('{{EMAIL}}', htmlspecialchars($email ?: '-'), $html);
        $html = str_replace('{{EMAIL_LINK}}', $email ? 'mailto:' . htmlspecialchars($email) : '#', $html);

        // Instagram placeholder
        $instagram = $landingPage->instagram ?: '';
        $html = str_replace('{{INSTAGRAM}}', htmlspecialchars($instagram ?: '-'), $html);
        $html = str_replace('{{INSTAGRAM_LINK}}', $instagram ? 'https://instagram.com/' . htmlspecialchars(ltrim($instagram, '@')) : '#', $html);

        // ===== DYNAMIC CATEGORY TEXT GENERATION =====
        $cat = strtolower($store->category ?? 'lainnya');

        // DEFAULT: Neutral / General (Safe for 'Lainnya')
        $terms = [
            'cta_title' => 'Temukan Pilihan Terbaik',
            'cta_desc' => 'Dapatkan penawaran menarik hari ini. Jangan sampai ketinggalan.',
            'section_products' => 'Produk Unggulan',
            'section_gallery' => 'Galeri Kami',
            'nav_products' => 'Produk',
            'why_us' => 'Mengapa Kami?',
            'quality_title' => 'Kualitas Terjamin',
            'stats_3_label' => 'Terpercaya',
        ];

        // Specific Overrides
        if (str_contains($cat, 'kuliner') || str_contains($cat, 'food') || str_contains($cat, 'makan') || str_contains($cat, 'snack') || str_contains($cat, 'jajan') || str_contains($cat, 'minum')) {
            $terms = [
                'cta_title' => 'Siap Memanjakan Lidah Anda?',
                'cta_desc' => 'Stok terbatas setiap hari. Pesan sekarang.',
                'section_products' => 'Menu Favorit',
                'section_gallery' => 'Galeri Produk',
                'nav_products' => 'Menu',
                'why_us' => 'Mengapa Kami Berbeda',
                'quality_title' => 'Kualitas Terbaik',
                'stats_3_label' => 'Bahan Alami',
            ];
        } elseif (str_contains($cat, 'jasa') || str_contains($cat, 'service') || str_contains($cat, 'laundry') || str_contains($cat, 'bengkel') || str_contains($cat, 'cukur')) {
            $terms = [
                'cta_title' => 'Butuh Layanan Profesional?',
                'cta_desc' => 'Jadwalkan layanan Anda sekarang. Tim kami siap membantu.',
                'section_products' => 'Layanan Unggulan',
                'section_gallery' => 'Daftar Layanan',
                'nav_products' => 'Layanan',
                'why_us' => 'Kenapa Memilih Kami?',
                'quality_title' => 'Pelayanan Prima',
                'stats_3_label' => 'Profesional',
            ];
        } elseif (str_contains($cat, 'kriya') || str_contains($cat, 'fashion') || str_contains($cat, 'baju') || str_contains($cat, 'craft')) {
            $terms = [
                'cta_title' => 'Ingin Tampil Beda?',
                'cta_desc' => 'Koleksi terbatas. Dapatkan sebelum kehabisan.',
                'section_products' => 'Koleksi Terbaru',
                'section_gallery' => 'Galeri Koleksi',
                'nav_products' => 'Koleksi',
                'why_us' => 'Keunikan Kami',
                'quality_title' => 'Kualitas Premium',
                'stats_3_label' => 'Kualitas Asli',
            ];
        }

        // Replace category-specific placeholders
        $html = str_replace('{{CTA_TITLE}}', htmlspecialchars($terms['cta_title']), $html);
        $html = str_replace('{{CTA_DESC}}', htmlspecialchars($terms['cta_desc']), $html);
        $html = str_replace('{{SECTION_PRODUCTS}}', htmlspecialchars($terms['section_products']), $html);
        $html = str_replace('{{SECTION_GALLERY}}', htmlspecialchars($terms['section_gallery']), $html);
        $html = str_replace('{{NAV_PRODUCTS}}', htmlspecialchars($terms['nav_products']), $html);
        $html = str_replace('{{WHY_US}}', htmlspecialchars($terms['why_us']), $html);
        $html = str_replace('{{QUALITY_TITLE}}', htmlspecialchars($terms['quality_title']), $html);
        $html = str_replace('{{STATS_3_LABEL}}', htmlspecialchars($terms['stats_3_label']), $html);

        // Features placeholders (existing)
        $html = str_replace('{{FEATURE1_TITLE}}', htmlspecialchars($landingPage->feature1_title ?? ($terms['quality_title'])), $html);
        $html = str_replace('{{FEATURE1_DESC}}', htmlspecialchars($landingPage->feature1_desc ?? 'Kami menjamin kepuasan Anda.'), $html);
        $html = str_replace('{{FEATURE2_TITLE}}', htmlspecialchars($landingPage->feature2_title ?? 'Keunggulan 2'), $html);
        $html = str_replace('{{FEATURE2_DESC}}', htmlspecialchars($landingPage->feature2_desc ?? 'Deskripsi keunggulan 2'), $html);
        $html = str_replace('{{FEATURE3_TITLE}}', htmlspecialchars($landingPage->feature3_title ?? 'Keunggulan 3'), $html);
        $html = str_replace('{{FEATURE3_DESC}}', htmlspecialchars($landingPage->feature3_desc ?? 'Deskripsi keunggulan 3'), $html);


        // ===== LEGACY: Template-specific replacements (backward compatibility) =====
        // 1. Replace page title
        $html = preg_replace('/<title>.*?<\/title>/s', '<title>' . htmlspecialchars($store->name) . ' | Landing Page</title>', $html);

        // 2. Replace ALL known template store names with actual store name
        $templateNames = [
            'CIMOLROYALE.', 'CimolCloud.', 'MONOGRAM.', 'KRIPIKU.', 'KLIN',
            'Cimol Royale', 'Cimol Cloud', 'Monogram', 'Kripiku', 'KlinWash',
            'Cimol Cloud Official', 'CIMOL ROYALE', 'cimolcloud'
        ];
        foreach ($templateNames as $name) {
            $html = str_ireplace($name, $store->name, $html);
        }

        // 3. Replace hero taglines with user's tagline
        if ($landingPage->tagline) {
            $taglinePatterns = [
                'Taste the <br><span>Golden Crunch</span>',
                'Taste the Golden Crunch',
                'Kenyal, Gurih, <br><span>Bikin Nagih.</span>',
                'Kenyal, Gurih, Bikin Nagih.',
                'Elegance in <br>Every Stitch.',
                'Elegance in Every Stitch.',
                'Renyahnya Asli, <br><span style="color: var(--accent);">Bikin Gak Berhenti.</span>',
                'Renyahnya Asli, Bikin Gak Berhenti.',
                'Baju Bersih,<br><span>Hidup Lebih Santai.</span>',
                'Baju Bersih, Hidup Lebih Santai.',
                'Kriya Berkualitas, Sentuhan Kreatif Bandung',
            ];
            foreach ($taglinePatterns as $pattern) {
                $html = str_replace($pattern, $landingPage->tagline, $html);
            }
        }

        // 4. Replace hero descriptions with user's description
        if ($landingPage->description) {
            $descPatterns = [
                'Cimol premium dengan tekstur selembut awan dan isian keju lumer. Camilan sempurna untuk menemani harimu yang santai.',
                'Digoreng dengan teknik khusus untuk hasil renyah maksimal tanpa berminyak. Nikmati dengan berbagai bumbu tabur.',
                'Koleksi eksklusif tas kulit sintetis premium. Desain minimalis, kualitas tahan lama, sempurna untuk gaya Anda.',
                'Keripik renyah dengan resep turun temurun. Dibuat dari bahan pilihan, tanpa MSG, cocok untuk oleh-oleh.',
                'Layanan laundry profesional dengan teknologi modern. Baju bersih, wangi, dan siap pakai dalam hitungan jam.',
            ];
            foreach ($descPatterns as $pattern) {
                $html = str_replace($pattern, $landingPage->description, $html);
            }
        }

        // 5. Replace WhatsApp links
        $waNumber = preg_replace('/[^0-9]/', '', $landingPage->business_phone ?? $store->contact_number ?? $store->phone ?? '');
        if ($waNumber) {
            if (!str_starts_with($waNumber, '62')) {
                $waNumber = '62' . ltrim($waNumber, '0');
            }
            $html = preg_replace('/https:\/\/wa\.me\/\d+/', 'https://wa.me/' . $waNumber, $html);
            $html = str_replace('{{WA_LINK}}', 'https://wa.me/' . $waNumber, $html);
        } else {
            $html = str_replace('{{WA_LINK}}', '#', $html);
        }

        // 6. Replace address
        if ($store->address) {
            $addressPatterns = [
                'Jl. Sudirman No. 45, Jakarta Selatan.',
                'Jalan Mawar No. 12, Bandung, Jawa Barat.',
                'di Bandung.',
            ];
            foreach ($addressPatterns as $pattern) {
                $html = str_replace($pattern, $store->address, $html);
            }
        }

        // 7. Replace hero image if set
        if ($landingPage->hero_image_path) {
            $heroUrl = asset('storage/' . $landingPage->hero_image_path);
            $html = preg_replace(
                '/https:\/\/images\.unsplash\.com\/[^"\']+/',
                $heroUrl,
                $html,
                1
            );
        }

        // Replace visible phone number text (Tema 5)
        $html = str_replace('0812-3456-7890', $store->contact_number ?? $store->phone ?? '-', $html);

        // 8. Generate and inject product cards if products selected
        if (!empty($products) && $products->count() > 0) {
            $productHtml = $this->generateProductCards($products, $landingPage->template, $waNumber);

            // Replace {{PRODUCTS}} placeholder directly (new templates)
            $count = 0;
            $html = str_replace('{{PRODUCTS}}', $productHtml, $html, $count);

            // Only use legacy method if placeholder NOT found
            if ($count === 0) {
                $html = $this->replaceProductSection($html, $productHtml, $landingPage->template);
            }
        } else {
            $html = str_replace('{{PRODUCTS}}', '<p style="text-align: center; color: #999; padding: 40px 0;">Belum ada produk yang dipilih.</p>', $html);
        }

        return $this->injectUniversalResponsiveStyles($html);
    }

    /**
     * Add universal mobile fallbacks so every template remains usable on small screens.
     */
    private function injectUniversalResponsiveStyles($html)
    {
        $mobileCss = '<style id="lp-mobile-fallback">
            @media (max-width: 768px) {
                html, body { overflow-x: hidden !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                img, video, iframe { max-width: 100% !important; height: auto !important; }
                .container { width: 100% !important; max-width: 100% !important; padding-left: 20px !important; padding-right: 20px !important; box-sizing: border-box !important; }
                
                /* Hero Section Responsive */
                .hero, .hero-wrapper .hero { 
                    grid-template-columns: 1fr !important; 
                    display: flex !important; 
                    flex-direction: column !important; 
                    gap: 30px !important; 
                    padding: 60px 20px !important;
                    text-align: center !important;
                    min-height: auto !important;
                }
                .hero-content, .hero-text { 
                    max-width: 100% !important; 
                    width: 100% !important; 
                    margin: 0 auto !important; 
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }
                .hero h1 { font-size: clamp(2rem, 10vw, 2.8rem) !important; line-height: 1.1 !important; margin-bottom: 20px !important; }
                .hero p { font-size: 1.1rem !important; max-width: 100% !important; margin-bottom: 30px !important; }
                .hero-image, .hero-img, .hero-img-wrapper, .hero-image-container { 
                    max-width: 100% !important; 
                    width: 100% !important; 
                    margin: 0 auto !important; 
                    order: -1 !important; /* Image first on mobile usually looks better */
                }
                
                /* Grids Responsive */
                .menu-grid, .card-grid, .product-grid, .service-grid, .features-grid, .stats-grid, .gallery-grid { 
                    grid-template-columns: 1fr !important; 
                    gap: 20px !important;
                }
                
                /* Buttons Responsive */
                .cta-buttons, .hero-actions, .btn-group { 
                    display: flex !important; 
                    flex-direction: column !important; 
                    gap: 12px !important; 
                    width: 100% !important;
                }
                .btn, .btn-order, .action-link { 
                    width: 100% !important; 
                    padding: 15px 25px !important;
                    font-size: 1.1rem !important;
                    text-align: center !important; 
                    display: block !important;
                    box-sizing: border-box !important;
                }
                
                /* Navigation Responsive */
                nav, .navbar { padding: 15px 20px !important; }
                .nav-links, .menu { display: none !important; } /* Hide complex menus on simple mobile view */
                
                /* Section Padding */
                section { padding: 50px 20px !important; }
            }
        </style>';

        if (str_contains($html, 'id="lp-mobile-fallback"')) {
            return $html;
        }

        if (str_contains($html, '</head>')) {
            return str_replace('</head>', $mobileCss . '</head>', $html);
        }

        return $mobileCss . $html;
    }

    /**
     * Generate product cards HTML based on template style
     */
    private function generateProductCards($products, $template, $waNumber)
    {
        $cards = '';
        $index = 0;

        foreach ($products as $product) {
            $price = $this->formatProductPrice($product->price);
            $imgUrl = $product->image_path
                ? asset('storage/' . $product->image_path)
                : 'https://via.placeholder.com/400x300?text=' . urlencode($product->name ?: 'Produk');
            $waLink = 'https://wa.me/' . $waNumber . '?text=' . urlencode("Halo, saya tertarik dengan produk: {$product->name}");
            $description = $product->description ?? 'Produk berkualitas dari toko kami.';
            $safeName = htmlspecialchars($product->name);
            $safeDesc = htmlspecialchars($description);

            if ($template === 'tema1') {
                // Luxury Dark Style — matches product-card + p-img + p-info CSS
                $cards .= "
                <div class=\"product-card reveal\">
                    <div class=\"p-img\">
                        <img src=\"{$imgUrl}\" alt=\"{$safeName}\">
                    </div>
                    <div class=\"p-info\">
                        <h3>{$safeName}</h3>
                        <span class=\"p-price\">{$price}</span>
                        <p class=\"p-desc\">{$safeDesc}</p>
                        <a href=\"{$waLink}\" class=\"btn\" target=\"_blank\">Pesan Sekarang</a>
                    </div>
                </div>";
            } elseif ($template === 'tema2') {
                // Cute Pastel Style — matches product-card + p-img + p-info CSS
                $cards .= "
                <div class=\"product-card fade-up\">
                    <div class=\"p-img\">
                        <img src=\"{$imgUrl}\" alt=\"{$safeName}\">
                    </div>
                    <div class=\"p-info\">
                        <h3>{$safeName}</h3>
                        <span class=\"p-price\">{$price}</span>
                        <p class=\"p-desc\">{$safeDesc}</p>
                        <a href=\"{$waLink}\" class=\"btn\" target=\"_blank\">Pesan Sekarang</a>
                    </div>
                </div>";
            } elseif ($template === 'tema3') {
                // Minimalist Catalog Style — matches product-item + img-wrap + p-meta CSS
                $cards .= "
                <div class=\"product-item\">
                    <div class=\"img-wrap\">
                        <img src=\"{$imgUrl}\" alt=\"{$safeName}\">
                    </div>
                    <div class=\"p-meta\">
                        <div>
                            <span class=\"p-title\">{$safeName}</span>
                            <span class=\"p-cat\">{$safeDesc}</span>
                        </div>
                        <span class=\"p-price\">{$price}</span>
                    </div>
                    <a href=\"{$waLink}\" class=\"btn\" style=\"margin-top: 12px; display: block; text-align: center; font-size: 0.8rem; padding: 10px 20px;\" target=\"_blank\">Pesan</a>
                </div>";
            } elseif ($template === 'tema4') {
                // Traditional Warm Style — matches product-card + img-box + p-info CSS
                $cards .= "
                <div class=\"product-card\">
                    <div class=\"img-box\">
                        <img src=\"{$imgUrl}\" alt=\"{$safeName}\">
                    </div>
                    <div class=\"p-info\">
                        <span class=\"p-name\">{$safeName}</span>
                        <span class=\"p-flavor\">{$safeDesc}</span>
                        <span class=\"p-price\">{$price}</span>
                        <a href=\"{$waLink}\" class=\"btn\" style=\"display: inline-block; margin-top: 10px; font-size: 0.85rem; padding: 8px 20px;\" target=\"_blank\">Pesan</a>
                    </div>
                </div>";
            } else {
                // tema5 - Professional Blue Style — matches service-card + s-img-wrap + s-content CSS
                $badge = '';
                if ($index === 0) {
                    $badge = '<span class="product-badge bestseller">⭐ Best Seller</span>';
                } elseif ($index === 1) {
                    $badge = '<span class="product-badge new">✨ New</span>';
                }

                $cards .= "
                <div class=\"service-card\">
                    <div class=\"s-img-wrap\">
                        {$badge}
                        <img src=\"{$imgUrl}\" alt=\"{$safeName}\">
                    </div>
                    <div class=\"s-content\">
                        <div class=\"s-title\">{$safeName}</div>
                        <div class=\"s-desc\">{$safeDesc}</div>
                        <div class=\"s-footer\">
                            <div>
                                <span class=\"price-tag\">{$price}</span>
                            </div>
                            <a href=\"{$waLink}\" class=\"action-link\" target=\"_blank\">Pesan Sekarang →</a>
                        </div>
                    </div>
                </div>";
            }
            $index++;
        }

        return $cards;
    }

    private function formatProductPrice($price): string
    {
        if (is_int($price) || is_float($price)) {
            return 'Rp ' . number_format($price, 0, ',', '.');
        }

        $rawPrice = trim((string) $price);

        if ($rawPrice === '') {
            return 'Rp 0';
        }

        if (is_numeric($rawPrice)) {
            return 'Rp ' . number_format((float) $rawPrice, 0, ',', '.');
        }

        $number = preg_replace('/[^0-9]/', '', $rawPrice);

        if ($number === '') {
            return 'Rp 0';
        }

        return 'Rp ' . number_format((int) $number, 0, ',', '.');
    }

    /**
     * Replace product section in template with generated cards
     */
    private function replaceProductSection($html, $productHtml, $template)
    {
        // Different templates have different product container structures
        // We'll inject our products into a wrapper div

        // Helper to get container class
        $containerClass = match ($template) {
            'tema1' => 'menu-grid',
            'tema2' => 'card-grid',
            'tema3' => 'product-grid',
            'tema4' => 'product-grid',
            'tema5' => 'service-grid',
            default => 'product-grid',
        };

        // Template-specific regex patterns
        // Tema 5 has an extra closing div because the grid is inside a container
        if ($template === 'tema5') {
            $pattern = '/<div class="service-grid"[^>]*>.*?<\/div>\s*<\/div>\s*<\/section>/s';
            $replacement = "<div class=\"{$containerClass}\">{$productHtml}</div></div></section>";
        } else {
            // Standard pattern for other templates where grid is last in section
            $pattern = '/<div class="(menu-grid|card-grid|product-grid)"[^>]*>.*?<\/div>\s*<\/section>/s';
            $replacement = "<div class=\"{$containerClass}\">{$productHtml}</div></section>";
        }

        // Try to replace
        $newHtml = preg_replace($pattern, $replacement, $html, 1);

        // If no replacement was made, return original
        return $newHtml ?: $html;
    }

    private function formatPortalWebsite(UmkmLandingPage $landingPage): array
    {
        $store = $landingPage->store;
        $products = collect($landingPage->products ?? [])
            ->filter(fn ($product) => is_array($product) && !empty($product['name']))
            ->values();

        $featuredProducts = $products
            ->take(3)
            ->map(fn ($product) => [
                'name' => $product['name'] ?? '',
                'price' => $this->formatPortalPrice($product['price'] ?? null),
                'description' => $product['description'] ?? null,
                'image_url' => $this->storageUrl($product['image_path'] ?? null),
            ])
            ->values();

        $address = $landingPage->business_address
            ?: ($store?->address_pickup ?: ($store?->address ?: null));

        return [
            'id' => $landingPage->id,
            'slug' => $landingPage->slug,
            'public_url' => route('landing-page.show', ['slug' => $landingPage->slug]),
            'name' => $store?->name ?? 'Toko UMKM',
            'category' => $store?->category ?: 'lainnya',
            'category_label' => $this->portalCategoryLabel($store?->category),
            'tagline' => $landingPage->tagline,
            'description' => $landingPage->description ?: $store?->description,
            'preview_image_url' => $this->portalPreviewImageUrl($landingPage, $store, $products),
            'address' => $address,
            'phone' => $landingPage->business_phone ?: $store?->contact_number,
            'business_hours' => $landingPage->business_hours,
            'is_open' => $store?->isOpen() ?? false,
            'open_time' => $this->formatPortalTime($store?->open_time),
            'close_time' => $this->formatPortalTime($store?->close_time),
            'product_count' => $products->count(),
            'featured_products' => $featuredProducts,
            'template' => $landingPage->template,
            'template_name' => UmkmLandingPage::getTemplates()[$landingPage->template]['name'] ?? 'Website UMKM',
            'updated_at' => $landingPage->updated_at?->toIso8601String(),
            'updated_label' => $landingPage->updated_at?->diffForHumans(),
        ];
    }

    private function portalPreviewImageUrl(UmkmLandingPage $landingPage, ?UmkmStore $store, $products): ?string
    {
        if ($landingPage->hero_image_path) {
            return $this->storageUrl($landingPage->hero_image_path);
        }

        if ($store?->store_photo_path) {
            return $this->storageUrl($store->store_photo_path);
        }

        if ($store?->banner_path) {
            return $this->storageUrl($store->banner_path);
        }

        $firstProduct = $products->first(fn ($product) => !empty($product['image_path']));

        if ($firstProduct) {
            return $this->storageUrl($firstProduct['image_path']);
        }

        return $this->storageUrl($store?->profile_photo_path);
    }

    private function storageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', '/'])) {
            return $path;
        }

        return asset('storage/' . $path);
    }

    private function formatPortalPrice($price): ?string
    {
        $number = preg_replace('/[^0-9]/', '', (string) $price);

        if ($number === '') {
            return null;
        }

        return 'Rp ' . number_format((int) $number, 0, ',', '.');
    }

    private function formatPortalTime($time): ?string
    {
        if (!$time) {
            return null;
        }

        try {
            return is_string($time) ? substr($time, 0, 5) : $time->format('H:i');
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function portalCategoryLabel(?string $category): string
    {
        return [
            'kuliner' => 'Kuliner',
            'kriya' => 'Kriya',
            'jasa' => 'Jasa',
            'fashion' => 'Fashion',
            'kerajinan' => 'Kerajinan',
            'pertanian' => 'Pertanian',
            'lainnya' => 'Lainnya',
        ][$category ?: 'lainnya'] ?? 'Lainnya';
    }

    /**
     * Format category with emoji
     */
    private function formatCategory($category)
    {
        $categories = [
            'kuliner' => '🍜 Kuliner / Makanan',
            'fashion' => '👗 Fashion / Pakaian',
            'kerajinan' => '🎨 Kerajinan / Handmade',
            'jasa' => '🔧 Jasa / Service',
            'pertanian' => '🌾 Pertanian / Agro',
            'lainnya' => '📦 Lainnya',
        ];

        return $categories[$category] ?? '📦 Lainnya';
    }

    /**
     * Format operating hours for display
     */
    private function formatOperatingHours($store)
    {
        if ($store->open_time && $store->close_time) {
            $open = \Carbon\Carbon::parse($store->open_time)->format('H:i');
            $close = \Carbon\Carbon::parse($store->close_time)->format('H:i');
            return "{$open} - {$close}";
        }

        return 'Hubungi kami';
    }
}
