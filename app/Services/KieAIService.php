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
        $this->baseUrl = $config['base_url'] ?: 'https://api.kie.ai/api/v1/jobs';

        // Safety check: Fix for issue where OpenRouter URL is incorrectly set for Video config
        if (str_contains($this->baseUrl, 'openrouter.ai')) {
            Log::warning('KieAIService: Detected OpenRouter URL in Video Config. Forcing reset to Kie AI default.');
            $this->baseUrl = 'https://api.kie.ai/api/v1/jobs';
        }

        // 'model' from config or default to sora-2
        $this->model = $config['model'] ?: 'sora-2-image-to-video';

        if (empty($this->apiKey)) {
            // We won't throw exception in constructor to avoid breaking app boot,
            // but we'll log it and requests will fail.
            Log::warning('KieAIService: API Key is missing or not configured.');
        } else {
            Log::info('KieAIService: Config loaded successfully.', [
                'has_key' => true,
                'key_preview' => substr($this->apiKey, 0, 5) . '...',
                'base_url' => $this->baseUrl
            ]);
        }
    }

    /**
     * Create a video generation task
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
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/createTask', [
                        'model' => $this->model,
                        'input' => [
                            'prompt' => $prompt,
                            'image_urls' => [$imageUrl],
                            'aspect_ratio' => $aspectRatio,
                            'n_frames' => $duration,
                            'remove_watermark' => true,
                        ],
                    ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['code'] === 200) {
                    return [
                        'success' => true,
                        'task_id' => $data['data']['taskId'],
                    ];
                }
                Log::error('KieAI API Error', ['response' => $data]);
                return [
                    'success' => false,
                    'error' => $data['message'] ?? 'Unknown error',
                ];
            }

            Log::error('KieAI HTTP Error', ['status' => $response->status(), 'body' => $response->body()]);
            return [
                'success' => false,
                'error' => 'HTTP Error: ' . $response->status() . ' at ' . $this->baseUrl . '/createTask',
            ];
        } catch (\Exception $e) {
            Log::error('KieAI createVideoTask Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Query task status
     */
    public function queryTaskStatus(string $taskId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(30)->get($this->baseUrl . '/recordInfo', [
                        'taskId' => $taskId,
                    ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('KieAI Status Response', ['task_id' => $taskId, 'response' => $data]);

                if ($data['code'] === 200) {
                    $taskData = $data['data'];

                    // Parse resultJson if exists
                    $resultUrls = [];
                    if (!empty($taskData['resultJson'])) {
                        $result = json_decode($taskData['resultJson'], true);
                        $resultUrls = $result['resultUrls'] ?? [];
                        Log::info('KieAI Video URLs found', ['urls' => $resultUrls]);
                    }

                    return [
                        'success' => true,
                        'state' => $taskData['state'],
                        'video_urls' => $resultUrls,
                        'fail_msg' => $taskData['failMsg'] ?? null,
                        'cost_time' => $taskData['costTime'] ?? 0,
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
            Log::error('KieAI queryTaskStatus error: ' . $e->getMessage());
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
}
