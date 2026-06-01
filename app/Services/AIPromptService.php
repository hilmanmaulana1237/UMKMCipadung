<?php

namespace App\Services;

use App\Models\UmkmStore;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\AIService;

class AIPromptService
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Enhance the raw prompt using AI before sending to video generator.
     * MAINTAINS INDONESIAN UMKM CONTEXT!
     */
    public function enhancePromptWithAI(string $rawPrompt): string
    {
        try {
            $systemPrompt = "You are an expert at crafting UGC (User Generated Content) TikTok-style video prompts for AI video generators (Veo 3.1).
Your job is to ENHANCE the visual instructions to make the video look like an AUTHENTIC, ORGANIC TikTok review — NOT a commercial ad.

MANDATORY RULES:
1. VISUAL DESCRIPTIONS (Scene, Camera, Action) must be in ENGLISH.
2. Dialogue / Voice lines must STAY in BAHASA INDONESIA. DO NOT translate them.
3. Maintain HANDHELD smartphone camera feel — slightly shaky, natural, NOT cinematic.
4. The person must look like a REAL TikTok creator, NOT a model or actor.
5. KEEP Indonesian setting and characters. Young Indonesian woman (20-25 years old).
6. MUST instruct AI to USE THE UPLOADED REFERENCE PHOTO as the exact product/store reference.
7. The product in the video MUST look IDENTICAL to the uploaded photo (same shape, color, label, branding).
8. TOTAL VIDEO DURATION: MAXIMUM 8 SECONDS. No longer!
9. TOTAL DIALOGUE: MAXIMUM 6 SECONDS. Keep it ultra short and punchy like real TikTok.
10. Add modern TikTok-style text subtitles overlaid on video.
11. Add subtle trendy lo-fi / aesthetic background music.

OUTPUT FORMAT:
'Smartphone selfie-angle shot, handheld slightly shaky camera. [Scene Description].
The girl speaks to camera: \"Short Bahasa Indonesia dialogue (max 6 seconds).\"
Cut to close-up of product [matching reference photo exactly]...
TikTok-style subtitle text appears on screen.
TOTAL DURATION: 8 Seconds MAX.'";

            $this->aiService->usePrimaryApi();
            $enhancedPrompt = $this->aiService->chat("Optimize this UGC TikTok-style video prompt. CRITICAL: Total video MAX 8 seconds, dialogue MAX 6 seconds. Keep it ultra short!\n\n" . $rawPrompt, $systemPrompt);

            if ($enhancedPrompt) {
                if (!str_contains(strtolower($enhancedPrompt), 'reference photo') && !str_contains(strtolower($enhancedPrompt), 'uploaded photo')) {
                    $enhancedPrompt .= "\n\nCRITICAL: The product/store MUST look 100% identical to the uploaded reference photo. Do NOT redesign or reinterpret. Keep branding consistent.";
                }
                Log::info('UGC Prompt enhanced successfully', ['length' => strlen($enhancedPrompt)]);
                return trim($enhancedPrompt);
            }

            Log::warning('AI Service enhancement return empty, using original prompt');
            return $rawPrompt;
        } catch (\Exception $e) {
            Log::error('AIPromptService enhancePromptWithAI error: ' . $e->getMessage());
            return $rawPrompt;
        }
    }

    /**
     * Construct simplified UGC TikTok-style video prompt as requested by user.
     */
    public function constructVideoPrompt(string $productName, string $category = 'lainnya'): string
    {
        $productLower = strtolower($productName);
        $categoryLower = strtolower($category);

        // Detect product type for natural actions and dialogues
        if (
            str_contains($productLower, 'buku') || 
            str_contains($productLower, 'novel') || 
            str_contains($productLower, 'komik') || 
            str_contains($productLower, 'kitab') || 
            str_contains($productLower, 'majalah') || 
            str_contains($productLower, 'kamus') || 
            str_contains($productLower, 'bacaan') ||
            $categoryLower === 'buku'
        ) {
            $actionDescription = "Subjek menampilkan produk secara natural (dipegang, dibaca sekilas halamannya, atau diperlihatkan sampul/halaman bukunya)";
            $dialogText = "“Bukunya bagus banget, aku udah baca sendiri. Kalian wajib coba.”";
            $usageDescription = "memperlihatkan isi atau halaman produk";
        } elseif (
            str_contains($productLower, 'makanan') || 
            str_contains($productLower, 'minuman') || 
            str_contains($productLower, 'kue') || 
            str_contains($productLower, 'roti') || 
            str_contains($productLower, 'kopi') || 
            str_contains($productLower, 'teh') || 
            str_contains($productLower, 'keripik') || 
            str_contains($productLower, 'baso') || 
            str_contains($productLower, 'bakso') || 
            str_contains($productLower, 'sambal') || 
            str_contains($productLower, 'cemilan') || 
            str_contains($productLower, 'dimsum') || 
            str_contains($productLower, 'jajanan') ||
            $categoryLower === 'kuliner'
        ) {
            $actionDescription = "Subjek menampilkan produk secara natural (dipegang, dicicipi, diminum, atau diperlihatkan tekstur makanannya)";
            $dialogText = "“Ini enak banget, aku udah cobain sendiri. Kalian wajib coba.”";
            $usageDescription = "mencicipi atau memperlihatkan kenikmatan produk";
        } elseif (
            str_contains($productLower, 'baju') || 
            str_contains($productLower, 'celana') || 
            str_contains($productLower, 'hijab') || 
            str_contains($productLower, 'kerudung') || 
            str_contains($productLower, 'kaos') || 
            str_contains($productLower, 'jaket') || 
            str_contains($productLower, 'sepatu') || 
            str_contains($productLower, 'sandal') || 
            str_contains($productLower, 'tas') || 
            str_contains($productLower, 'pakaian') || 
            str_contains($productLower, 'gamis') ||
            $categoryLower === 'fashion'
        ) {
            $actionDescription = "Subjek menampilkan produk secara natural (dipakai, dicoba, atau diperagakan secara langsung)";
            $dialogText = "“Produknya bagus banget, aku udah pakai sendiri. Kalian wajib coba.”";
            $usageDescription = "penggunaan atau penampilan produk saat dipakai";
        } elseif ($categoryLower === 'jasa') {
            $actionDescription = "Subjek menampilkan layanan secara natural (menunjukkan interaksi pelayanan atau hasil dari layanan tersebut)";
            $dialogText = "“Layanannya mantap banget, aku udah ngerasain sendiri. Kalian wajib coba.”";
            $usageDescription = "proses atau hasil dari layanan tersebut";
        } else {
            // Default universal dialogue for crafts/others
            $actionDescription = "Subjek menampilkan produk secara natural (dipegang, digunakan, atau diperlihatkan detail produknya secara jelas)";
            $dialogText = "“Ini beneran bagus banget, aku suka banget sama produknya. Kalian wajib coba.”";
            $usageDescription = "detail, keunikan, atau fitur produk";
        }

        $prompt = <<<EOT
PROMPT VIDEO UGC (REALISTIS, ≤ 8 DETIK)

Gunakan gambar gabungan (subjek + produk) sebagai frame utama.
Buat video UGC realistis dengan durasi maksimal 8 detik.

Konsep:
Seorang pelaku UMKM / individu biasa merekomendasikan produk ($productName) secara natural, seperti video TikTok atau WhatsApp Story.

Detail Adegan:
- $actionDescription
- Gerakan produk tetap halus agar detail produk terlihat jelas ke kamera
- Ekspresi ramah, tulus, dan meyakinkan
- Gerakan kecil yang natural (angguk, senyum, atau sedikit mendekat ke kamera)
- Kamera handheld (sedikit goyang halus seperti rekaman HP)
- Background sederhana (rumah, dapur, atau warung kecil)

Pencahayaan:
- Natural, seperti siang hari dari jendela
- Bukan lighting studio (sedikit imperfect tapi tetap jelas)

Dialog (maks 6 detik, bahasa Indonesia santai):
$dialogText

Timing:
0–2 detik: subjek melihat kamera + senyum
2–6 detik: menyampaikan dialog sambil memperlihatkan $usageDescription
6–8 detik: fokus produk + ekspresi positif (tanpa dialog)

Audio:
- Suara asli (natural, tidak terlalu jernih seperti studio)
- Tambahkan sedikit ambient lingkungan sekitar (opsional)

Style:
- UGC, autentik, tidak terlihat seperti iklan formal
Output:
- Resolusi tinggi
- Fokus utama pada wajah subjek dan produk

CRITICAL VISUAL CONSTRAINTS FOR AI:
1. STRICTLY PRESERVE the exact appearance of the product from the reference image.
2. DO NOT alter, morph, or redesign the product's shape, color, label, text, or branding. It must remain 100% identical to the first frame.
3. Only animate the person's subtle movements and facial expressions. Keep the product consistent and free from AI artifacts or distortion throughout the video.
EOT;

        return $prompt;
    }

    /**
     * Get human-readable category label
     */
    private function getCategoryLabel(string $category): string
    {
        $labels = [
            'kuliner' => 'Kuliner / Makanan',
            'fashion' => 'Fashion / Pakaian',
            'kerajinan' => 'Kerajinan / Handmade',
            'jasa' => 'Jasa / Service',
            'pertanian' => 'Pertanian / Agro',
            'lainnya' => 'Produk',
        ];
        return $labels[$category] ?? 'Produk';
    }
}
