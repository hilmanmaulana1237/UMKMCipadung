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

        // Get store products for selection
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
            'products.*' => 'exists:products,id',
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
        $landingPage->products = $validated['products'] ?? [];
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
     * Show public landing page
     */
    public function show($slug)
    {
        $landingPage = UmkmLandingPage::where('slug', $slug)
            ->where('is_published', true)
            ->with('store')
            ->firstOrFail();

        $store = $landingPage->store;

        // Get selected products with details
        $productIds = $landingPage->products ?? [];
        $products = Product::whereIn('id', $productIds)
            ->select('id', 'name', 'price', 'image_path', 'description')
            ->get();

        // Map template selection to actual file names
        $templateMap = [
            'tema1' => 'dynamic-tema1-luxury-dark.html',
            'tema2' => 'dynamic-tema2-cute-pastel.html',
            'tema3' => 'dynamic-tema3-minimalist-catalog.html',
            'tema4' => 'dynamic-tema4-traditional-warm.html',
            'tema5' => 'dynamic-tema5-professional-blue.html',
        ];
        
        $templateFile = $templateMap[$landingPage->template] ?? 'dynamic-tema1-luxury-dark.html';
        $templatePath = storage_path('app/public/tema-landingpage/' . $templateFile);
        
        if (!file_exists($templatePath)) {
            // Fallback to tema1 if specific template not found
            $templatePath = storage_path('app/public/tema-landingpage/dynamic-tema1-luxury-dark.html');
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
            $price = 'Rp ' . number_format($product->price, 0, ',', '.');
            $imgUrl = $product->image_path 
                ? asset('storage/' . $product->image_path) 
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

        $productIds = $landingPage->products ?? [];
        $products = Product::whereIn('id', $productIds)
            ->select('id', 'name', 'price', 'image_path', 'description')
            ->get();

        $templatePath = storage_path('app/public/tema-landingpage/' . $landingPage->template . '.html');
        
        if (!file_exists($templatePath)) {
            abort(404, 'Template tidak ditemukan.');
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

        $landingPage->delete();

        return response()->json(['success' => true, 'message' => 'Landing page berhasil dihapus.']);
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
            $html = str_replace('{{HERO_IMAGE}}', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', $html);
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
        
        // ... existing placeholders ...

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
                // Tema 1 - Luxury Dark
                'Taste the <br><span>Golden Crunch</span>',
                'Taste the Golden Crunch',
                // Tema 2 - Cute Pastel
                'Kenyal, Gurih, <br><span>Bikin Nagih.</span>',
                'Kenyal, Gurih, Bikin Nagih.',
                // Tema 3 - Minimalist
                'Elegance in <br>Every Stitch.',
                'Elegance in Every Stitch.',
                // Tema 4 - Traditional
                'Renyahnya Asli, <br><span style="color: var(--accent);">Bikin Gak Berhenti.</span>',
                'Renyahnya Asli, Bikin Gak Berhenti.',
                // Tema 5 - Professional
                'Baju Bersih,<br><span>Hidup Lebih Santai.</span>',
                'Baju Bersih, Hidup Lebih Santai.',
                // Additional variations
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
            // Make sure format is correct (add 62 if not present)
            if (!str_starts_with($waNumber, '62')) {
                $waNumber = '62' . ltrim($waNumber, '0');
            }
            $html = preg_replace('/https:\/\/wa\.me\/\d+/', 'https://wa.me/' . $waNumber, $html);
            $html = str_replace('{{WA_LINK}}', 'https://wa.me/' . $waNumber, $html);
        } else {
            $html = str_replace('{{WA_LINK}}', '#', $html);
        }
        
        // Replace Instagram Link
        if (!empty($landingPage->instagram)) {
            $igLink = str_starts_with($landingPage->instagram, 'http') ? $landingPage->instagram : 'https://instagram.com/' . ltrim($landingPage->instagram, '@');
             $html = str_replace('{{INSTAGRAM_LINK}}', $igLink, $html);
             $html = str_replace('{{INSTAGRAM}}', $landingPage->instagram, $html);
        } else {
             $html = str_replace('{{INSTAGRAM_LINK}}', '#', $html);
             $html = str_replace('{{INSTAGRAM}}', 'Instagram', $html);
        }
        
        // Replace Email Link
        if (!empty($landingPage->email)) {
            $html = str_replace('{{EMAIL_LINK}}', 'mailto:' . $landingPage->email, $html);
            $html = str_replace('{{EMAIL}}', $landingPage->email, $html);
        } else {
            $html = str_replace('{{EMAIL_LINK}}', '#', $html);
            $html = str_replace('{{EMAIL}}', 'Email', $html);
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
        
        // Replace 'Booking Pickup' button text if it exists (Tema 5)
        $html = str_replace('Booking Pickup', 'Hubungi Kami', $html);

        // Replace visible phone number text (Tema 5)
        $html = str_replace('0812-3456-7890', $store->contact_number ?? $store->phone ?? '-', $html);

        // Replace operating hours
        if ($store->open_time && $store->close_time) {
            $open = \Carbon\Carbon::parse($store->open_time)->format('H.i');
            $close = \Carbon\Carbon::parse($store->close_time)->format('H.i');
            $hours = "{$open} - {$close}";
            $html = str_replace('07.00 - 20.00', $hours, $html);
        }
        
        // Replace specific laundry description if present
        $laundryDesc = 'Jasa laundry premium dengan teknologi pencucian modern. Kami jemput pakaian kotor Anda, dan kembalikan dalam keadaan wangi & rapi.';
        if ($landingPage->description) {
           $html = str_replace($laundryDesc, $landingPage->description, $html);
        }
        
        // 8. Replace Feature Content (AI Generated)
        if ($landingPage->feature1_title) {
            // Patterns for Feature 1 (Title & Desc)
            $f1TitlePatterns = ['Gratis Jemput', 'Bahan Premium', 'Desain Elegan', 'Rasa Otentik'];
            foreach ($f1TitlePatterns as $p) $html = str_replace($p, $landingPage->feature1_title, $html);
            
            $f1DescPatterns = ['Layanan penjemputan gratis.', 'Kualitas terbaik.', 'Dibuat oleh ahli.', 'Resep turun temurun.'];
            foreach ($f1DescPatterns as $p) $html = str_replace($p, $landingPage->feature1_desc, $html);
        }
        
        if ($landingPage->feature2_title) {
            // Patterns for Feature 2
            $f2TitlePatterns = ['Deterjen Premium', 'Jahitan Rapi', 'Tekstur Renyah', 'Wangi Tahan Lama'];
            foreach ($f2TitlePatterns as $p) $html = str_replace($p, $landingPage->feature2_title, $html);
            
            $f2DescPatterns = ['Menggunakan bahan pembersih terbaik.', 'Detail yang presisi.', 'Tanpa pengawet.', 'Harum sepanjang hari.'];
            foreach ($f2DescPatterns as $p) $html = str_replace($p, $landingPage->feature2_desc, $html);
        }

        if ($landingPage->feature3_title) {
            // Patterns for Feature 3
            $f3TitlePatterns = ['1 Hari Selesai', 'Garansi Kepuasan', 'Pengiriman Aman', 'Harga Terjangkau'];
            foreach ($f3TitlePatterns as $p) $html = str_replace($p, $landingPage->feature3_title, $html);
            
            $f3DescPatterns = ['Proses pengerjaan cepat.', 'Jika tidak puas, uang kembali.', 'Packing aman sampai tujuan.', 'Ramah di kantong.'];
            foreach ($f3DescPatterns as $p) $html = str_replace($p, $landingPage->feature3_desc, $html);
        }

        // Special replacement for Tema 5 features (Checklist style)
        if ($landingPage->template === 'tema5') {
            $html = str_replace('Gratis Jemput', $landingPage->feature1_title ?? 'Keunggulan 1', $html);
            $html = str_replace('Deterjen Premium', $landingPage->feature2_title ?? 'Keunggulan 2', $html);
            $html = str_replace('1 Hari Selesai', $landingPage->feature3_title ?? 'Keunggulan 3', $html);
        }
        
        // 9. Generate and inject product cards if products selected
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
            // No products selected, show empty message
            $html = str_replace('{{PRODUCTS}}', '<p style="text-align: center; color: #999; padding: 40px 0;">Belum ada produk yang dipilih.</p>', $html);
        }
        
        return $html;
    }
    
    /**
     * Generate product cards HTML based on template style
     */
    private function generateProductCards($products, $template, $waNumber)
    {
        $cards = '';
        $index = 0;
        
        foreach ($products as $product) {
            $price = 'Rp ' . number_format($product->price, 0, ',', '.');
            $imgUrl = $product->image_path ? asset('storage/' . $product->image_path) : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80';
            $waLink = 'https://wa.me/' . $waNumber . '?text=' . urlencode("Halo, saya tertarik dengan produk: {$product->name}");
            $description = $product->description ?? 'Produk berkualitas dari toko kami.';
            
            if ($template === 'tema1') {
                // Luxury Dark Style
                $cards .= "
                <div class=\"menu-card fade-up\">
                    <img src=\"{$imgUrl}\" alt=\"{$product->name}\">
                    <div class=\"card-content\">
                        <h3>{$product->name}</h3>
                        <p>{$description}</p>
                        <div class=\"price\">{$price}</div>
                        <a href=\"{$waLink}\" class=\"btn-order\" target=\"_blank\">Pesan Sekarang</a>
                    </div>
                </div>";
            } elseif ($template === 'tema2') {
                // Cute Pastel Style
                $badge = $index === 0 ? '<span class="badge">Best Seller</span>' : ($index === 1 ? '<span class="badge new">New</span>' : '');
                $cards .= "
                <div class=\"menu-card fade-up\">
                    <div class=\"img-container\">
                        {$badge}
                        <img src=\"{$imgUrl}\" alt=\"{$product->name}\">
                    </div>
                    <div class=\"card-info\">
                        <div>
                            <h3>{$product->name}</h3>
                            <p>{$description}</p>
                        </div>
                        <div class=\"card-footer\">
                            <div class=\"price\">{$price}</div>
                            <a href=\"{$waLink}\" class=\"btn-order\" target=\"_blank\">Pesan Sekarang</a>
                        </div>
                    </div>
                </div>";
            } elseif ($template === 'tema3') {
                // Minimalist Catalog Style
                $cards .= "
                <div class=\"product-card fade-up\">
                    <div class=\"product-img\">
                        <img src=\"{$imgUrl}\" alt=\"{$product->name}\">
                    </div>
                    <div class=\"product-info\">
                        <h3>{$product->name}</h3>
                        <p class=\"price\">{$price}</p>
                    </div>
                </div>";
            } elseif ($template === 'tema4') {
                // Traditional Warm Style
                $cards .= "
                <div class=\"product-card fade-up\">
                    <img src=\"{$imgUrl}\" alt=\"{$product->name}\">
                    <div class=\"product-info\">
                        <h3>{$product->name}</h3>
                        <p>{$description}</p>
                        <span class=\"price\">{$price}</span>
                        <a href=\"{$waLink}\" class=\"btn\" target=\"_blank\">Pesan</a>
                    </div>
                </div>";
            } else {
                // tema5 - Professional Blue Style (Premium Design)
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
                        <img src=\"{$imgUrl}\" alt=\"{$product->name}\">
                    </div>
                    <div class=\"s-content\">
                        <div class=\"s-title\">{$product->name}</div>
                        <div class=\"s-desc\">{$description}</div>
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
    
    /**
     * Replace product section in template with generated cards
     */
    private function replaceProductSection($html, $productHtml, $template)
    {
        // Different templates have different product container structures
        // We'll inject our products into a wrapper div
        
        // Helper to get container class
        $containerClass = match($template) {
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
