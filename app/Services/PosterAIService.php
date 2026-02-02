<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\ApiSetting;

class PosterAIService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        // Use the same API config as video (Kie AI)
        $config = ApiSetting::getConfig('video');
        $this->apiKey = $config['api_key'] ?? '';
        $this->baseUrl = $config['base_url'] ?: 'https://api.kie.ai/api/v1/jobs';
<<<<<<< HEAD
        $this->model = 'seedream/4.5-edit'; // Bytedance Seedream 4.5 - better text rendering
=======
        $this->model = 'google/nano-banana-edit'; // Gemini 2.5 Flash Image Edit
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9

        // Safety check: Fix for issue where OpenRouter URL is incorrectly set for Video config
        if (str_contains($this->baseUrl, 'openrouter.ai')) {
            Log::warning('PosterAIService: Detected OpenRouter URL in Config. Forcing reset to Kie AI default.');
            $this->baseUrl = 'https://api.kie.ai/api/v1/jobs';
        }

        if (empty($this->apiKey)) {
            Log::warning('PosterAIService: API Key is missing or not configured.');
        }
    }

    /**
     * Generate poster from template with text replacements
     */
    public function generatePoster(string $templatePath, array $replacements, ?string $productImageUrl = null, string $posterType = 'makanan', ?string $localFilePath = null): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'error' => 'Kie AI API Key is not configured in Admin Settings.',
            ];
        }

        try {
<<<<<<< HEAD
            // Prepare input array for Seedream 4.5-edit
            $input = [
                'prompt' => $this->buildPrompt($replacements, $productImageUrl, $posterType),
                'aspect_ratio' => '3:4', // Taller poster format for promotional flyers
                'quality' => 'high', // 4K quality for better text rendering
=======
            // Prepare input array
            $input = [
                'prompt' => $this->buildPrompt($replacements, $productImageUrl, $posterType),
                'output_format' => 'jpeg',
                'image_size' => '3:4', // Taller poster to avoid cropping
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            ];

            // Add template URL
            // Ensure template path is absolute public URL
            if (!str_starts_with($templatePath, 'http')) {
                $input['image_urls'] = [asset($templatePath)];
            } else {
                $input['image_urls'] = [$templatePath];
            }

            // Add product image if provided
            if ($productImageUrl) {
                // If the URL is local (localhost/127.0.0.1), try to upload to temp host
                if (str_contains($productImageUrl, 'localhost') || str_contains($productImageUrl, '127.0.0.1') || str_contains($productImageUrl, ':8000')) {
<<<<<<< HEAD

=======
                    
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
                    $publicUrl = null;
                    if ($localFilePath && file_exists($localFilePath)) {
                        Log::info('PosterAIService: Uploading local image to temp host...', ['path' => $localFilePath]);
                        $publicUrl = $this->uploadToTempHost($localFilePath);
                    }

                    if ($publicUrl) {
                        $input['image_urls'][] = $publicUrl;
                    } else {
                        Log::warning('PosterAIService: Upload failed or no local path. Using placeholder image.', ['original' => $productImageUrl]);
                        // Use the specific Dimsum image URL provided/used by user that is known to work
                        $fallbackUrl = 'https://tempfileb.aiquickdraw.com/kieai/market/1768682951963_k0D05XBN.jpeg';
                        $input['image_urls'][] = $fallbackUrl;
                    }
<<<<<<< HEAD

=======
                    
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
                } else {
                    // Public URL (Production)
                    $input['image_urls'][] = $productImageUrl;
                }
            }


            Log::info('PosterAIService: Creating task payload', [
                'model' => $this->model,
                'input' => $input
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/createTask', [
<<<<<<< HEAD
                        'model' => $this->model,
                        'input' => $input,
                    ]);
=======
                'model' => $this->model,
                'input' => $input,
            ]);
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9

            if ($response->successful()) {
                $data = $response->json();
                if ($data['code'] === 200) {
                    return [
                        'success' => true,
                        'task_id' => $data['data']['taskId'],
                    ];
                }
                Log::error('PosterAI API Error', ['response' => $data]);
                return [
                    'success' => false,
                    'error' => $data['msg'] ?? $data['message'] ?? 'Unknown error',
                ];
            }

            Log::error('PosterAI HTTP Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [
                'success' => false,
                'error' => 'HTTP Error: ' . $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('PosterAIService Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Upload local file to temporary host (file.io) for AI access
     */
    private function uploadToTempHost(string $path): ?string
    {
        try {
            $response = Http::attach(
<<<<<<< HEAD
                'file',
                file_get_contents($path),
                basename($path)
=======
                'file', file_get_contents($path), basename($path)
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            )->post('https://file.io/?expires=1d');

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success']) {
                    Log::info('PosterAIService: Uploaded to file.io', ['url' => $data['link']]);
                    return $data['link'];
                }
            }
            Log::error('PosterAIService: file.io upload failed', ['body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('PosterAIService: file.io exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Query task status (same endpoint as video)
     */
    public function queryTaskStatus(string $taskId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(30)->get('https://api.kie.ai/api/v1/jobs/recordInfo', [
<<<<<<< HEAD
                        'taskId' => $taskId,
                    ]);
=======
                'taskId' => $taskId,
            ]);
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9

            if ($response->successful()) {
                $data = $response->json();
                Log::info('PosterAI Status Response', ['task_id' => $taskId, 'response' => $data]);

                if ($data['code'] === 200) {
                    $taskData = $data['data'];

                    // Parse resultJson if exists
                    $resultUrls = [];
                    if (!empty($taskData['resultJson'])) {
                        $result = json_decode($taskData['resultJson'], true);
                        $resultUrls = $result['resultUrls'] ?? [];
                    }

                    return [
                        'success' => true,
                        'state' => $taskData['state'],
                        'image_urls' => $resultUrls,
                        'fail_msg' => $taskData['failMsg'] ?? null,
                    ];
                }
                return [
                    'success' => false,
                    'error' => $data['message'] ?? 'Unknown error',
                ];
            }

            return [
                'success' => false,
                'error' => 'HTTP Error: ' . $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('PosterAI queryTaskStatus error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build comprehensive prompt for poster generation
     */
    private function buildPrompt(array $replacements, ?string $productImageUrl, string $posterType): string
    {
<<<<<<< HEAD
        $prompt = "CRITICAL TEXT ACCURACY REQUIREMENT: Every text must be spelled EXACTLY as provided. Double-check each letter.\n\n";

        $prompt .= "Create a promotional flyer based on the template design, layout, typography, and background.\n\n";

        $prompt .= "1. PRESERVE FROM TEMPLATE:\n";
        $prompt .= "- Background colors, gradients, decorative elements\n";
        $prompt .= "- Font styles, colors, sizes, and positions\n";
        $prompt .= "- Decorative graphics and doodles\n\n";

        if ($productImageUrl && $posterType === 'makanan') {
            $prompt .= "2. PRODUCT REPLACEMENT:\n";
            $prompt .= "- Replace the product image in template with the provided product image (second image)\n";
            $prompt .= "- Match lighting with background\n\n";
        } elseif ($posterType === 'jasa') {
            $prompt .= "2. SERVICE POSTER TYPE:\n";
            $prompt .= "- Display the list of services\n";
            $prompt .= "- Keep the layout from template\n";

            if ($productImageUrl) {
                $prompt .= "- Replace main illustration with provided image\n";
=======
        $prompt = "Instruksi Utama: Buatlah sebuah gambar flyer promosi berdasarkan struktur desain, tata letak, tipografi, dan latar belakang dari template yang diberikan.\n\n";

        $prompt .= "1. Referensi Gambar & Latar Belakang (Pertahankan dari template):\n";
        $prompt .= "- Pertahankan latar belakang, gradien warna, dan efek visual asli.\n";
        $prompt .= "- Pertahankan semua elemen dekoratif latar belakang.\n";
        $prompt .= "- Pertahankan elemen grafis, garis, panah doodle di sekitar area produk.\n";
        $prompt .= "- Pertahankan SEMUA gaya font, warna font, ukuran font, dan posisi teks asli.\n\n";

        if ($productImageUrl && $posterType === 'makanan') {
            $prompt .= "2. Penggantian Produk Utama:\n";
            $prompt .= "- Gantikan gambar produk di tengah template dengan gambar produk yang disediakan (gambar kedua).\n";
            $prompt .= "- Pastikan pencahayaan pada produk menyatu dengan suasana latar belakang flyer.\n";
            $prompt .= "- Pertahankan komposisi dan framing yang sama.\n\n";
        } elseif ($posterType === 'jasa') {
            $prompt .= "2. Tipe Poster: DAFTAR LAYANAN/JASA\n";
            $prompt .= "- Ini adalah poster untuk menampilkan DAFTAR LAYANAN/JASA yang tersedia.\n";
            $prompt .= "- Template memiliki area untuk menampilkan daftar layanan dengan nomor atau bullet points.\n";
            $prompt .= "- Pertahankan layout daftar layanan dari template, hanya ganti teks placeholder.\n";
            
            if ($productImageUrl) {
                $prompt .= "- GANTI gambar ilustrasi utama/ikon dengan gambar yang disediakan (gambar kedua).\n";
                $prompt .= "- Integrasikan gambar tersebut dengan halus ke dalam desain.\n";
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            }
            $prompt .= "\n";
        }

<<<<<<< HEAD
        $prompt .= "3. TEXT REPLACEMENTS (SPELL EXACTLY AS SHOWN):\n\n";
=======
        $prompt .= "3. Pengeditan Teks (Masukkan Variabel Baru):\n";
        $prompt .= "Ubah placeholder teks asli di template dengan data berikut, menggunakan GAYA FONT, WARNA, dan UKURAN yang SAMA dengan template aslinya:\n\n";
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9

        // Map replacements based on poster type
        if ($posterType === 'makanan') {
            $prompt .= $this->buildFoodPosterReplacements($replacements);
        } else {
            $prompt .= $this->buildServicePosterReplacements($replacements);
        }

<<<<<<< HEAD
        $prompt .= "\n4. CRITICAL TEXT RULES:\n";
        $prompt .= "- VERIFY every letter of every word is correct\n";
        $prompt .= "- NO typos, NO missing letters, NO extra letters\n";
        $prompt .= "- All text must be FULLY VISIBLE, not cropped or cut off\n";
        $prompt .= "- Remove any placeholder text not replaced\n\n";

        $prompt .= "5. FINAL CHECK: Before generating, verify ALL text spellings are 100% accurate.";
=======
        $prompt .= "\n4. ATURAN PENTING:\n";
        $prompt .= "- HAPUS semua teks placeholder yang tidak diganti (seperti 'Nama Jasa', 'Nama Produk', 'Nama Warung' dll).\n";
        $prompt .= "- PASTIKAN ejaan semua teks BENAR dan AKURAT sesuai data yang diberikan.\n";
        $prompt .= "- JANGAN mengubah atau salah eja teks yang diberikan.\n";
        $prompt .= "- Pastikan SEMUA teks terlihat lengkap dan tidak terpotong.\n\n";

        $prompt .= "Hasil Akhir: Sebuah flyer yang kohesif, terlihat profesional, menggabungkan latar belakang template dengan semua teks baru yang telah ditentukan di atas. Jaga kualitas gambar tetap tinggi dan resolusi maksimal.";
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9

        return $prompt;
    }

    /**
<<<<<<< HEAD
     * Add letter-by-letter spelling hint for critical text
     */
    private function addSpellingHint(string $text): string
    {
        $letters = mb_str_split($text);
        return implode('-', $letters);
    }

    /**
=======
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
     * Build replacement instructions for food poster
     */
    private function buildFoodPosterReplacements(array $r): string
    {
        $text = "";

        if (!empty($r['store_name'])) {
<<<<<<< HEAD
            $spelled = $this->addSpellingHint($r['store_name']);
            $text .= "- STORE NAME: \"{$r['store_name']}\" (spelled: {$spelled})\n";
        }

        if (!empty($r['product_name'])) {
            $spelled = $this->addSpellingHint($r['product_name']);
            $text .= "- PRODUCT NAME (main large text): \"{$r['product_name']}\" (spelled: {$spelled})\n";
            $text .= "  IMPORTANT: Write EXACTLY \"{$r['product_name']}\" - verify each letter!\n";
        }

        if (!empty($r['slogan'])) {
            $text .= "- SLOGAN/TAGLINE: \"{$r['slogan']}\"\n";
        }

        if (!empty($r['price'])) {
            $spelled = $this->addSpellingHint($r['price']);
            $text .= "- PRICE TEXT: \"{$r['price']}\" (spelled: {$spelled})\n";
            $text .= "  NOTE: Use word \"Harga\" (H-a-r-g-a) NOT \"Haria\"\n";
        }

        if (!empty($r['phone'])) {
            $text .= "- PHONE (near phone icon): \"{$r['phone']}\"\n";
        }

        if (!empty($r['address'])) {
            $text .= "- ADDRESS (near location icon): \"{$r['address']}\"\n";
=======
            $text .= "- Teks 'Nama Warung' atau 'NAMA WARUNG': Ubah menjadi \"{$r['store_name']}\".\n";
        }

        if (!empty($r['product_name'])) {
            $text .= "- Teks 'Nama Produk' atau 'NAMA PRODUK': Ubah menjadi \"{$r['product_name']}\".\n";
        }

        if (!empty($r['slogan'])) {
            $text .= "- Teks 'Slogan': Ubah menjadi \"{$r['slogan']}\".\n";
        }

        if (!empty($r['price'])) {
            $text .= "- Teks 'Harga' atau area harga: Ubah menjadi \"{$r['price']}\".\n";
        }

        if (!empty($r['phone'])) {
            $text .= "- Di sebelah ikon telepon atau teks 'Nomor Telepon' / 'Nomor-telepon': Ubah menjadi \"{$r['phone']}\".\n";
        }

        if (!empty($r['address'])) {
            $text .= "- Di sebelah ikon lokasi atau teks 'Alamat Toko' / 'Alamat': Ubah menjadi \"{$r['address']}\".\n";
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
        }

        return $text;
    }

    /**
     * Build replacement instructions for service list poster
     */
    private function buildServicePosterReplacements(array $r): string
    {
        $text = "";

        if (!empty($r['store_name'])) {
            $text .= "- Teks header 'Nama Toko' atau 'NAMA TOKO' atau 'NAMA USAHA': Ubah menjadi \"{$r['store_name']}\".\n";
        }

        if (!empty($r['service_name'])) {
            $text .= "- GANTI SEPENUHNYA teks 'Nama Jasa' atau 'NAMA JASA' dengan \"{$r['service_name']}\" (HAPUS kata 'Nama Jasa' dari poster).\n";
        }

        if (!empty($r['slogan'])) {
            $text .= "- Teks tagline/slogan atau 'SLOGAN': Ubah menjadi \"{$r['slogan']}\".\n";
        }

        // Handle services list - THE KEY PART
        if (!empty($r['services']) && is_array($r['services'])) {
            $serviceCount = count($r['services']);
            $text .= "\n- DAFTAR LAYANAN (List Services):\n";
            $text .= "  Ganti seluruh daftar layanan/jasa pada template dengan daftar berikut:\n";
<<<<<<< HEAD

=======
            
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            foreach ($r['services'] as $index => $service) {
                $num = $index + 1;
                $text .= "  {$num}. {$service}\n";
            }
<<<<<<< HEAD

=======
            
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            $text .= "  \n";
            $text .= "  PENTING: Tampilkan SEMUA {$serviceCount} layanan di atas dalam format daftar bernomor atau bullet point.\n";
            $text .= "  Jika template memiliki lebih sedikit item, tambahkan item baru dengan styling yang sama.\n";
            $text .= "  Jika template memiliki lebih banyak item, hilangkan item yang tidak diperlukan.\n";
            $text .= "  Pertahankan gaya visual, font, dan warna dari item daftar asli.\n\n";
        }

        if (!empty($r['phone'])) {
            $text .= "- Di area kontak / 'Nomor Telpon' / 'HUBUNGI KAMI' / 'CONTACT': Ubah menjadi \"{$r['phone']}\".\n";
        }

        if (!empty($r['address'])) {
            $text .= "- Di area alamat / 'Alamat Toko' / 'ALAMAT' / 'LOKASI': Ubah menjadi \"{$r['address']}\".\n";
        }

        return $text;
    }

    /**
     * Get template URL from storage path
     */
    private function getTemplateUrl(string $templatePath): string
    {
        // If it's already a full URL, return as-is
        if (str_starts_with($templatePath, 'http')) {
            return $templatePath;
        }

        // Convert storage path to public URL
        return asset('storage/' . $templatePath);
    }

    /**
     * Get available poster templates
     * Using GitHub-hosted templates for testing
     */
    public static function getTemplates(): array
    {
        $githubBase = 'https://github.com/hilman1237050020/datafoto/blob/main/';
<<<<<<< HEAD

=======
        
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
        return [
            'makanan' => [
                [
                    'path' => $githubBase . '1.png?raw=true',
                    'name' => 'Template Makanan 1',
                    'url' => $githubBase . '1.png?raw=true',
                ],
                [
                    'path' => $githubBase . '2.png?raw=true',
                    'name' => 'Template Makanan 2',
                    'url' => $githubBase . '2.png?raw=true',
                ],
                [
                    'path' => $githubBase . '3.png?raw=true',
                    'name' => 'Template Makanan 3',
                    'url' => $githubBase . '3.png?raw=true',
                ],
                [
                    'path' => $githubBase . '4.png?raw=true',
                    'name' => 'Template Makanan 4',
                    'url' => $githubBase . '4.png?raw=true',
                ],
            ],
            'jasa' => [
                [
                    'path' => $githubBase . '5.png?raw=true',
                    'name' => 'Template Jasa 1',
                    'url' => $githubBase . '5.png?raw=true',
                ],
                [
                    'path' => $githubBase . '6.png?raw=true',
                    'name' => 'Template Jasa 2',
                    'url' => $githubBase . '6.png?raw=true',
                ],
            ],
        ];
    }

    /**
     * Download and save generated poster
     */
    public function downloadAndSavePoster(string $imageUrl, int $umkmId): ?string
    {
        try {
            $response = Http::timeout(30)->get($imageUrl);
<<<<<<< HEAD

=======
            
>>>>>>> 13b4fdec4db7d79efecf96089fcbe7af372482d9
            if ($response->successful()) {
                $filename = "generated-posters/{$umkmId}_" . time() . ".png";
                Storage::disk('public')->put($filename, $response->body());
                return $filename;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('PosterAI download error: ' . $e->getMessage());
            return null;
        }
    }
}
