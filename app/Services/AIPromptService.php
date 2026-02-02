<?php

namespace App\Services;

use App\Models\UmkmStore;
use Illuminate\Support\Facades\Http; // This might become unused, but the instruction doesn't explicitly remove it. I'll keep it for now.
use Illuminate\Support\Facades\Log;
use App\Services\AIService; // Added this import

class AIPromptService
{
    protected $aiService; // Added this property

    public function __construct(AIService $aiService) // Added constructor
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
            $systemPrompt = "Kamu adalah ahli video prompting untuk AI video generator (Sora). Tugasmu adalah MEMPERKUAT instruksi visual agar video menjadi DINAMIS dan HIDUP.
ATURAN WAJIB:
1. DESKRIPSI VISUAL (Scene, Camera, Action) harus dalam BAHASA INGGRIS.
2. Voice Over (VO) / Narasi harus TETAP BAHASA INDONESIA. JANGAN DITERJEMAHKAN.
3. JANGAN MEMPERSINGKAT deskripsi pergerakan kamera. Kamera harus SELALU BERGERAK.
4. Durasi Voice Over MAKSIMAL 10 DETIK. Potong kalimat jika terlalu panjang.
5. PERTAHANKAN setting & karakter INDONESIA.
6. WAJIB: Instruksikan AI untuk MENGGUNAKAN FOTO REFERENSI.

CONTOH FORMAT OUTPUT:
'A cinematic wide shot of [Scene Description] with dynamic tracking camera.
Voice Over: \"Kalimat Bahasa Indonesia pendek.\"
Cut to close up of [Action Description]...
Voice Over: \"Kalimat Bahasa Indonesia pendek.\"
TOTAL DURATION: 10 Seconds.'";

            // Use Primary API (Smart Model) for prompt enhancement
            $this->aiService->usePrimaryApi();
            $enhancedPrompt = $this->aiService->chat("Optimalkan prompt ini (JANGAN UBAH KONTEKS INDONESIA):\n\n" . $rawPrompt, $systemPrompt);

            if ($enhancedPrompt) {
                // Ensure reference photo instruction is included
                if (!str_contains(strtolower($enhancedPrompt), 'reference photo') && !str_contains(strtolower($enhancedPrompt), 'uploaded photo')) {
                    $enhancedPrompt .= "\n\nCRITICAL: Use the uploaded reference photo as the primary visual guide for the location/product.";
                }
                Log::info('Prompt enhanced successfully', ['length' => strlen($enhancedPrompt)]);
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
     * Construct the sophisticated video prompt for Sora.
     * Uses user's proven template for Indonesian UMKM videos.
     */
    public function constructVideoPrompt(
        string $storeName,
        string $category,
        string $description,
        string $location,
        string $contact,
        string $mode = 'store_photo'
    ): string {
        $categoryLabel = $this->getCategoryLabel($category);
        
        $prompt = <<<EOT
Gunakan foto usaha / produk yang diunggah sebagai REFERENSI LOKASI ATAU REFERENSI VISUAL SAJA.
AI harus MENYESUAIKAN jenis aktivitas, alat, produk, dan interaksi
sesuai dengan jenis usaha "$storeName" ($categoryLabel),
tanpa mengubah struktur adegan.

Deskripsi usaha dari pemilik: "$description"

Perbaiki kualitas visual agar terlihat lebih bersih, rapi, dan estetik,
namun tetap terlihat realistis dan alami seperti usaha UMKM Indonesia asli.

Buat video iklan UMKM yang DINAMIS dan HIDUP,
dengan PERPINDAHAN SUDUT KAMERA yang NATURAL,
bukan kamera diam, bukan satu angle saja.

TOTAL DURASI VIDEO MAKSIMAL 15 DETIK.

════════════════════════════════════════════════════════════════════
ATURAN VOICE OVER (WAJIB DIPATUHI):
1. SEMUA VOICE OVER HARUS DALAM BAHASA INDONESIA.
2. SEMUA VOICE OVER HARUS SELESAI SEBELUM DETIK KE-10.
3. DETIK 10–15 TANPA VOICE OVER SAMA SEKALI (HANYA MUSIK LATAR & TEKS).
4. Voice over SINGKAT dan PADAT, maksimal 2-3 kata per kalimat.
════════════════════════════════════════════════════════════════════

────────────────────
Adegan Opening (Detik 0-3):
Wide shot tampilan depan lokasi usaha atau area utama produk,
pencahayaan natural sesuai waktu (pagi / siang),
kamera bergerak pelan ke depan (tracking shot forward),
suasana hidup, profesional, dan ramah.

Voice over (BAHASA INDONESIA): "Usaha $categoryLabel terpercaya."

────────────────────
Adegan Aktivitas (Detik 3-5):
Medium shot pemilik atau pekerja usaha (dewasa Indonesia, ibu-ibu berjilbab atau bapak-bapak lokal),
berpakaian rapi dan sesuai jenis usaha,
melakukan AKTIVITAS UTAMA PRODUK (melayani, memasak, mengemas).
Gerakan tangan natural, aktif, tidak kaku.

Voice over (BAHASA INDONESIA): "Dikerjakan profesional."

────────────────────
Adegan Detail (Detik 5-7):
Close-up detail produk, alat kerja, tekstur, atau proses utama.
Fokus tajam, depth of field lembut.

Voice over (BAHASA INDONESIA): "Kualitas terbaik."

────────────────────
Adegan Interaksi (Detik 7-10):
Side angle shot, interaksi nyata antara pelaku usaha Indonesia dan pelanggan lokal
(serah terima produk, pelayanan singkat).
Kamera mengikuti gerakan secara smooth.

Voice over (BAHASA INDONESIA, KALIMAT TERAKHIR, HARUS SELESAI TEPAT DI DETIK 10):
"Pelayanan ramah."

════════════════════════════════════════════════════════════════════
SETELAH DETIK 10: TIDAK ADA VOICE OVER LAGI!
════════════════════════════════════════════════════════════════════

────────────────────
Adegan Penutup (Detik 10-15, TANPA VOICE OVER):
Pelaku usaha menoleh ke kamera sambil tersenyum,
gesture ramah dan mengundang,
kamera tetap bergerak halus (bukan freeze frame).

Teks overlay muncul secara HALUS (fade in):
$storeName
$location
$contact

Musik latar instrumental yang hangat dan uplifting.
Penutup tenang dan stabil hingga akhir video.

────────────────────
Gaya visual:
realistic cinematic video,
natural Indonesian atmosphere,
handheld cinematic feel ringan,
pencahayaan sesuai konteks usaha,
smooth motion,
hidup, tidak kaku, tidak seperti pose iklan studio.

────────────────────
NEGATIVE PROMPT:
pose kaku, kamera diam terlalu lama, freeze frame, satu angle saja,
gerakan robot, wajah aneh, uncanny, kartun, animasi, blur, low quality,
teks typo, voice over terpotong, voice over terlalu panjang,
voice over dalam bahasa Inggris, voice over setelah detik 10,
orang bule/barat, setting luar negeri, studio mewah
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
            'lainnya' => 'Usaha',
        ];
        return $labels[$category] ?? 'Usaha';
    }
}


