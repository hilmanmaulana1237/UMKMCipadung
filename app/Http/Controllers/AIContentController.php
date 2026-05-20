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
    private const MAX_VIDEOS_PER_UMKM = 1;
    private const MAX_POSTERS_PER_UMKM = 2;

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
            ->get()
            ->map(function ($content) {
                if (empty($content->generated_result)) {
                    return $content;
                }

                if ($content->type === 'poster') {
                    $content->generated_result = $this->normalizePosterResultUrl($content->generated_result);
                    return $content;
                }

                if ($content->type !== 'video_generation') {
                    return $content;
                }

                $decoded = json_decode($content->generated_result, true);
                if (!is_array($decoded) || empty($decoded['video_urls']) || !is_array($decoded['video_urls'])) {
                    return $content;
                }

                $availableUrls = [];
                $expiredUrls = [];

                foreach ($decoded['video_urls'] as $url) {
                    if (!is_string($url) || trim($url) === '') {
                        continue;
                    }

                    $localPath = $this->extractLocalGeneratedMediaPath($url, 'generated-videos/');
                    $isMissing = $localPath !== null && !Storage::disk('public')->exists($localPath);

                    if ($localPath !== null) {
                        $url = route('media.generated-file', [
                            'token' => $this->encodeMediaPathToken($localPath),
                        ]);
                    }

                    if ($isMissing) {
                        $expiredUrls[] = $url;
                    } else {
                        $availableUrls[] = $url;
                    }
                }

                $decoded['video_urls'] = $availableUrls;
                $decoded['expired_video_urls'] = $expiredUrls;

                if (!empty($expiredUrls)) {
                    $decoded['video_retention_notice'] = 'Video ini sudah melewati masa simpan penyedia AI, sehingga file media tidak lagi tersedia di server.';
                }

                $content->generated_result = json_encode($decoded);
                return $content;
            });

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
     * Generate UGC Photo using Kie AI (Google Nano Banana Edit)
     * This merges the user's avatar with the product photo.
     */
    public function generateUGCPhoto(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_name' => 'required|string|max:255',
                'photo' => 'required|image|max:10240',
            ]);

            $user = Auth::user();

            // Check quota first
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

            // Require user to have an avatar for UGC
            if (!$user->avatar_path) {
                return response()->json([
                    'success' => false,
                    'error' => 'Silakan atur Foto Profil Toko terlebih dahulu untuk digunakan sebagai model.',
                ], 400);
            }

            // 1. Upload product photo and get public URL
            $productPath = $request->file('photo')->store('ai-video-refs', 'public');
            $productUrl = url('storage/' . $productPath);
            $avatarUrl = url('storage/' . $user->avatar_path);

            // Handle localhost testing
            if (str_contains($productUrl, 'localhost') || str_contains($productUrl, '127.0.0.1') || str_contains($productUrl, '.test')) {
                \Illuminate\Support\Facades\Log::warning('Localhost detected. Using placeholder images for UGC.');
                $productUrl = 'https://tempfileb.aiquickdraw.com/kieai/market/1777125204910_whVX4yF6.jpg';
                $avatarUrl = 'https://tempfileb.aiquickdraw.com/kieai/market/1777125324151_9y4lmMcR.png';
            }

            // 2. The prompt to merge the two
            $prompt = "Gabungkan dua gambar berikut menjadi satu foto UGC yang natural dan realistis:\n\n" .
                      "Gambar 1: subjek (orang biasa / pelaku UMKM)\n" .
                      "Gambar 2: produk yang dijual\n\n" .
                      "Hasil akhir harus terlihat seperti foto asli, di mana subjek sedang memegang dan merekomendasikan produk secara langsung.\n\n" .
                      "Detail Utama:\n" .
                      "Ekspresi subjek ramah, hangat, dan tersenyum natural\n" .
                      "Subjek memegang produk dengan satu tangan secara realistis (tidak kaku atau aneh)\n" .
                      "Produk terlihat jelas, fokus, dan menyatu dengan pencahayaan serta perspektif\n" .
                      "Proporsi produk sesuai ukuran aslinya\n\n" .
                      "Lingkungan & Pencahayaan:\n" .
                      "Background sederhana (rumah, dapur, atau warung kecil) dengan nuansa UMKM Indonesia\n" .
                      "Pencahayaan natural seperti siang hari dari jendela\n" .
                      "Bukan lighting studio (sedikit imperfect namun tetap jelas)\n\n" .
                      "Style Visual:\n" .
                      "UGC autentik seperti foto jualan rumahan, testimoni, atau konten TikTok/WhatsApp\n" .
                      "Tidak terlalu polished, tetap terlihat natural dan relatable\n" .
                      "Resolusi tinggi, tajam, dan bersih\n\n" .
                      "Tambahan (Opsional):\n" .
                      "Boleh menambahkan elemen ringan seperti meja, etalase kecil, atau aktivitas santai (duduk atau berdiri)\n" .
                      "Jangan mengubah wajah subjek secara signifikan\n" .
                      "Pastikan hasil akhir menyatu dengan baik dan tidak terlihat seperti editan kasar";

            // 3. Create nano edit task
            $result = $this->kieAIService->createEditPhotoTask($prompt, [$avatarUrl, $productUrl], '9:16');

            if (!$result['success']) {
                \Illuminate\Support\Facades\Log::error('Kie AI UGC Photo Failed', ['error' => $result['error'] ?? 'Unknown']);
                return response()->json([
                    'success' => false,
                    'error' => 'Gagal memulai pembuatan foto UGC: ' . ($result['error'] ?? 'Unknown error'),
                ], 500);
            }

            // 4. Save to database as video_generation step 1
            $content = AIGeneratedContent::create([
                'user_id' => $user->id,
                'type' => 'ugc_photo',
                'generated_result' => json_encode([
                    'task_id' => $result['task_id'],
                    'product_name' => $validated['product_name'],
                    'product_path' => $productPath,
                    'avatar_path' => $user->avatar_path,
                ]),
                'status' => 'generating',
            ]);

            return response()->json([
                'success' => true,
                'task_id' => $result['task_id'],
                'content_id' => $content->id,
                'message' => 'Sedang menyatukan foto Anda dengan produk...',
            ]);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UGC Photo Generation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check UGC Photo Status
     */
    public function checkUGCPhotoStatus(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|string',
            'content_id' => 'required|string',
        ]);

        $result = $this->kieAIService->queryJobStatus($validated['task_id']);

        if (!$result['success']) {
            return response()->json(['success' => false, 'error' => $result['error'] ?? 'Failed to check status'], 500);
        }

        $content = AIGeneratedContent::find($validated['content_id']);
        if ($content && $content->user_id == Auth::id()) {
            $existingData = json_decode($content->generated_result, true) ?? [];

            if ($result['state'] === 'success' && !empty($result['image_urls'])) {
                // Download image and save locally
                $imageUrl = $result['image_urls'][0];
                $localPath = null;
                
                try {
                    $imgResponse = \Illuminate\Support\Facades\Http::timeout(60)->get($imageUrl);
                    if ($imgResponse->successful()) {
                        $filename = "generated-ugc/{$content->user_id}_" . time() . ".png";
                        \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $imgResponse->body());
                        $localPath = $filename;
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to download UGC Photo: " . $e->getMessage());
                }

                $existingData['ugc_photo_url'] = $localPath ? asset('storage/' . $localPath) : $imageUrl;
                $existingData['ugc_photo_path'] = $localPath;
                
                $content->update([
                    'status' => 'completed',
                    'generated_result' => json_encode($existingData),
                ]);
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
            'image_urls' => $result['image_urls'] ?? [],
            'fail_msg' => $result['fail_msg'] ?? null,
            'local_url' => $existingData['ugc_photo_url'] ?? null,
        ]);
    }

    /**
     * Generate video using Kie AI API
     */
    public function generateVideo(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_name' => 'required|string|max:255',
                'photo' => 'nullable|image|max:10240',
                'ugc_photo_url' => 'nullable|string',
            ]);

            if (empty($validated['photo']) && empty($validated['ugc_photo_url'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Foto produk atau foto UGC wajib disertakan.',
                ], 400);
            }

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

            // 1. Get public URL of photo (either uploaded or from previous UGC step)
            $photoPath = null;
            $photoUrl = null;

            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('ai-video-refs', 'public');
                $photoUrl = url('storage/' . $photoPath);
                
                // Handle localhost testing
                if (str_contains($photoUrl, 'localhost') || str_contains($photoUrl, '127.0.0.1') || str_contains($photoUrl, '.test')) {
                    \Illuminate\Support\Facades\Log::warning('Localhost detected. Using placeholder image.', ['original' => $photoUrl]);
                    $photoUrl = 'https://github.com/hilman1237050020/AplikasiPenjadwalan-UAS-PBO/blob/main/Dimsum1260-700.jpeg?raw=true';
                }
            } else {
                $photoUrl = $validated['ugc_photo_url'];
                // For localhost testing, we might need a fallback if the UGC url is localhost
                if (str_contains($photoUrl, 'localhost') || str_contains($photoUrl, '127.0.0.1') || str_contains($photoUrl, '.test')) {
                    $photoUrl = 'https://tempfileb.aiquickdraw.com/kieai/market/1777125204910_whVX4yF6.jpg'; // just a fallback
                }
            }

            // 2. Construct base prompt (DO NOT ENHANCE WITH AI to avoid prompt hallucination and changing the actor)
            $enhancedPrompt = $this->promptService->constructVideoPrompt(
                $validated['product_name']
            );

            // 4. Create video task in Kie AI
            $duration = '10'; // Fixed 10s or 8s based on new prompt max 8s

            \Illuminate\Support\Facades\Log::info('Starting Kie AI Video Generation', [
                'user_id' => $user->id,
                'photo_url' => $photoUrl,
                'prompt_length' => strlen($enhancedPrompt),
            ]);

            $result = $this->kieAIService->createVideoTask($enhancedPrompt, $photoUrl, '9:16', $duration);

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
                    'product_name' => $validated['product_name'],
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
                $localVideoUrls = [];
                foreach ($result['video_urls'] as $videoUrl) {
                    $savedPath = $this->kieAIService->downloadAndSaveVideo($videoUrl, Auth::id());
                    if ($savedPath) {
                        $localVideoUrls[] = route('media.generated-file', [
                            'token' => $this->encodeMediaPathToken($savedPath),
                        ]);
                    } else {
                        // Fallback to external URL if download fails
                        $localVideoUrls[] = $videoUrl;
                    }
                }

                $existingData['video_urls'] = $localVideoUrls;
                $content->update([
                    'status' => 'completed',
                    'generated_result' => json_encode($existingData),
                ]);
                \Illuminate\Support\Facades\Log::info('Video completed, saved locally', ['video_urls' => $localVideoUrls]);
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

    public function publicGeneratedFile(string $token)
    {
        $relativePath = $this->decodeMediaPathToken($token);

        if ($relativePath === null || !$this->isAllowedGeneratedMediaPath($relativePath)) {
            return response()->view('media.video-unavailable', [
                'title' => 'Media Tidak Ditemukan',
                'message' => 'Maaf kak, file yang Anda cari tidak ditemukan. Kemungkinan tautan sudah tidak aktif atau file sudah dipindahkan.',
            ], 404);
        }

        if (!Storage::disk('public')->exists($relativePath)) {
            $kind = str_starts_with($relativePath, 'generated-posters/') ? 'poster' : 'video';
            return response()->view('media.video-unavailable', [
                'title' => $kind === 'poster' ? 'Poster Sudah Tidak Tersedia' : 'Video Sudah Tidak Tersedia',
                'message' => $kind === 'poster'
                    ? 'Maaf kak, poster yang Anda inginkan sudah tidak tersedia di server karena melewati masa simpan media dari penyedia AI. Yuk, buat poster baru dengan prompt terbaru agar hasilnya tetap up to date.'
                    : 'Maaf kak, video yang Anda inginkan sudah tidak tersedia di server karena melewati masa simpan media dari penyedia AI. Yuk, generate video baru dengan prompt terbaru agar kontennya tetap fresh.',
            ], 200);
        }

        return response()->file(Storage::disk('public')->path($relativePath), [
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function publicGeneratedVideoByName(string $filename)
    {
        $relativePath = 'generated-videos/' . ltrim($filename, '/');

        if (Storage::disk('public')->exists($relativePath)) {
            return response()->file(Storage::disk('public')->path($relativePath), [
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        return response()->view('media.video-unavailable', [
            'title' => 'Video Sudah Tidak Tersedia',
            'message' => 'Maaf kak, video yang Anda inginkan sudah tidak tersedia di server karena melewati masa simpan media dari penyedia AI. Yuk, generate video baru dengan prompt terbaru agar kontennya tetap fresh.',
        ], 200);
    }

    public function publicGeneratedPosterByName(string $filename)
    {
        $relativePath = 'generated-posters/' . ltrim($filename, '/');

        if (Storage::disk('public')->exists($relativePath)) {
            return response()->file(Storage::disk('public')->path($relativePath), [
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        return response()->view('media.video-unavailable', [
            'title' => 'Poster Sudah Tidak Tersedia',
            'message' => 'Maaf kak, poster yang Anda inginkan sudah tidak tersedia di server karena melewati masa simpan media dari penyedia AI. Yuk, buat poster baru dengan prompt terbaru agar hasilnya tetap up to date.',
        ], 200);
    }

    private function extractLocalGeneratedMediaPath(string $url, string $prefix): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        if (str_contains($path, '/storage/' . $prefix)) {
            $relativePath = ltrim(str_replace('/storage/', '', $path), '/');
            return $relativePath !== '' ? $relativePath : null;
        }

        if (str_starts_with($path, $prefix)) {
            return $path;
        }

        return null;
    }

    private function normalizePosterResultUrl(string $rawResult): string
    {
        if ($rawResult === '') {
            return $rawResult;
        }

        if (str_starts_with($rawResult, '{')) {
            $decoded = json_decode($rawResult, true);
            if (!is_array($decoded) || empty($decoded['poster_url']) || !is_string($decoded['poster_url'])) {
                return $rawResult;
            }

            $localPath = $this->extractLocalGeneratedMediaPath($decoded['poster_url'], 'generated-posters/');
            if ($localPath === null) {
                return $rawResult;
            }

            $decoded['poster_url'] = route('media.generated-file', [
                'token' => $this->encodeMediaPathToken($localPath),
            ]);

            return json_encode($decoded);
        }

        $localPath = $this->extractLocalGeneratedMediaPath($rawResult, 'generated-posters/');
        if ($localPath === null) {
            return $rawResult;
        }

        return route('media.generated-file', [
            'token' => $this->encodeMediaPathToken($localPath),
        ]);
    }

    private function isAllowedGeneratedMediaPath(string $relativePath): bool
    {
        return str_starts_with($relativePath, 'generated-videos/')
            || str_starts_with($relativePath, 'generated-posters/');
    }

    private function encodeMediaPathToken(string $relativePath): string
    {
        $base64 = base64_encode($relativePath);
        return rtrim(strtr($base64, '+/', '-_'), '=');
    }

    private function decodeMediaPathToken(string $token): ?string
    {
        $base64 = strtr($token, '-_', '+/');
        $padding = strlen($base64) % 4;
        if ($padding > 0) {
            $base64 .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode($base64, true);
        if (!is_string($decoded) || trim($decoded) === '') {
            return null;
        }

        return ltrim($decoded, '/');
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

            $productName = $request->product_name;

            // Fetch random products from store to enhance context
            $store = \App\Models\UmkmStore::where('user_id', auth()->id())->first();
            $additionalProducts = '';

            if ($store) {
                $randomProducts = \App\Models\Product::where('store_id', $store->id)
                    ->where('name', '!=', $productName) // Exclude main product
                    ->inRandomOrder()
                    ->take(3)
                    ->pluck('name')
                    ->toArray();

                if (!empty($randomProducts)) {
                    $additionalProducts = implode(', ', $randomProducts);
                }
            }

            $description = $this->aiService->generateVisualDescription(
                $request->store_name,
                $request->category,
                $productName,
                $additionalProducts
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
            'makanan' => $templates->where('type', 'makanan')->map(function ($t) {
                return [
                    'id' => $t->id,
                    'path' => $t->thumbnail_url, // Used for display
                    'name' => $t->name,
                    'url' => $t->thumbnail_url, // Used for generation
                ];
            })->values(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Generate poster from template using AI (makanan) or enhance product photo
     */
    public function generatePosterFromTemplate(Request $request)
    {
        try {
            $posterType = $request->poster_type;

            // Different validation rules per type
            if ($posterType === 'enhance') {
                $request->validate([
                    'poster_type' => 'required|in:makanan,enhance',
                    'product_image' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
                ]);
            } else {
                $request->validate([
                    'template_path' => 'required|string',
                    'poster_type' => 'required|in:makanan,enhance',
                    'store_name' => 'required|string|max:100',
                    'slogan' => 'nullable|string|max:150',
                    'phone' => 'required|string|max:20',
                    'address' => 'required|string|max:200',
                    'product_name' => 'required|string|max:100',
                    'price' => 'required|string|max:50',
                    'product_image' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120',
                ]);
            }

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

            // Build replacements array based on type
            $replacements = [];
            if ($posterType === 'makanan') {
                $replacements = [
                    'store_name' => $request->store_name,
                    'slogan' => $request->slogan ?? '',
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'product_name' => $request->product_name,
                    'price' => $request->price,
                ];
            } else {
                // enhance type - minimal replacements, just for record keeping
                $replacements = [
                    'type' => 'enhance',
                ];
            }

            // Generate poster using AI
            $result = $this->posterService->generatePoster(
                $request->template_path ?? '',
                $replacements,
                $productImageUrl,
                $posterType,
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
                'generated_result' => json_encode(['task_id' => $result['task_id']]),
            ]);

            return response()->json([
                'success' => true,
                'task_id' => $result['task_id'],
                'content_id' => $content->id,
                'message' => $posterType === 'enhance'
                    ? 'Foto produk sedang dipercantik, silakan tunggu...'
                    : 'Poster sedang digenerate, silakan tunggu...',
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
                        'generated_result' => route('media.generated-file', [
                            'token' => $this->encodeMediaPathToken($savedPath),
                        ]),
                    ]);

                    return response()->json([
                        'success' => true,
                        'status' => 'completed',
                        'poster_url' => route('media.generated-file', [
                            'token' => $this->encodeMediaPathToken($savedPath),
                        ]),
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
