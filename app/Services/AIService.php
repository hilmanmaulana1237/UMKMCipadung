<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ApiSetting;

class AIService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    protected string $currentTier = 'secondary';

    // Model Constants Removed - Using Dynamic Config from DB

    public function __construct(string $tier = 'secondary')
    {
        $this->loadConfig($tier);
    }

    /**
     * Load API configuration from database or fallback to ENV.
     */
    protected function loadConfig(string $tier): void
    {
        $this->currentTier = $tier;
        $config = ApiSetting::getConfig($tier);

        // Robust Fallback: Check if key is actually set and not empty
        $this->apiKey = !empty($config['api_key']) ? $config['api_key'] : config('services.openrouter.api_key', '');

        // Model fallback
        $this->model = !empty($config['model']) ? $config['model'] : config('services.openrouter.model', 'google/gemini-2.0-flash-exp:free');

        // Base URL fallback
        $this->baseUrl = !empty($config['base_url']) ? $config['base_url'] : 'https://openrouter.ai/api/v1/chat/completions';
    }

    /**
     * Switch to primary API (for complex tasks like mentoring).
     */
    public function usePrimaryApi(): self
    {
        $this->loadConfig('primary');
        return $this;
    }

    /**
     * Switch to secondary API (for simple tasks like descriptions).
     */
    public function useSecondaryApi(): self
    {
        $this->loadConfig('secondary');
        return $this;
    }

    /**
     * Switch to video API.
     */
    public function useVideoApi(): self
    {
        $this->loadConfig('video');
        return $this;
    }

    /**
     * Send a prompt to the AI and get a response.
     */
    public function chat(string $prompt, string $systemPrompt = ''): ?string
    {
        try {
            $messages = [];

            if ($systemPrompt) {
                $messages[] = [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ];
            }

            $messages[] = [
                'role' => 'user',
                'content' => $prompt,
            ];

            Log::info('AIService Chat Request', [
                'model' => $this->model,
                'tier' => $this->currentTier,
                'base_url' => $this->baseUrl,
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url', 'http://localhost'),
                'X-Title' => config('app.name', 'MUDAPRENEUR.AI'),
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl, [
                        'model' => $this->model,
                        'messages' => $messages,
                        'max_tokens' => 1000,
                        'temperature' => 0.7,
                    ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }

            Log::error('AI API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('AI Service Exception', [
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Generate product description.
     */
    public function generateProductDescription(string $name, string $category, ?float $price = null): string
    {
        // 1. Switch to Secondary API (Fast)
        $this->useSecondaryApi();

        $priceText = $price ? "Rp " . number_format($price, 0, ',', '.') : '';

        $prompt = "Buatkan deskripsi produk yang menarik dan persuasif dalam Bahasa Indonesia untuk produk UMKM desa.\n\n" .
            "Nama Produk: {$name}\n" .
            "Kategori: {$category}\n" .
            ($price ? "Harga: {$priceText}\n" : "") .
            "\n" .
            "Langsung tulis deskripsi tanpa penjelasan tambahan. Maksimal 3 paragraf pendek. Gunakan emotikon yang sesuai.";

        // Use configured secondary model
        $response = $this->chat($prompt);

        // Fallback jika API gagal
        if (!$response) {
            return $this->getFallbackDescription($name, $category);
        }

        // Clean response dari reasoning tags dan markdown formatting
        $response = preg_replace('/<think>.*?<\/think>/s', '', $response);
        $response = preg_replace('/\*\*([^*]+)\*\*/', '$1', $response); // Remove bold **text**
        $response = preg_replace('/\*([^*]+)\*/', '$1', $response); // Remove italic *text*
        $response = preg_replace('/^#+\s*/m', '', $response); // Remove headings

        return trim($response);
    }

    /**
     * Get price suggestion for a category.
     * Prices are adjusted for rural village economy (Cipadung, Bandung area)
     * Uses product name to give more specific suggestions
     */
    public function suggestPrice(string $name, string $category): array
    {
        $nameLower = strtolower($name);

        // Common product prices in rural villages (Cipadung, Bandung)
        $productPrices = [
            // Kuliner
            'nasi goreng' => 12000,
            'nasi' => 10000,
            'mie goreng' => 10000,
            'mie ayam' => 12000,
            'bakso' => 12000,
            'soto' => 10000,
            'sate' => 15000,
            'gorengan' => 1000,
            'pisang goreng' => 5000,
            'es teh' => 3000,
            'es jeruk' => 4000,
            'kopi' => 5000,
            'jus' => 8000,
            'roti' => 5000,
            'kue' => 3000,
            'keripik' => 10000,
            'sambal' => 15000,
            'ayam goreng' => 15000,
            'ayam bakar' => 18000,
            'ikan' => 15000,
            'sayur' => 8000,
            'pecel' => 8000,
            'gado-gado' => 10000,
            'rawon' => 15000,
            // Kriya
            'batik' => 75000,
            'tas' => 35000,
            'dompet' => 25000,
            'gelang' => 15000,
            'kalung' => 20000,
            'kerajinan' => 25000,
            // Jasa
            'servis' => 50000,
            'cuci' => 25000,
            'jahit' => 30000,
            'potong rambut' => 15000,
            'pijat' => 50000,
        ];

        // Find matching product price
        $suggestedPrice = null;
        foreach ($productPrices as $keyword => $price) {
            if (str_contains($nameLower, $keyword)) {
                $suggestedPrice = $price;
                break;
            }
        }

        // Category-based range defaults for rural village
        $priceRanges = [
            'kuliner' => ['min' => 3000, 'max' => 25000, 'default' => 10000],
            'kriya' => ['min' => 10000, 'max' => 150000, 'default' => 35000],
            'jasa' => ['min' => 15000, 'max' => 200000, 'default' => 50000],
        ];

        $range = $priceRanges[$category] ?? ['min' => 5000, 'max' => 50000, 'default' => 15000];

        // Use product-specific price if found, otherwise use category default
        $suggested = $suggestedPrice ?? $range['default'];

        // Ensure suggested is within range
        $suggested = max($range['min'], min($range['max'], $suggested));

        return [
            'min' => $range['min'],
            'max' => $range['max'],
            'suggested' => $suggested,
            'message' => "💡 Harga pasar {$category} di desa: Rp " . number_format($range['min'], 0, ',', '.') . " - Rp " . number_format($range['max'], 0, ',', '.'),
            'specific' => $suggestedPrice !== null,
        ];
    }

    /**
     * Generate business insights for UMKM dashboard.
     */
    public function generateInsights(array $storeData): array
    {
        $insights = [];

        // Insight 1: Low Stock Alert
        if (isset($storeData['low_stock_products']) && count($storeData['low_stock_products']) > 0) {
            $product = $storeData['low_stock_products'][0];
            $insights[] = [
                'type' => 'warning',
                'icon' => '📉',
                'title' => 'Stok Menipis',
                'message' => "Stok '{$product['name']}' tinggal {$product['stock']} unit. Segera restock!",
                'action' => 'Kelola Stok',
                'action_url' => '/products',
            ];
        }

        // Insight 2: Pending Orders
        if (isset($storeData['pending_orders']) && $storeData['pending_orders'] > 0) {
            $insights[] = [
                'type' => 'alert',
                'icon' => '🔔',
                'title' => 'Pesanan Menunggu',
                'message' => "Ada {$storeData['pending_orders']} pesanan menunggu konfirmasi. Jangan biarkan pelanggan menunggu!",
                'action' => 'Lihat Pesanan',
                'action_url' => '/umkm/orders',
            ];
        }

        // Insight 3: Sales Trend
        if (isset($storeData['weekly_sales'])) {
            $trend = $storeData['weekly_sales'] > ($storeData['last_week_sales'] ?? 0) ? 'up' : 'down';
            if ($trend === 'up') {
                $insights[] = [
                    'type' => 'success',
                    'icon' => '🚀',
                    'title' => 'Penjualan Naik',
                    'message' => 'Penjualan minggu ini meningkat! Pertahankan momentum dengan update produk baru.',
                    'action' => 'Tambah Produk',
                    'action_url' => '/products/create',
                ];
            } else {
                $tips = [
                    'Perbarui foto produk dengan pencahayaan yang lebih terang agar terlihat menarik.',
                    'Bagikan link toko Anda ke status WhatsApp secara rutin di jam makan siang.',
                    'Pastikan deskripsi produk jelas dan lengkap untuk mengurangi pertanyaan pembeli.',
                    'Balas chat pelanggan secepat mungkin (< 5 menit) untuk meningkatkan kepercayaan.',
                    'Minta pelanggan yang puas untuk memberikan ulasan bintang 5.',
                    'Tambahkan varian produk baru untuk memberikan lebih banyak pilihan.',
                    "Gunakan fitur 'AI Poster' untuk membuat materi promosi yang menarik.",
                    'Posting testimoni pembeli ke media sosial untuk meyakinkan calon pembeli.',
                ];

                $insights[] = [
                    'type' => 'tip',
                    'icon' => '💡',
                    'title' => 'Tips Penjualan',
                    'message' => $tips[array_rand($tips)],
                    'action' => null,
                    'action_url' => null,
                ];
            }
        }

        // Insight 4: Top Product
        if (isset($storeData['top_product'])) {
            $insights[] = [
                'type' => 'success',
                'icon' => '⭐',
                'title' => 'Produk Terlaris',
                'message' => "'{$storeData['top_product']['name']}' adalah produk paling laris Anda minggu ini!",
                'action' => null,
                'action_url' => null,
            ];
        }

        // Default insight if no data
        if (empty($insights)) {
            $insights[] = [
                'type' => 'tip',
                'icon' => '🎯',
                'title' => 'Mulai Jualan',
                'message' => 'Tambahkan produk pertama Anda dan mulai terima pesanan!',
                'action' => 'Tambah Produk',
                'action_url' => '/products/create',
            ];
        }

        return $insights;
    }

    /**
     * Fallback description templates.
     */
    protected function getFallbackDescription(string $name, string $category): string
    {
        $templates = [
            'kuliner' => "🍽️ {$name} - Nikmat dan menggugah selera! Dibuat dengan bahan berkualitas dan resep rahasia. Pesan sekarang! ✨",
            'kriya' => "🎨 {$name} - Karya handmade dengan detail memukau! Setiap produk dibuat oleh pengrajin berpengalaman. 💝",
            'jasa' => "⚡ {$name} - Layanan profesional dengan hasil terjamin! Tim kami siap melayani kebutuhan Anda. ✅",
        ];

        $template = $templates[$category] ?? $templates['kuliner'];
        return str_replace('{$name}', $name, $template);
    }

    /**
     * AI Business Mentor Chat
     */
    public function chatWithMentor(string $message, array $history = []): string
    {
        $systemPrompt = "Kamu adalah 'Si Mudapreneur' (Mitra Usaha Muda Entrepreneur), mentor bisnis AI profesional namun ramah untuk UMKM di desa Cipadung, Bandung.
        
        Karakteristikmu:
        - Ramah, suportif, dan menggunakan bahasa Indonesia yang baik namun santai (menggunakan sapaan 'Kak' atau 'Bu/Pak').
        - Ahli dalam strategi pemasaran digital, manajemen keuangan sederhana, dan ide konten kreatif.
        - Memberikan saran yang PRAKTIS dan bisa langsung diterapkan dengan modal kecil.
        - Paham konteks lokal (pasar desa, warga ekonomi menengah ke bawah).
        
        PENTING - WAJIB IKUTI ATURAN FORMAT INI:
        - DILARANG KERAS menggunakan simbol markdown: ** (bold), * (italic), ### (heading), --- (separator)
        - DILARANG menggunakan simbol emoji berlebihan seperti ✔️ ✅ 📣 💰 🎬 📦 
        - Tulis HANYA dalam format teks biasa tanpa formatting apapun
        - Gunakan MAKSIMAL 1 emoji di awal atau akhir paragraf saja
        - Gunakan numbering sederhana: 1. 2. 3. (tanpa simbol tambahan)
        - PASTIKAN jawaban SELESAI dan TIDAK TERPOTONG - tulis lengkap sampai akhir
        - Jika perlu panjang, buat jawaban tetap lengkap tapi padat
        
        Tugasmu:
        1. Jawab pertanyaan seputar bisnis, stok, keuangan, atau konten.
        2. Jika user minta ide konten, berikan konsep yang spesifik (misal: 'Buat video 15 detik tentang proses pembuatan seblak').
        3. Jika user mengeluh sepi pembeli, berikan 2-3 strategi promosi jitu.
        
        JANGAN berikan jawaban yang terlalu teoritis atau textbook. Fokus pada solusi nyata.";

        // Format history for context
        $messages = [];
        $messages[] = ['role' => 'system', 'content' => $systemPrompt];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'], // 'user' or 'assistant'
                'content' => $msg['content']
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        // Call AI API manually here to support history - Use PRIMARY API for mentor
        $this->usePrimaryApi();

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
                'Content-Type' => 'application/json',
            ])->timeout(45)->post($this->baseUrl, [
                        'model' => $this->model, // Use Configured Primary Model
                        'messages' => $messages,
                        'temperature' => 0.7,
                        'max_tokens' => 1500, // Increased to prevent truncation
                    ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? null;

                // Comprehensive cleanup of markdown and reasoning tags
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content); // Remove DeepSeek reasoning
                $content = preg_replace('/\*\*([^*]+)\*\*/', '$1', $content); // Remove bold **text**
                $content = preg_replace('/\*([^*]+)\*/', '$1', $content); // Remove italic *text*
                $content = preg_replace('/^#{1,6}\s+/m', '', $content); // Remove headings ### 
                $content = preg_replace('/^---+$/m', '', $content); // Remove horizontal rules
                $content = preg_replace('/^\*\s+/m', '- ', $content); // Convert * bullets to -

                return trim($content);
            }

            Log::error('AI Mentor Error', ['body' => $response->body()]);
            return "Maaf kak, Si Mudapreneur lagi pusing nih (gangguan koneksi). Bisa tanya lagi nanti?";

        } catch (\Exception $e) {
            Log::error('AI Mentor Exception', ['message' => $e->getMessage()]);
            return "Maaf kak, ada gangguan sistem. Silakan coba lagi ya.";
        }
    }

    /**
     * AI Video Script Generator (TikTok/Reels) for Store Promotion
     */
    public function generateVideoScript(string $storeName, string $productName, string $usp): array
    {
        $prompt = "Buatkan naskah konten video pendek (TikTok/Reels) durasi 15-30 detik untuk mempromosikan produk UMKM.
        
        Data Toko: {$storeName}
        Produk: {$productName}
        Keunggulan: {$usp}
        Target: Warga lokal Cipadung, Bandung.
        
        Output dalam format JSON dengan struktur:
        {
            'title': 'Judul Video Catchy',
            'concept': 'Konsep Visual Utama',
            'hook': 'Teks hook 3 detik pertama',
            'scenes': [
                {'time': '0-5s', 'visual': 'Deskripsi visual', 'audio': 'Narasi/Musik'},
                ...
            ],
            'caption': 'Caption postingan + hashtags'
        }
        
        Pastikan idenya kreatif, lucu, atau menggugah selera. Gunakan bahasa gaul sopan.";

        // Use Primary API (Smart Model) for better creativity and accuracy
        $this->usePrimaryApi();
        $response = $this->chat($prompt);

        if (!$response) {
            return [
                'title' => 'Promosi ' . $productName,
                'concept' => 'Review Jujur Produk',
                'hook' => 'Warga Cipadung Wajib Coba Ini!',
                'scenes' => [['time' => '0-15s', 'visual' => 'Showcase produk close up', 'audio' => 'Musik trending']],
                'caption' => "Yuk cobain {$productName} di {$storeName}! #KulinerCipadung #UMKMBandung"
            ];
        }

        // Try to parse JSON from AI response
        try {
            // Cleanup markdown code blocks if present
            $jsonStr = preg_replace('/```json\s*|\s*```/', '', $response);
            $jsonStr = preg_replace('/<think>.*?<\/think>/s', '', $jsonStr);
            $data = json_decode($jsonStr, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        } catch (\Exception $e) {
        }

        // Fallback if generic text returned
        return [
            'title' => 'Ide Konten ' . $productName,
            'concept' => 'Showcase Produk',
            'script_text' => $response // Raw text backup
        ];
    }

    /**
     * AI Poster Generator Text
     * Emulates poster creation prompt since we can't generate actual images yet.
     * Returns a JSON config for a frontend Canvas renderer.
     */
    public function generatePosterConfig(string $productName, string $promoText): array
    {
        $prompt = "Buatkan konfigurasi desain poster promosi untuk produk '{$productName}' dengan teks promo '{$promoText}'.
        Output harus JSON valid dengan struktur untuk merender di Canvas HTML5:
        {
            'backgroundColor': 'hex code (pilih warna yang menarik/cerah)',
            'headline': {'text': 'Headline Catchy', 'color': 'hex', 'y': 50, 'fontSize': 40},
            'subheadline': {'text': 'Subheadline persuasif', 'color': 'hex', 'y': 100, 'fontSize': 24},
            'cta': {'text': 'Order Sekarang!', 'color': 'hex', 'backgroundColor': 'hex', 'y': 500},
            'accentColor': 'hex code',
            'atmosphere': 'deskripsi mood desain (ceria/elegan/pedes)'
        }
        Pilih warna yang kontras dan menarik perhatian.";

        // Use Secondary API
        $this->useSecondaryApi();
        $response = $this->chat($prompt);

        try {
            $jsonStr = preg_replace('/```json\s*|\s*```/', '', $response);
            $jsonStr = preg_replace('/<think>.*?<\/think>/s', '', $jsonStr);
            $data = json_decode($jsonStr, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        } catch (\Exception $e) {
        }

        return [
            'backgroundColor' => '#fef3c7', // amber-100
            'headline' => ['text' => $productName, 'color' => '#b45309', 'y' => 50, 'fontSize' => 40],
            'subheadline' => ['text' => $promoText, 'color' => '#1f2937', 'y' => 100, 'fontSize' => 24],
            'cta' => ['text' => 'Beli Sekarang', 'color' => '#ffffff', 'backgroundColor' => '#ea580c', 'y' => 500],
            'accentColor' => '#f59e0b',
            'atmosphere' => 'Ceria dan Semangat'
        ];
    }

    /**
     * Generate visual-rich description for AI Video.
     */
    public function generateVisualDescription(string $storeName, string $category, string $productName, string $additionalProducts = ''): string
    {
        $context = $additionalProducts ? "Selain itu, tampilkan samar-samar produk lain dari toko ini di background/rak: {$additionalProducts}." : "";

        $prompt = "Buatkan deskripsi visual yang SANGAT DETAIL dan SINEMATIK untuk bahan prompt video AI.
        
        Toko: {$storeName}
        Kategori: {$category}
        Produk Utama: {$productName}
        
        Tujuan: Deskripsi ini akan digunakan oleh AI Video Generator (Kling/Sora) untuk membuat video iklan pendek UMKM yang terlihat realistik, hidup, dan menggugah selera.
        
        Aturan:
        1. HINDARI bahasa promosi (seperti 'Ayo beli', 'Diskon').
        2. FOKUS pada elemen VISUAL: pencahayaan (natural/warm), tekstur produk (uap mengepul, embun es, serat kain), aktivitas (tangan menyajikan, menuangkan saus), dan suasana (ramai, cozy).
        3. Pastikan visual sesuai kategori toko. Jika toko {$category}, jangan tampilkan visual kategori lain.
        4. {$context}
        5. Tulis dalam 1 paragraf mengalir (3-4 kalimat panjang).
        6. Gunakan Bahasa Indonesia yang deskriptif.
        
        Contoh yang Bagus:
        'Close up shot mangkuk bakso dengan uap panas yang masih mengepul, memperlihatkan tekstur daging yang kenyal dan kuah kaldu yang bening berminyak. Kamera bergerak perlahan (panning) memperlihatkan suasana warung yang nyaman dengan cahaya matahari sore yang hangat. Seorang penjual dengan celemek bersih sedang menuangkan sambal ke dalam mangkuk dengan gerakan tangan yang natural.'";

        // Use Secondary API (OpenRouter/Gemini usually good enough for creative writing)
        $this->useSecondaryApi();
        $response = $this->chat($prompt);

        if (!$response) {
            \Illuminate\Support\Facades\Log::warning('Visual Description API Failed, using fallback.');
            return "Video menampilkan {$storeName} dengan suasana yang nyaman dan autentik. Produk unggulan {$productName} diperlihatkan secara close-up dengan pencahayaan natural yang menonjolkan kualitasnya.";
        }

        // Clean response
        $response = preg_replace('/<think>.*?<\/think>/s', '', $response);
        $response = preg_replace('/^"/ ', '', $response);
        $response = preg_replace('/"$/ ', '', $response);

        return trim($response);
    }

    /**
     * Generate social media copywriting for poster sharing.
     * Creates engaging Indonesian caption with emojis for Instagram/WhatsApp.
     */
    public function generatePosterCopywriting(
        string $storeName,
        string $productName,
        string $price,
        string $slogan = '',
        string $phone = '',
        string $address = ''
    ): string {
        $prompt = "Buatkan caption social media yang MENARIK dan PERSUASIF untuk poster UMKM.
        
Data Usaha:
- Nama Toko: {$storeName}
- Produk Unggulan: {$productName}
- Harga: {$price}
- Slogan: " . ($slogan ?: 'Tidak ada') . "
- Telepon: {$phone}
- Alamat: {$address}

ATURAN KETAT:
1. Gunakan EMOJI yang relevan (🔥🍜💰📞📍 dll) tapi JANGAN berlebihan
2. Buat dalam 2-3 kalimat pendek yang catchy
3. Sertakan Call-to-Action (pesan sekarang, hubungi, dll)
4. Sertakan hashtag relevan (3-5 hashtag max)
5. Gunakan Bahasa Indonesia casual/gaul tapi sopan
6. Format: caption + line break + hashtags

Contoh Bagus:
🔥 Laper? Yuk mampir ke Warung Bu Siti!
Nasi Goreng spesial cuma Rp 15.000 aja lho~
📞 Pesan sekarang: 0812-xxx

#NasiGoreng #KulinerBandung #MakanEnak

HANYA OUTPUT CAPTION, tanpa penjelasan tambahan.";

        $this->useSecondaryApi();

        Log::info('PosterCopywriting: Generating caption', [
            'store' => $storeName,
            'product' => $productName,
            'tier' => $this->currentTier,
            'model' => $this->model,
        ]);

        $response = $this->chat($prompt);

        // Fallback caption
        $fallback = "🔥 {$productName} tersedia di {$storeName}!\n💰 Harga: {$price}\n📞 Hubungi: {$phone}\n📍 {$address}\n\n#UMKM #PromoSpesial #KulinerLokal";

        if (!$response) {
            Log::warning('PosterCopywriting: API returned null, using fallback');
            return $fallback;
        }

        // Clean response
        $response = preg_replace('/<think>.*?<\/think>/s', '', $response);
        $response = trim($response);

        // Validate response - check for malformed/garbage output
        // Detect repeated punctuation or single character spam
        if (preg_match('/^[!?.@#$%^&*()+=\[\]{}|\\\\<>~`\-_]{10,}$/', $response)) {
            Log::error('PosterCopywriting: Malformed response detected (repeated punctuation)', [
                'response' => substr($response, 0, 100)
            ]);
            return $fallback;
        }

        // Check for minimum viable content (at least some Indonesian words)
        if (strlen($response) < 20 || !preg_match('/[a-zA-Z]{3,}/', $response)) {
            Log::error('PosterCopywriting: Response too short or no words', [
                'response' => $response
            ]);
            return $fallback;
        }

        Log::info('PosterCopywriting: Success', ['response_length' => strlen($response)]);

        return $response;
    }

    /**
     * AI Smart Reply (Existing)
     */
    public function getSmartReplies(string $customerMessage): array
    {
        $messageLower = strtolower($customerMessage);

        // Context-aware reply suggestions
        $replies = [];

        // Stock/availability questions
        if (str_contains($messageLower, 'ready') || str_contains($messageLower, 'stock') || str_contains($messageLower, 'ada')) {
            $replies[] = '✅ Ready stock kak, silakan langsung diorder ya!';
            $replies[] = '📦 Stok tersedia kak, mau pesan berapa?';
        }

        // Shipping questions
        if (str_contains($messageLower, 'kirim') || str_contains($messageLower, 'ongkir') || str_contains($messageLower, 'antar')) {
            $replies[] = '🚚 Bisa kirim hari ini kak, ongkir sesuai jarak ya';
            $replies[] = '📍 Untuk pengiriman, bisa COD atau diantar langsung kak';
        }

        // Price questions
        if (str_contains($messageLower, 'harga') || str_contains($messageLower, 'berapa') || str_contains($messageLower, 'diskon')) {
            $replies[] = '💰 Harga sudah tertera di produk ya kak';
            $replies[] = '🎁 Untuk pembelian banyak ada harga khusus kak';
        }

        // General greetings
        if (str_contains($messageLower, 'halo') || str_contains($messageLower, 'hai') || str_contains($messageLower, 'pagi') || str_contains($messageLower, 'siang')) {
            $replies[] = '👋 Halo kak! Ada yang bisa dibantu?';
            $replies[] = '😊 Selamat datang kak, silakan tanya-tanya dulu ya';
        }

        // Order confirmation
        if (str_contains($messageLower, 'order') || str_contains($messageLower, 'pesan') || str_contains($messageLower, 'beli')) {
            $replies[] = '🛒 Siap kak! Langsung checkout aja ya';
            $replies[] = '✨ Terima kasih ordernya kak! Segera diproses ya';
        }

        // Thanks
        if (str_contains($messageLower, 'terima kasih') || str_contains($messageLower, 'makasih') || str_contains($messageLower, 'thanks')) {
            $replies[] = '🙏 Sama-sama kak! Ditunggu orderan selanjutnya ya';
            $replies[] = '😊 Terima kasih juga kak, semoga puas dengan produknya!';
        }

        // Default replies
        if (empty($replies)) {
            $replies = [
                '👋 Halo kak! Ada yang bisa dibantu?',
                '📝 Silakan tanya-tanya dulu kak, kami siap membantu',
                '✅ Baik kak, ada info lain yang diperlukan?',
            ];
        }

        return array_slice($replies, 0, 3); // Return max 3 suggestions
    }

    /**
     * AI Bundle Strategist (Existing)
     */
    public function getBundleSuggestions(array $products): array
    {
        if (count($products) < 2) {
            return [];
        }

        $suggestions = [];

        // Group by category
        $byCategory = [];
        foreach ($products as $product) {
            $cat = $product['category'] ?? 'other';
            $byCategory[$cat][] = $product;
        }

        // Suggest bundles within same category
        foreach ($byCategory as $category => $catProducts) {
            if (count($catProducts) >= 2) {
                // Pick two products for bundle
                $product1 = $catProducts[0];
                $product2 = $catProducts[1] ?? $catProducts[0];

                $bundlePrice = (($product1['price'] ?? 0) + ($product2['price'] ?? 0)) * 0.9; // 10% discount

                $suggestions[] = [
                    'type' => 'bundle',
                    'icon' => '📦',
                    'title' => 'Paket Hemat ' . ucfirst($category),
                    'message' => "Bundling '{$product1['name']}' + '{$product2['name']}' dengan diskon 10%",
                    'products' => [$product1['id'] ?? 0, $product2['id'] ?? 0],
                    'discount' => 10,
                    'bundle_price' => round($bundlePrice, -2),
                ];
            }
        }

        // Cross-category suggestion (if kuliner exists)
        if (isset($byCategory['kuliner']) && count($byCategory['kuliner']) > 0) {
            $mainProduct = $byCategory['kuliner'][0];
            $suggestions[] = [
                'type' => 'upsell',
                'icon' => '💡',
                'title' => 'Tambah Minuman',
                'message' => "Sarankan pembeli '{$mainProduct['name']}' untuk tambah Es Teh/Kopi (+Rp 3.000)",
                'products' => [],
                'discount' => 0,
                'bundle_price' => 0,
            ];
        }

        return array_slice($suggestions, 0, 3);
    }

    /**
     * AI Sentiment Analysis (Existing)
     */
    public function getSentimentSummary(array $reviews): array
    {
        if (empty($reviews)) {
            return [
                'overall' => 'neutral',
                'score' => 0,
                'positive_count' => 0,
                'negative_count' => 0,
                'summary' => 'Belum ada ulasan dari pembeli.',
                'highlights' => [],
            ];
        }

        $positiveKeywords = ['enak', 'bagus', 'mantap', 'recommended', 'puas', 'cepat', 'ramah', 'fresh', 'segar', 'lezat', 'top'];
        $negativeKeywords = ['lama', 'kecewa', 'jelek', 'basi', 'mahal', 'kurang', 'rusak', 'telat', 'dingin', 'hambar'];

        $positiveCount = 0;
        $negativeCount = 0;
        $highlights = [];

        foreach ($reviews as $review) {
            $text = strtolower($review['text'] ?? $review['comment'] ?? '');
            $rating = $review['rating'] ?? 3;

            // Count by rating
            if ($rating >= 4) {
                $positiveCount++;
            } elseif ($rating <= 2) {
                $negativeCount++;
            }

            // Extract highlights
            foreach ($positiveKeywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $highlights['positive'][] = $keyword;
                }
            }
            foreach ($negativeKeywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $highlights['negative'][] = $keyword;
                }
            }
        }

        $total = count($reviews);
        $score = ($positiveCount - $negativeCount) / $total * 100;

        // Generate summary
        if ($positiveCount > $negativeCount) {
            $summary = "😊 Pembeli menyukai produk Anda! Banyak yang bilang produknya bagus.";
            $overall = 'positive';
        } elseif ($negativeCount > $positiveCount) {
            $summary = "⚠️ Ada beberapa keluhan dari pembeli. Perlu perbaikan di pengiriman/kualitas.";
            $overall = 'negative';
        } else {
            $summary = "😐 Ulasan cukup beragam. Pertahankan kualitas dan tingkatkan layanan!";
            $overall = 'neutral';
        }

        return [
            'overall' => $overall,
            'score' => round($score),
            'positive_count' => $positiveCount,
            'negative_count' => $negativeCount,
            'summary' => $summary,
            'highlights' => $highlights,
        ];
    }

    /**
     * AI Trend Spotter (Existing)
     */
    public function getTrendingItems(string $category = 'all'): array
    {
        // Simulated trending data for Cipadung, Bandung area
        $trends = [
            'kuliner' => [
                ['name' => 'Seblak', 'growth' => 45, 'icon' => '🌶️'],
                ['name' => 'Baso Aci', 'growth' => 38, 'icon' => '🍜'],
                ['name' => 'Cilok', 'growth' => 25, 'icon' => '🥢'],
                ['name' => 'Mie Gacoan', 'growth' => 60, 'icon' => '🍝'],
                ['name' => 'Kopi Susu', 'growth' => 35, 'icon' => '☕'],
            ],
            'kriya' => [
                ['name' => 'Tas Rajut', 'growth' => 30, 'icon' => '👜'],
                ['name' => 'Aksesoris Handmade', 'growth' => 22, 'icon' => '💍'],
                ['name' => 'Buket Bunga', 'growth' => 40, 'icon' => '💐'],
            ],
            'jasa' => [
                ['name' => 'Laundry Kiloan', 'growth' => 28, 'icon' => '🧺'],
                ['name' => 'Servis HP', 'growth' => 35, 'icon' => '📱'],
                ['name' => 'Cuci Motor', 'growth' => 20, 'icon' => '🏍️'],
            ],
        ];

        if ($category !== 'all' && isset($trends[$category])) {
            return $trends[$category];
        }

        // Return top trends from all categories
        $allTrends = [];
        foreach ($trends as $catTrends) {
            $allTrends = array_merge($allTrends, $catTrends);
        }

        // Sort by growth
        usort($allTrends, fn($a, $b) => $b['growth'] - $a['growth']);

        return array_slice($allTrends, 0, 5);
    }
    /**
     * AI Shopping Assistant Chat
     * Provides intelligent recommendations based on user query and available products
     */
    public function shoppingChat(string $message, $products): string
    {
        if ($products->count() === 0) {
            return "Maaf kak, aku belum nemu produk yang cocok nih 😅\n\nCoba kata kunci lain atau tanya 'Ada produk apa aja?' untuk lihat semua yang tersedia!";
        }

        // Format products for AI context - include key details
        $productList = $products->take(8)->map(function ($p, $index) {
            $num = $index + 1;
            $price = number_format($p->price, 0, ',', '.');
            return "{$num}. {$p->name} (Rp{$price}) - {$p->category} - toko: {$p->store->name}";
        })->join("\n");

        $systemPrompt = "Kamu adalah asisten belanja pintar MUDAPRENEUR yang helpful dan ramah.

KONTEKS: User mencari produk dengan query tertentu, dan kamu sudah menemukan produk-produk yang cocok.

PRODUK YANG DITEMUKAN:
{$productList}

TUGAS PENTING:
1. Berikan rekomendasi singkat (2-3 kalimat) yang menyebutkan SPESIFIK produk yang cocok
2. Sebutkan 1-2 produk terbaik dari list di atas dengan ALASAN kenapa cocok dengan query user
770: 3. JANGAN terdengar seperti robot. Gunakan bahasa gaul sopan (Kak, wkwk, mantul, nih).
771: 4. Fokus pada VALUE produk yang sesuai request user (misal user cari pedas, highlight 'ini pedes banget loh').
772: 5. JANGAN gunakan markdown formatting (**bold**, *italic*) - tulis plain text saja.
773: 6. Pakai emoji yang relevan (max 2-3) agar chat terasa hidup.

CONTOH BAGUS:
Query: 'Makanan murah bikin kenyang'
Response: 'Halo Kak! Kalau mau hemat tapi kenyang, aku rekomen Nasi Goreng cuma 12rb ✨ Atau kalau suka mie, ada Mie Ayam 10rb yang porsinya lumayan gede. Cocok banget buat anak kost! 🍚'

Query: 'Cemilan pedas'  
Response: 'Wah pencinta pedes nih! 🔥 Ada Seblak pedas mantap cuma 8rb, sama Makaroni Pedas 5rb yang enak banget buat temen nongkrong. Dijamin nagih Kak!'

INGAT: Jangan tulis list panjang, cukup highlight 1-2 produk terbaik dengan alasan jelas!";

        try {
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => "Query saya: \"{$message}\""]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->baseUrl, [
                        'model' => $this->model,
                        'messages' => $messages,
                        'temperature' => 0.8, // More creative for personalized recommendations
                        'max_tokens' => 200, // Allow longer personalized response
                    ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? null;

                // Cleanup DeepSeek reasoning tags and markdown
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
                $content = preg_replace('/\*\*([^*]+)\*\*/', '$1', $content); // Remove bold
                $content = preg_replace('/\*([^*]+)\*/', '$1', $content); // Remove italic
                $content = preg_replace('/^#+\s*/m', '', $content); // Remove headings
                $content = trim($content);

                if (empty($content)) {
                    return $this->getFallbackShoppingResponse($products, $message);
                }

                return $content;
            }

            Log::error('AI Shopping Error', ['status' => $response->status(), 'body' => $response->body()]);
            return $this->getFallbackShoppingResponse($products, $message);

        } catch (\Exception $e) {
            Log::error('AI Shopping Exception', ['message' => $e->getMessage()]);
            return $this->getFallbackShoppingResponse($products, $message);
        }
    }

    /**
     * Fallback response when AI fails
     */
    private function getFallbackShoppingResponse($products, string $query): string
    {
        $count = $products->count();
        $firstProduct = $products->first();
        $category = $firstProduct->category ?? 'produk';

        $categoryEmojis = [
            'kuliner' => '🍽️',
            'kriya' => '🎨',
            'jasa' => '⚡',
        ];

        $emoji = $categoryEmojis[$category] ?? '✨';

        return "Halo Kak! Aku nemu {$count} {$category} yang mungkin cocok buat kamu {$emoji}\n\nLangsung cek aja produknya di bawah ya! Semuanya ready stock dan harga terjangkau 👇";
    }

    /**
     * AI Search Intent Extractor
     * Converts user conversational query into structured search parameters
     */
    public function extractSearchQuery(string $message): array
    {
        $prompt = "Analisis intent pencarian user untuk marketplace UMKM desa.
        
        User Query: \"{$message}\"
        
        Tugas: Ekstrak parameter pencarian.
        
        Penting:
        1. Jika user bilang 'selain bunga', JANGAN masukan 'bunga' ke keyword. Cari alternatif relevan (misal: 'coklat', 'boneka', 'kado').
        2. Jika user cari 'makanan', set category='kuliner'.
        3. Jika user cari 'baju/kain', set category='kriya'.
        4. Jika user cari 'jasa/servis', set category='jasa'.
        5. Abaikan kata sambung (yang, untuk, buat, mau, ingin, pengen).
        6. Jika query tidak jelas (misal: 'apa ya'), set is_random=true.
        
        Output JSON Only:
        {
            \"keywords\": [\"keyword1\", \"keyword2\"],
            \"category\": \"kuliner|kriya|jasa|null\",
            \"max_price\": 50000 (integer/null),
            \"is_random\": false (true jika user minta 'terserah' atau 'apa aja')
        }";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->baseUrl, [
                        'model' => $this->model,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'temperature' => 0.1, // Very low temp for strict JSON
                        'max_tokens' => 200,
                        'response_format' => ['type' => 'json_object']
                    ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? '{}';

                // Cleanup
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
                $content = preg_replace('/```json\s*|\s*```/', '', $content);
                $content = trim($content);

                $data = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return array_merge([
                        'keywords' => [],
                        'category' => null,
                        'max_price' => null,
                        'is_random' => false
                    ], $data);
                }
            }
        } catch (\Exception $e) {
            Log::error('AI Extract Intent Error', ['message' => $e->getMessage()]);
        }

        // Fallback to basic extraction if AI fails
        return [
            'keywords' => [],
            'category' => null,
            'max_price' => null,
            'is_random' => false
        ];
    }

    /**
     * AI Full Catalog Search
     * Uses RAG-style selection: AI reads the catalog and picks exact Product IDs
     */
    public function extractProductIds(string $message, string $catalogContext): array
    {
        $prompt = "Kamu adalah mesin pencari pintar.
        
        DATA PRODUK (ID: Nama [Kategori] (Harga) {'Deskripsi Singkat'} (Toko)):
        {$catalogContext}
        
        QUERY USER: \"{$message}\"
        
        TUGAS PENTING:
        1. PAHAMI TYPO: Jika user ketik 'mkanana', artikan 'makanan'. 'bju' = 'baju'.
        2. PAHAMI KONSEP & DESKRIPSI: 
           - 'Bikin kenyang' = Cari Nasi, Lontong, atau Makanan Berat.
           - 'Pedas' = Cari kata 'pedas', 'mercon', 'jeletot', 'seblak' di NAMA atau DESKRIPSI.
           - 'Manis' = Cari coklat, kue, dessert.
        3. CARI MATCH: Pilih ID produk dari data di atas yang paling relevan. BACA DESKRIPSI SINGKATNYA JUGA.
        4. Jika user minta 'selain X', jangan pilih X.
        5. Pilih maksimal 6 produk terbaik.
        
        OUTPUT JSON:
        {
            \"product_ids\": [1, 5, 12],
            \"reason\": \"Nasi timbel cocok untuk bikin kenyang\"
        }";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'Content-Type' => 'application/json',
            ])->timeout(25)->post($this->baseUrl, [
                        'model' => $this->model,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'temperature' => 0.3, // Slightly higher for typo correction creativity
                        'max_tokens' => 300,
                        'response_format' => ['type' => 'json_object']
                    ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? '{}';
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
                $content = preg_replace('/```json\s*|\s*```/', '', $content);
                $content = trim($content);

                $data = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE && !empty($data['product_ids'])) {
                    return $data['product_ids'];
                }
            }
        } catch (\Exception $e) {
            Log::error('AI Product ID Extract Error', ['message' => $e->getMessage()]);
        }

        return []; // Return empty if failed, controller will handle fallback
    }

    /**
     * OPTIMIZED: Single-step Shopping Processor
     * Combines Product Selection + Chat Generation in ONE call to reduce latency.
     */
    public function processShoppingQuery(string $message, string $catalogContext): array
    {
        $prompt = "Kamu adalah asisten belanja pintar MUDAPRENEUR.
        
        DATA PRODUK (ID: Nama [Kategori] (Harga) {'Deskripsi Singkat'} (Toko)):
        {$catalogContext}
        
        QUERY USER: \"{$message}\"
        
        TUGAS (Lakukan sekaligus langkah 1 & 2):
        1. PILIH PRODUK: Cari 1-6 ID produk paling relevan dari data di atas (baca nama & deskripsi).
           - 'Pedas' = cari kata pedas/mercon/seblak.
           - 'Kenyang' = cari nasi/berat.
           - 'Minum' = cari minuman.
        
        2. BUAT JAWABAN: Buat balasan chat yang ramah (bahasa gaul sopan) merekomendasikan produk tersebut.
           - Sebutkan nama produknya dan kenapa cocok.
           - Focus value (murah/enak/sesuai request).
           - Pakai 1-2 emoji.
        
        OUTPUT WAJIB JSON:
        {
            \"product_ids\": [1, 12],
            \"message\": \"Halo Kak! Kalau mau yang pedas, aku rekomen Seblak (ID 1) nih, pedesnya nampol! 🔥 Atau cobain Baso Aci (ID 12) yang kuahnya seger banget.\"
        }";

        try {
            // Use Secondary API (Fast) for Shopping
            $this->useSecondaryApi();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->baseUrl, [
                        'model' => $this->model, // Use Configured Secondary Model
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 300,
                        'response_format' => ['type' => 'json_object']
                    ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? '{}';
                $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
                $content = preg_replace('/```json\s*|\s*```/', '', $content);
                $content = trim($content);

                $data = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return [
                        'product_ids' => $data['product_ids'] ?? [],
                        'response' => $data['message'] ?? "Maaf kak, aku bingung cari produknya. Coba kata kunci lain ya!"
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('AI Optimization Error', ['message' => $e->getMessage()]);
        }

        // Fallback default
        return [
            'product_ids' => [],
            'response' => null // Will trigger fallback logic in controller
        ];
    }
}
