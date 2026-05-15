<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ApiSetting;

class KieAIService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $config = ApiSetting::getConfig('video');
        $this->apiKey = $config['api_key'] ?? '';

        // Veo 3.1 API base URL (different from old Jobs API)
        $this->baseUrl = 'https://api.kie.ai/api/v1/veo';

        // Use veo3_lite model (most cost-effective for high-volume generation)
        $this->model = 'veo3_lite';

        if (empty($this->apiKey)) {
            Log::warning('KieAIService: API Key is missing or not configured.');
        } else {
            Log::info('KieAIService: Config loaded successfully (Veo 3.1 Lite).', [
                'has_key' => true,
                'key_preview' => substr($this->apiKey, 0, 5) . '...',
                'base_url' => $this->baseUrl,
                'model' => $this->model,
            ]);
        }
    }

    /**
     * Create a video generation task using Veo 3.1 API
     *
     * Uses FIRST_AND_LAST_FRAMES_2_VIDEO mode when an image is provided,
     * falls back to TEXT_2_VIDEO when no image is given.
     *
     * @param string $prompt Text prompt describing desired video content
     * @param string $imageUrl Public URL of reference image
     * @param string $aspectRatio '16:9' or '9:16'
     * @param string $duration Not used by Veo API (fixed duration), kept for backward compat
     */
    public function createVideoTask(string $prompt, string $imageUrl, string $aspectRatio = 'landscape', string $duration = '10'): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'error' => 'Kie AI API Key is not configured in Admin Settings.',
            ];
        }

        try {
            // Map legacy aspect ratio values to Veo 3.1 format
            $veoAspectRatio = match ($aspectRatio) {
                'portrait', '9:16' => '9:16',
                default => '16:9', // landscape, 16:9, or any other value
            };

            // Build request payload for Veo 3.1 API
            $payload = [
                'prompt' => $prompt,
                'model' => $this->model,
                'aspect_ratio' => $veoAspectRatio,
                'enableTranslation' => true, // Auto-translate non-English prompts
            ];

            // If image URL is provided, use image-to-video mode
            if (!empty($imageUrl)) {
                $payload['imageUrls'] = [$imageUrl];
                $payload['generationType'] = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
            } else {
                $payload['generationType'] = 'TEXT_2_VIDEO';
            }

            Log::info('KieAI Veo 3.1: Sending generate request', [
                'model' => $this->model,
                'generationType' => $payload['generationType'],
                'aspect_ratio' => $veoAspectRatio,
                'has_image' => !empty($imageUrl),
                'prompt_length' => strlen($prompt),
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/generate', $payload);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('KieAI Veo 3.1: Response received', ['response' => $data]);

                if (isset($data['code']) && $data['code'] === 200) {
                    return [
                        'success' => true,
                        'task_id' => $data['data']['taskId'],
                    ];
                }

                Log::error('KieAI Veo 3.1 API Error', ['response' => $data]);
                return [
                    'success' => false,
                    'error' => $data['msg'] ?? $data['message'] ?? 'Unknown Veo API error (code: ' . ($data['code'] ?? 'N/A') . ')',
                ];
            }

            Log::error('KieAI Veo 3.1 HTTP Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [
                'success' => false,
                'error' => 'HTTP Error: ' . $response->status() . ' - ' . substr($response->body(), 0, 200),
            ];
        } catch (\Exception $e) {
            Log::error('KieAI Veo 3.1 createVideoTask Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Query task status using Veo 3.1 record-info endpoint
     *
     * Status response from Veo 3.1 API differs from the old Jobs API:
     * - data.resultUrls: array of video URLs (when completed)
     * - data.state: task state (e.g. 'success', 'fail', 'generating', 'queuing')
     */
    public function queryTaskStatus(string $taskId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(30)->get($this->baseUrl . '/record-info', [
                'taskId' => $taskId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('KieAI Veo 3.1 Status Response', ['task_id' => $taskId, 'response' => $data]);

                if (isset($data['code']) && $data['code'] === 200) {
                    $taskData = $data['data'] ?? [];

                    // Veo 3.1 API returns resultUrls directly in data
                    $resultUrls = [];

                    // Check for resultUrls directly in data
                    if (!empty($taskData['resultUrls'])) {
                        // resultUrls can be a JSON string or an array
                        if (is_string($taskData['resultUrls'])) {
                            $decoded = json_decode($taskData['resultUrls'], true);
                            $resultUrls = is_array($decoded) ? $decoded : [$taskData['resultUrls']];
                        } else {
                            $resultUrls = $taskData['resultUrls'];
                        }
                    }

                    // Also check nested info.resultUrls (callback format)
                    if (empty($resultUrls) && !empty($taskData['info']['resultUrls'])) {
                        if (is_string($taskData['info']['resultUrls'])) {
                            $decoded = json_decode($taskData['info']['resultUrls'], true);
                            $resultUrls = is_array($decoded) ? $decoded : [$taskData['info']['resultUrls']];
                        } else {
                            $resultUrls = $taskData['info']['resultUrls'];
                        }
                    }

                    // Check nested response.resultUrls (Veo 3.1 actual format)
                    if (empty($resultUrls) && !empty($taskData['response']['resultUrls'])) {
                        if (is_string($taskData['response']['resultUrls'])) {
                            $decoded = json_decode($taskData['response']['resultUrls'], true);
                            $resultUrls = is_array($decoded) ? $decoded : [$taskData['response']['resultUrls']];
                        } else {
                            $resultUrls = $taskData['response']['resultUrls'];
                        }
                    }

                    // Fallback: check resultJson (old format compatibility)
                    if (empty($resultUrls) && !empty($taskData['resultJson'])) {
                        $result = json_decode($taskData['resultJson'], true);
                        $resultUrls = $result['resultUrls'] ?? [];
                    }

                    if (!empty($resultUrls)) {
                        Log::info('KieAI Veo 3.1 Video URLs found', ['urls' => $resultUrls]);
                    }

                    // Map state: Veo API may use numeric codes or string states
                    $state = $taskData['state'] ?? $taskData['status'] ?? 'unknown';

                    // If we successfully parsed resultUrls, it means the video is done regardless of state flag
                    if (!empty($resultUrls)) {
                        $state = 'success';
                    } else {
                        // Numeric state mapping (some API versions)
                        if (is_numeric($state)) {
                            $state = match ((int)$state) {
                                1 => 'success',
                                2, 3, 501 => 'fail',
                                0 => 'generating',
                                default => 'generating',
                            };
                        } else if ($state === 'unknown') {
                            // Default to generating if state is missing
                            $state = 'generating';
                        }
                    }

                    return [
                        'success' => true,
                        'state' => $state,
                        'video_urls' => $resultUrls,
                        'fail_msg' => $taskData['failMsg'] ?? $taskData['msg'] ?? null,
                        'cost_time' => $taskData['costTime'] ?? 0,
                    ];
                }

                return [
                    'success' => false,
                    'error' => $data['msg'] ?? $data['message'] ?? 'Unknown error',
                ];
            }

            return [
                'success' => false,
                'error' => 'HTTP Error: ' . $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('KieAI Veo 3.1 queryTaskStatus error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Download and save generated video to local storage
     */
    public function downloadAndSaveVideo(string $videoUrl, int $userId): ?string
    {
        try {
            $response = Http::timeout(120)->get($videoUrl);

            if ($response->successful()) {
                $filename = "generated-videos/{$userId}_" . time() . ".mp4";
                \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $response->body());
                Log::info('Video downloaded and saved locally', ['path' => $filename, 'size' => strlen($response->body())]);
                return $filename;
            }

            Log::error('Video download failed', ['url' => $videoUrl, 'status' => $response->status()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Video download exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create an image editing task using Google Nano Banana Edit
     */
    public function createEditPhotoTask(string $prompt, array $imageUrls, string $aspectRatio = '9:16'): array
    {
        if (empty($this->apiKey)) {
            return ['success' => false, 'error' => 'Kie AI API Key is not configured.'];
        }

        try {
            $payload = [
                'model' => 'google/nano-banana-edit',
                'input' => [
                    'prompt' => $prompt,
                    'image_urls' => $imageUrls,
                    'output_format' => 'png',
                    'image_size' => $aspectRatio,
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post('https://api.kie.ai/api/v1/jobs/createTask', $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['code']) && $data['code'] === 200) {
                    return [
                        'success' => true,
                        'task_id' => $data['data']['taskId'],
                    ];
                }
                return ['success' => false, 'error' => $data['msg'] ?? 'Unknown API error'];
            }
            return ['success' => false, 'error' => 'HTTP Error: ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Query task status using Jobs unified endpoint
     */
    public function queryJobStatus(string $taskId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(30)->get('https://api.kie.ai/api/v1/jobs/recordInfo', [
                'taskId' => $taskId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['code']) && $data['code'] === 200) {
                    $taskData = $data['data'] ?? [];
                    
                    $resultUrls = [];
                    // Check directly for resultUrls first
                    if (!empty($taskData['resultUrls'])) {
                        if (is_string($taskData['resultUrls'])) {
                            $decoded = json_decode($taskData['resultUrls'], true);
                            $resultUrls = is_array($decoded) ? $decoded : [$taskData['resultUrls']];
                        } else {
                            $resultUrls = $taskData['resultUrls'];
                        }
                    } elseif (!empty($taskData['response']['resultUrls'])) {
                        if (is_string($taskData['response']['resultUrls'])) {
                            $decoded = json_decode($taskData['response']['resultUrls'], true);
                            $resultUrls = is_array($decoded) ? $decoded : [$taskData['response']['resultUrls']];
                        } else {
                            $resultUrls = $taskData['response']['resultUrls'];
                        }
                    } elseif (!empty($taskData['resultJson'])) {
                        // Check resultJson which is common for Google Nano
                        if (is_string($taskData['resultJson'])) {
                            $decoded = json_decode($taskData['resultJson'], true);
                            if (isset($decoded['resultUrls'])) {
                                $resultUrls = is_array($decoded['resultUrls']) ? $decoded['resultUrls'] : [$decoded['resultUrls']];
                            }
                        }
                    }

                    $state = $taskData['state'] ?? $taskData['status'] ?? 'unknown';
                    if (!empty($resultUrls)) {
                        $state = 'success';
                    } else if (is_numeric($state)) {
                        $state = match ((int)$state) {
                            1, 4 => 'success',
                            2, 3, 501, 5 => 'fail',
                            0 => 'generating',
                            default => 'generating',
                        };
                    }

                    return [
                        'success' => true,
                        'state' => $state,
                        'image_urls' => $resultUrls,
                        'fail_msg' => $taskData['failMsg'] ?? $taskData['msg'] ?? null,
                    ];
                }
                return ['success' => false, 'error' => $data['msg'] ?? 'Unknown error'];
            }
            return ['success' => false, 'error' => 'HTTP Error: ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
