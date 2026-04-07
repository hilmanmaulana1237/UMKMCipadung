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
        // Use the same API config as video (Kie AI) for the key, but fix the base URL for jobs
        $config = ApiSetting::getConfig('video');
        $this->apiKey = $config['api_key'] ?? '';
        $this->baseUrl = 'https://api.kie.ai/api/v1/jobs'; // Harus /jobs, bukan /veo
        $this->model = 'seedream/4.5-edit'; // Bytedance Seedream 4.5 - better text rendering

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

        // Route to enhance product method if type is enhance
        if ($posterType === 'enhance') {
            return $this->generateEnhancedProduct($productImageUrl, $localFilePath);
        }

        try {
            // Prepare input array for Seedream 4.5-edit
            $input = [
                'prompt' => $this->buildPrompt($replacements, $productImageUrl, $posterType),
                'aspect_ratio' => '3:4', // Taller poster format for promotional flyers
                'quality' => 'high', // 4K quality for better text rendering
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
                $input['image_urls'][] = $this->resolveImageUrl($productImageUrl, $localFilePath);
            }

            Log::info('PosterAIService: Creating task payload', [
                'model' => $this->model,
                'input' => $input
            ]);

            return $this->submitTask($input);
        } catch (\Exception $e) {
            Log::error('PosterAIService Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate enhanced product photo using AI
     */
    public function generateEnhancedProduct(?string $productImageUrl, ?string $localFilePath = null): array
    {
        if (empty($productImageUrl)) {
            return [
                'success' => false,
                'error' => 'Foto produk wajib diupload untuk fitur percantik produk.',
            ];
        }

        try {
            $resolvedUrl = $this->resolveImageUrl($productImageUrl, $localFilePath);

            $input = [
                'prompt' => 'A high-end professional commercial studio photograph based exactly on the specific product shown in image. The product, including its exact label and branding, is rendered with premium materials and flawless execution, removing any imperfections from the original photo. It is placed in an appropriate, contextual professional environment with complementary props that naturally suit the product type shown (e.g., fresh ingredients for food, luxurious surfaces for cosmetics, clean tech setting for gadgets). Cinematic studio lighting that perfectly highlights textures and form. 8k resolution, photorealistic, sharp focus, masterpiece',
                'aspect_ratio' => '1:1', // Square format for product photos
                'quality' => 'high',
                'image_urls' => [$resolvedUrl],
            ];

            Log::info('PosterAIService: Creating enhance product task', [
                'model' => $this->model,
                'input' => $input
            ]);

            return $this->submitTask($input);
        } catch (\Exception $e) {
            Log::error('PosterAIService Enhanced Product Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Resolve image URL - handle local URLs by uploading to temp host
     */
    private function resolveImageUrl(string $imageUrl, ?string $localFilePath = null): string
    {
        if (str_contains($imageUrl, 'localhost') || str_contains($imageUrl, '127.0.0.1') || str_contains($imageUrl, ':8000')) {
            $publicUrl = null;
            if ($localFilePath && file_exists($localFilePath)) {
                Log::info('PosterAIService: Uploading local image to temp host...', ['path' => $localFilePath]);
                $publicUrl = $this->uploadToTempHost($localFilePath);
            }

            if ($publicUrl) {
                return $publicUrl;
            }

            Log::warning('PosterAIService: Upload failed or no local path. Using placeholder image.', ['original' => $imageUrl]);
            return 'https://tempfileb.aiquickdraw.com/kieai/market/1768682951963_k0D05XBN.jpeg';
        }

        return $imageUrl;
    }

    /**
     * Submit task to Kie AI API
     */
    private function submitTask(array $input): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($this->baseUrl . '/createTask', [
                    'model' => $this->model,
                    'input' => $input,
                ]);

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
    }

    /**
     * Upload local file to temporary host (file.io) for AI access
     */
    private function uploadToTempHost(string $path): ?string
    {
        try {
            $response = Http::attach(
                'file',
                file_get_contents($path),
                basename($path)
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
                        'taskId' => $taskId,
                    ]);

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
     * Build comprehensive prompt for poster generation (makanan only now)
     */
    private function buildPrompt(array $replacements, ?string $productImageUrl, string $posterType): string
    {
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
        }

        $prompt .= "3. TEXT REPLACEMENTS (SPELL EXACTLY AS SHOWN):\n\n";
        $prompt .= $this->buildFoodPosterReplacements($replacements);

        $prompt .= "\n4. CRITICAL TEXT RULES:\n";
        $prompt .= "- VERIFY every letter of every word is correct\n";
        $prompt .= "- NO typos, NO missing letters, NO extra letters\n";
        $prompt .= "- All text must be FULLY VISIBLE, not cropped or cut off\n";
        $prompt .= "- Remove any placeholder text not replaced\n\n";

        $prompt .= "5. FINAL CHECK: Before generating, verify ALL text spellings are 100% accurate.";

        return $prompt;
    }

    /**
     * Add letter-by-letter spelling hint for critical text
     */
    private function addSpellingHint(string $text): string
    {
        $letters = mb_str_split($text);
        return implode('-', $letters);
    }

    /**
     * Build replacement instructions for food poster
     */
    private function buildFoodPosterReplacements(array $r): string
    {
        $text = "";

        if (!empty($r['store_name'])) {
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

        ];
    }

    /**
     * Download and save generated poster
     */
    public function downloadAndSavePoster(string $imageUrl, int $umkmId): ?string
    {
        try {
            $response = Http::timeout(30)->get($imageUrl);

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
