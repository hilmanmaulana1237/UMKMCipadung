<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AIGeneratedContent;
use App\Models\Product;
use App\Services\AIService;
use App\Services\AIPromptService;
use App\Services\KieAIService;
use App\Services\PosterAIService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AIContentController extends Controller
{
    protected $aiService;
    protected $promptService;
    protected $kieAIService;
    protected $posterService;

    // Maximum videos and posters per UMKM
    private const MAX_VIDEOS_PER_UMKM = 2;
    private const MAX_POSTERS_PER_UMKM = 5;

    public function __construct(
        AIService $aiService,
        AIPromptService $promptService,
        KieAIService $kieAIService,
        PosterAIService $posterService
    ) {
        $this->aiService = $aiService;
        $this->promptService = $promptService;
        $this->kieAIService = $kieAIService;
        $this->posterService = $posterService;
    }

    public function index()
    {
        $user = Auth::user();

        // Cleanup stuck jobs > 15 mins
        AIGeneratedContent::where('user_id', $user->id)
            ->whereIn('status', ['generating', 'queuing', 'waiting'])
            ->where('updated_at', '<', now()->subMinutes(15))
            ->update([
                'status' => 'failed',
                'generated_result' => json_encode(['error' => 'Timeout (System Cleanup)'])
            ]);

        $store = $user->umkmStore;
        
        // Count generated videos for quota
        $videoCount = AIGeneratedContent::where('user_id', $user->id)
            ->where('type', 'video_generation')
            ->whereIn('status', ['completed', 'generating', 'queuing'])
            ->count();

        // Count generated posters for quota (exclude failed)
        $posterCount = AIGeneratedContent::where('user_id', $user->id)
            ->where('type', 'poster')
            ->whereIn('status', ['completed', 'generating', 'queuing', 'waiting'])
            ->count();

        // Get all AI generated contents
        $contents = AIGeneratedContent::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Landing Page Data
        $landingPage = null;
        $products = [];
        $templates = [];
        
        if ($store) {
            $landingPage = \App\Models\UmkmLandingPage::where('umkm_store_id', $store->id)->first();
            $products = Product::where('umkm_store_id', $store->id)
                ->where('is_active', true)
                ->select('id', 'name', 'price', 'image_path', 'description')
                ->orderBy('created_at', 'desc')
                ->get();
            $templates = \App\Models\UmkmLandingPage::getTemplates();
        }

        return Inertia::render('umkm/ai-content/index', [
            'contents' => $contents,
            'store' => $store ? $store->only(['id', 'name', 'address_pickup', 'contact_number', 'address', 'category', 'description']) : null,
            'videoQuota' => [
                'used' => $videoCount,
                'max' => self::MAX_VIDEOS_PER_UMKM,
                'remaining' => max(0, self::MAX_VIDEOS_PER_UMKM - $videoCount),
            ],
            'posterQuota' => [
                'used' => $posterCount,
                'max' => self::MAX_POSTERS_PER_UMKM,
                'remaining' => max(0, self::MAX_POSTERS_PER_UMKM - $posterCount),
            ],
            'landingPage' => $landingPage,
            'landingProducts' => $products,
            'landingTemplates' => $templates,
        ]);
    }

    /**
     * Generate video using Kie AI API
     */
    public function generateVideo(Request $request)
    {
        try {
            $validated = $request->validate([
                'mode' => 'required|in:store_photo,product_photo',
                'store_name' => 'required|string|max:255',
                'category' => 'required|string|max:100',
                'description' => 'required|string|max:1000',
                'location' => 'nullable|string|max:255',
                'contact' => 'nullable|string|max:50',
                'photo' => 'required|image|max:10240',
                'duration' => 'nullable|in:10,15',
            ]);
    
            $user = Auth::user();
    
            // Check quota
            $videoCount = AIGeneratedContent::where('user_id', $user->id)
                ->where('type', 'video_generation')
                ->whereIn('status', ['completed', 'generating', 'queuing'])
                ->count();
    
            if ($videoCount >= self::MAX_VIDEOS_PER_UMKM) {
                return response()->json([
                    'success' => false,
                    'error' => 'Kuota video habis. Maksimal ' . self::MAX_VIDEOS_PER_UMKM . ' video per UMKM.',
                ], 403);
            }
    
            // 1. Upload photo and get public URL
            $photoPath = $request->file('photo')->store('ai-video-refs', 'public');
            $photoUrl = url('storage/' . $photoPath);
    
            // HANDLE LOCALHOST/DEV ENVIRONMENT
            // Kie AI cannot access localhost URLs. Use provided placeholder for testing.
            if (str_contains($photoUrl, 'localhost') || str_contains($photoUrl, '127.0.0.1') || str_contains($photoUrl, '.test')) {
                \Illuminate\Support\Facades\Log::warning('Localhost detected. Using placeholder image.', ['original' => $photoUrl]);
                $photoUrl = 'https://github.com/hilman1237050020/AplikasiPenjadwalan-UAS-PBO/blob/main/Dimsum1260-700.jpeg?raw=true';
            }
    
            // 2. Construct base prompt
            $rawPrompt = $this->promptService->constructVideoPrompt(
                $validated['store_name'],
                $validated['category'],
                $validated['description'],
                $validated['location'] ?? 'Indonesia',
                $validated['contact'] ?? '-',
                $validated['mode']
            );
    
            // 3. Enhance prompt with AI
            $enhancedPrompt = $this->promptService->enhancePromptWithAI($rawPrompt);
    
            // 4. Create video task in Kie AI
            $duration = $validated['duration'] ?? '15';
            
            \Illuminate\Support\Facades\Log::info('Starting Kie AI Video Generation', [
                'user_id' => $user->id,
                'photo_url' => $photoUrl,
                'prompt_length' => strlen($enhancedPrompt),
            ]);
    
            $result = $this->kieAIService->createVideoTask($enhancedPrompt, $photoUrl, 'landscape', $duration);
    
            if (!$result['success']) {
                \Illuminate\Support\Facades\Log::error('Kie AI Generation Failed', [
                    'error' => $result['error'] ?? 'Unknown',
                    'photo_url' => $photoUrl
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'Gagal memulai generate video: ' . ($result['error'] ?? 'Unknown error'),
                ], 500);
            }
    
            // 5. Save to database
            $content = AIGeneratedContent::create([
                'user_id' => $user->id,
                'type' => 'video_generation',
                'generated_result' => json_encode([
                    'task_id' => $result['task_id'],
                    'mode' => $validated['mode'],
                    'store_name' => $validated['store_name'],
                    'photo_path' => $photoPath,
                    'prompt' => $enhancedPrompt,
                ]),
                'status' => 'queuing',
            ]);
    
            return response()->json([
                'success' => true,
                'task_id' => $result['task_id'],
                'content_id' => $content->id,
                'message' => 'Video sedang diproses. Tunggu beberapa menit...',
            ]);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Video Generation Critical Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check video generation status
     */
    public function checkVideoStatus(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|string',
            'content_id' => 'required|string', // UUID, not integer
        ]);

        \Illuminate\Support\Facades\Log::info('Checking video status', ['task_id' => $validated['task_id'], 'content_id' => $validated['content_id']]);

        $result = $this->kieAIService->queryTaskStatus($validated['task_id']);

        if (!$result['success']) {
            \Illuminate\Support\Facades\Log::error('Status check failed', ['error' => $result['error'] ?? 'Unknown']);
            return response()->json([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to check status',
            ], 500);
        }

        \Illuminate\Support\Facades\Log::info('Status check result', ['state' => $result['state'], 'video_urls' => $result['video_urls'] ?? []]);

        // Update database status
        $content = AIGeneratedContent::find($validated['content_id']);
        if ($content && $content->user_id == Auth::id()) { // Use == for type coercion
            $existingData = json_decode($content->generated_result, true) ?? [];
            
            if ($result['state'] === 'success' && !empty($result['video_urls'])) {
                $existingData['video_urls'] = $result['video_urls'];
                $content->update([
                    'status' => 'completed',
                    'generated_result' => json_encode($existingData),
                ]);
                \Illuminate\Support\Facades\Log::info('Video completed, saved to DB', ['video_urls' => $result['video_urls']]);
            } elseif ($result['state'] === 'fail') {
                $existingData['error'] = $result['fail_msg'];
                $content->update([
                    'status' => 'failed',
                    'generated_result' => json_encode($existingData),
                ]);
            } else {
                $content->update(['status' => $result['state']]);
            }
        }

        return response()->json([
            'success' => true,
            'state' => $result['state'],
            'video_urls' => $result['video_urls'] ?? [],
            'fail_msg' => $result['fail_msg'] ?? null,
        ]);
    }

    /**
     * Generate AI Video Prompt (manual copy mode)
     */
    public function generateVideoPrompt(Request $request)
    {
        $validated = $request->validate([
            'mode' => 'required|in:store_photo,product_photo',
            'store_name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'location' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:50',
            'photo' => 'required|image|max:10240',
        ]);

        $photoPath = $request->file('photo')->store('ai-video-refs', 'public');

        $prompt = $this->promptService->constructVideoPrompt(
            $validated['store_name'],
            $validated['category'],
            $validated['description'],
            $validated['location'] ?? 'Indonesia',
            $validated['contact'] ?? '-',
            $validated['mode']
        );

        AIGeneratedContent::create([
            'user_id' => Auth::id(),
            'type' => 'video_prompt',
            'generated_result' => json_encode([
                'mode' => $validated['mode'],
                'prompt' => $prompt,
                'photo_path' => $photoPath,
                'store_name' => $validated['store_name'],
            ]),
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'prompt' => $prompt,
            'photo_url' => asset('storage/' . $photoPath),
            'mode' => $validated['mode'],
            'store_name' => $validated['store_name'],
        ]);
    }

    public function generateVideoScript(Request $request)
    {
        $request->validate([
            'product_name' => 'required|string',
            'product_usp' => 'required|string',
        ]);

        $storeName = Auth::user()->name;
        $productName = $request->product_name;
        $usp = $request->product_usp;

        $script = $this->aiService->generateVideoScript($storeName, $productName, $usp);

        AIGeneratedContent::create([
            'user_id' => Auth::id(),
            'type' => 'video_script',
            'generated_result' => json_encode($script),
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'data' => $script,
        ]);
    }

    public function generateVideoDescription(Request $request)
    {
        try {
            $request->validate([
                'store_name' => 'required|string',
                'category' => 'required|string',
                'product_name' => 'required|string',
            ]);
    
            $description = $this->aiService->generateVisualDescription(
                $request->store_name,
                $request->category,
                $request->product_name
            );
    
            return response()->json([
                'success' => true,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Generate Video Description Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available poster templates
     */
    public function getPosterTemplates()
    {
        $templates = \App\Models\PosterTemplate::active()->get();
        
        $data = [
            'makanan' => $templates->where('type', 'makanan')->map(function($t) {
                return [
                    'id' => $t->id,
                    'path' => $t->thumbnail_url, // Used for display
                    'name' => $t->name,
                    'url' => $t->thumbnail_url, // Used for generation
                ];
            })->values(),
            'jasa' => $templates->where('type', 'jasa')->map(function($t) {
                return [
                    'id' => $t->id,
                    'path' => $t->thumbnail_url,
                    'name' => $t->name,
                    'url' => $t->thumbnail_url,
                ];
            })->values(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Generate poster from template using AI
     */
    public function generatePosterFromTemplate(Request $request)
    {
        try {
            $request->validate([
                'template_path' => 'required|string',
                'poster_type' => 'required|in:makanan,jasa',
                'store_name' => 'required|string|max:100',
                'slogan' => 'nullable|string|max:150',
                'phone' => 'required|string|max:20',
                'address' => 'required|string|max:200',
                // Food poster specific
                'product_name' => 'required_if:poster_type,makanan|nullable|string|max:100',
                'price' => 'required_if:poster_type,makanan|nullable|string|max:50',
                'product_image' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120', // Relaxed validation, increased to 5MB
                // Service poster specific
                'service_name' => 'required_if:poster_type,jasa|nullable|string|max:100',
                'services' => 'required_if:poster_type,jasa|nullable|array|max:6',
                'services.*' => 'string|max:50',
            ]);

            $user = Auth::user();

            // Check poster quota
            $posterCount = AIGeneratedContent::where('user_id', $user->id)
                ->where('type', 'poster')
                ->whereIn('status', ['completed', 'generating', 'queuing', 'waiting'])
                ->count();

            if ($posterCount >= self::MAX_POSTERS_PER_UMKM) {
                return response()->json([
                    'success' => false,
                    'error' => 'Kuota pembuatan poster habis (Maksimal ' . self::MAX_POSTERS_PER_UMKM . ' poster). Silakan hapus poster lama atau hubungi admin.',
                ], 403);
            }

            // Handle product image upload if provided
            $productImageUrl = null;
            $physicalPath = null;
            if ($request->hasFile('product_image')) {
                $path = $request->file('product_image')->store('poster-uploads', 'public');
                $productImageUrl = asset('storage/' . $path);
                $physicalPath = storage_path('app/public/' . $path);
            }

            // Build replacements array
            $replacements = [
                'store_name' => $request->store_name,
                'slogan' => $request->slogan ?? '',
                'phone' => $request->phone,
                'address' => $request->address,
            ];

            if ($request->poster_type === 'makanan') {
                $replacements['product_name'] = $request->product_name;
                $replacements['price'] = $request->price;
            } else {
                $replacements['service_name'] = $request->service_name;
                $replacements['services'] = $request->services ?? [];
            }

            // Generate poster using AI
            $result = $this->posterService->generatePoster(
                $request->template_path,
                $replacements,
                $productImageUrl,
                $request->poster_type,
                $physicalPath
            );

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $result['error'],
                ], 500);
            }

            // Save the pending record with task_id for resume capability
            $content = AIGeneratedContent::create([
                'user_id' => $user->id,
                'type' => 'poster',
                'prompt' => json_encode($replacements),
                'status' => 'generating',
                // 'external_task_id' => $result['task_id'], // Column removed in migration
                'generated_result' => json_encode(['task_id' => $result['task_id']]),
            ]);

            return response()->json([
                'success' => true,
                'task_id' => $result['task_id'],
                'content_id' => $content->id,
                'message' => 'Poster sedang digenerate, silakan tunggu...',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check poster generation status
     */
    public function checkPosterStatus(Request $request)
    {
        try {
            $request->validate([
                'task_id' => 'required|string',
                'content_id' => 'required|string',
            ]);

            $content = AIGeneratedContent::where('id', $request->content_id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$content) {
                return response()->json([
                    'success' => false,
                    'error' => 'Content not found.',
                ], 404);
            }

            // Already completed?
            if ($content->status === 'completed' && $content->generated_result) {
                return response()->json([
                    'success' => true,
                    'status' => 'completed',
                    'poster_url' => $content->generated_result,
                ]);
            }

            // Query API status
            $result = $this->posterService->queryTaskStatus($request->task_id);

            if (!$result['success']) {
                // If API check fails, mark as failed to prevent infinite loading
                $content->update([
                    'status' => 'failed',
                    'generated_result' => json_encode(['error' => $result['error'] ?? 'Gagal mengecek status'])
                ]);
                
                return response()->json([
                    'success' => true,
                    'status' => 'failed',
                    'error' => $result['error'],
                ]);
            }

            // Map states - Kie AI uses 'success' and 'fail'
            $state = $result['state'] ?? 'unknown';

            if (($state === 'success' || $state === 'completed') && !empty($result['image_urls'])) {
                $imageUrl = $result['image_urls'][0];

                // Download and save poster
                $savedPath = $this->posterService->downloadAndSavePoster($imageUrl, Auth::id());

                if ($savedPath) {
                    $content->update([
                        'status' => 'completed',
                        'generated_result' => asset('storage/' . $savedPath),
                    ]);

                    return response()->json([
                        'success' => true,
                        'status' => 'completed',
                        'poster_url' => asset('storage/' . $savedPath),
                    ]);
                } else {
                     // Download failed
                    $content->update([
                        'status' => 'failed',
                        'generated_result' => json_encode(['error' => 'Gagal mendownload hasil poster'])
                    ]);
                    return response()->json([
                        'success' => true,
                        'status' => 'failed',
                        'error' => 'Gagal mendownload hasil poster',
                    ]);
                }
            } elseif ($state === 'success' || $state === 'completed') {
                // Success but no images found
                Log::error('PosterAI Status Success but No Images', ['result' => $result]);
                $content->update([
                    'status' => 'failed',
                    'generated_result' => json_encode(['error' => 'Output image not found in response'])
                ]);
                return response()->json([
                    'success' => true,
                    'status' => 'failed',
                    'error' => 'Output image not found in response',
                ]);
            } elseif ($state === 'fail' || $state === 'failed') {
                $content->update([
                    'status' => 'failed',
                    'generated_result' => json_encode(['error' => $result['fail_msg'] ?? 'Generation failed'])
                ]);

                return response()->json([
                    'success' => true,
                    'status' => 'failed',
                    'error' => $result['fail_msg'] ?? 'Generation failed',
                ]);
            }

            // Still processing
            return response()->json([
                'success' => true,
                'status' => 'generating',
                'message' => 'Poster masih dalam proses...',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Legacy generatePoster method (for compatibility)
     */
    public function generatePoster(Request $request)
    {
        $request->validate([
            'product_name' => 'required|string',
            'promo_text' => 'required|string',
        ]);

        $config = $this->aiService->generatePosterConfig($request->product_name, $request->promo_text);

        AIGeneratedContent::create([
            'user_id' => Auth::id(),
            'type' => 'poster',
            'generated_result' => json_encode($config),
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }

    /**
     * Generate copywriting for poster sharing
     */
    public function generatePosterCopywriting(Request $request)
    {
        try {
            $validated = $request->validate([
                'content_id' => 'required|string', // Poster ID to save copywriting to
                'store_name' => 'required|string|max:100',
                'product_name' => 'nullable|string|max:100',
                'service_name' => 'nullable|string|max:100',
                'price' => 'nullable|string|max:50',
                'slogan' => 'nullable|string|max:150',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:200',
            ]);

            Log::info('Generating poster copywriting', ['content_id' => $validated['content_id']]);

            $productOrService = $validated['product_name'] ?? $validated['service_name'] ?? 'Produk Unggulan';
            $price = $validated['price'] ?? 'Harga Terjangkau';

            $copywriting = $this->aiService->generatePosterCopywriting(
                $validated['store_name'],
                $productOrService,
                $price,
                $validated['slogan'] ?? '',
                $validated['phone'] ?? 'Hubungi kami',
                $validated['address'] ?? ''
            );

            Log::info('Copywriting generated', ['copywriting' => substr($copywriting, 0, 100)]);

            // Save copywriting to the poster's generated_result field
            $content = AIGeneratedContent::find($validated['content_id']);
            if ($content) {
                $currentResult = $content->generated_result;
                // If it's a URL (poster completed), save both URL and copywriting as JSON
                if ($currentResult && !str_starts_with($currentResult, '{')) {
                    $content->generated_result = json_encode([
                        'poster_url' => $currentResult,
                        'copywriting' => $copywriting,
                    ]);
                } else {
                    // Parse existing JSON and add copywriting
                    $data = json_decode($currentResult, true) ?? [];
                    $data['copywriting'] = $copywriting;
                    $content->generated_result = json_encode($data);
                }
                $content->save();
                Log::info('Copywriting saved to database', ['content_id' => $content->id]);
            }

            return response()->json([
                'success' => true,
                'copywriting' => $copywriting,
            ]);
        } catch (\Exception $e) {
            Log::error('Copywriting generation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
