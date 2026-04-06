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
     * Construct UGC TikTok-style video prompt.
     * MAX 8 seconds total, MAX 6 seconds dialogue.
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

        if ($mode === 'product_photo') {
            return $this->constructProductUGCPrompt($storeName, $categoryLabel, $description, $location, $contact);
        }

        return $this->constructStoreUGCPrompt($storeName, $categoryLabel, $description, $location, $contact);
    }

    /**
     * UGC prompt for STORE PHOTO mode.
     * MAX 8 seconds video, MAX 6 seconds dialogue.
     */
    private function constructStoreUGCPrompt(
        string $storeName,
        string $categoryLabel,
        string $description,
        string $location,
        string $contact
    ): string {
        $prompt = <<<EOT
Create a realistic UGC (User Generated Content) TikTok-style review video.
Use the uploaded store photo as the EXACT visual reference for the store/location.
The store must look IDENTICAL to the uploaded photo.

CONTEXT (for AI understanding only — use this to make the content relevant):
- Store name: "$storeName"
- Category: $categoryLabel
- Description from owner: "$description"
- Location: $location

════════════════════════════════════════════════════════════════════
VIDEO STYLE: AUTHENTIC TIKTOK UGC — NOT A COMMERCIAL
TOTAL DURATION: 8 SECONDS MAXIMUM
TOTAL DIALOGUE: 6 SECONDS MAXIMUM
════════════════════════════════════════════════════════════════════

Camera: Handheld smartphone camera, front-facing selfie angle, slightly shaky,
natural lighting, authentic vibe. Like someone recording with their phone.

Character: A young Indonesian woman (20-25 years old), casual outfit (t-shirt or blouse),
natural makeup, hijab or natural hair, relatable and friendly looking.
She is NOT a model — she looks like a real TikTok content creator.

────────────────────
Scene 1 — Opening Hook + Store Showcase (Second 0-5):
The girl is standing near the store (matching the uploaded photo exactly).
She holds her phone in selfie mode, the store is visible behind her.
She looks excited and talks directly to camera with natural hand gestures.

She says (BAHASA INDONESIA, MAX 4 seconds): "Guys, nemu $categoryLabel keren nih di $location!"

Quick cut: camera flips showing the store interior/exterior (MUST match uploaded photo).
Handheld walking shot, slightly shaky, exploring the store briefly.

TikTok-style subtitle text appears: bold white text with black outline at bottom of screen.

────────────────────
Scene 2 — Recommendation + Closing (Second 5-8):
Back to selfie angle. She holds up a product or points at the store behind her.
Genuine smile, speaking directly to camera.

She says (BAHASA INDONESIA, MAX 2 seconds): "Recommended banget, cobain deh!"

Soft text overlay fades in:
📍 $storeName
$location

────────────────────
AUDIO:
- Subtle trendy background music throughout (lo-fi, aesthetic, TikTok-trending style)
- Girl's voice is natural, casual — NOT announcer voice
- Music gets slightly louder in final 2 seconds

TOTAL DURATION: 8 SECONDS MAXIMUM. DO NOT EXCEED.
TOTAL DIALOGUE: 6 SECONDS MAXIMUM.

════════════════════════════════════════════════════════════════════
CRITICAL RULES:
1. Must look like REAL TikTok UGC content, NOT a polished commercial
2. Store MUST look identical to uploaded photo — same signage, layout, colors
3. ALL dialogue in BAHASA INDONESIA
4. Handheld smartphone camera feel throughout
5. Modern TikTok-style bold subtitles on screen
6. Character must be a relatable young Indonesian woman
7. VIDEO MUST NOT EXCEED 8 SECONDS TOTAL
8. DIALOGUE MUST NOT EXCEED 6 SECONDS TOTAL
════════════════════════════════════════════════════════════════════

NEGATIVE PROMPT:
cinematic camera, tripod shot, studio lighting, static camera, professional model,
western/caucasian person, anime, cartoon, unrealistic, corporate commercial feel,
stiff poses, robotic movement, bad quality, blurry, English dialogue,
redesigned store (must match photo), fancy studio setting, long video, slow pacing
EOT;

        return $prompt;
    }

    /**
     * UGC prompt for PRODUCT PHOTO mode.
     * MAX 8 seconds video, MAX 6 seconds dialogue.
     */
    private function constructProductUGCPrompt(
        string $storeName,
        string $categoryLabel,
        string $description,
        string $location,
        string $contact
    ): string {
        $prompt = <<<EOT
Create a realistic UGC (User Generated Content) TikTok-style product review video.
Use the uploaded product photo as the EXACT product reference.
The product MUST look 100% IDENTICAL to the uploaded image — same shape, color, label, packaging, and all details.
DO NOT redesign or reinterpret the product.

CONTEXT (for AI understanding — use this info to create relevant dialogue):
- Store: "$storeName"
- Product category: $categoryLabel
- Product description: "$description"

Analyze the uploaded product image and identify the product type (e.g., skincare, food, drink, fashion, craft, etc.).
Generate dialogue that naturally describes the product's key benefit.

════════════════════════════════════════════════════════════════════
VIDEO STYLE: AUTHENTIC TIKTOK PRODUCT REVIEW — HONEST, ORGANIC, NOT AN AD
TOTAL DURATION: 8 SECONDS MAXIMUM
TOTAL DIALOGUE: 6 SECONDS MAXIMUM
════════════════════════════════════════════════════════════════════

Camera: Handheld smartphone camera, slightly shaky, natural morning/afternoon light
from a window. Authentic bedroom/living room setting. Like a real TikTok review.

Character: A young Indonesian woman (20-25 years old), wearing casual comfortable clothes
(oversized t-shirt, hoodie), natural look, sits on bed or cozy chair.
She looks like a REAL person doing a genuine review, NOT a model or actress.

────────────────────
Scene 1 — Hook & Product Reveal (Second 0-4):
Cozy bedroom/living room with natural window light.
The girl is sitting casually, holding the product (MUST match uploaded image exactly).
She looks at camera with excited expression, holding the product up to show it.
Selfie angle, handheld, slightly shaky.

She says (BAHASA INDONESIA, MAX 3 seconds): "Guys, review $categoryLabel dari $storeName ya!"

Close-up shot: she turns the product around, showing details, label, texture.
Natural lighting highlighting the product.

TikTok-style bold subtitle text at bottom of screen.

────────────────────
Scene 2 — Verdict + Closing (Second 4-8):
Back to medium shot. She's holding the product naturally.
Genuine smile, relaxed body language, speaking like talking to a best friend.

She says (BAHASA INDONESIA, MAX 3 seconds): "Worth it banget sih, wajib coba!"

Quick aesthetic shot of the product styled nicely on a table with soft background.
Trendy background music gets slightly louder.

Soft text overlay:
🛒 $storeName
📍 $location

────────────────────
AUDIO:
- Subtle trendy background music throughout (lo-fi beats, aesthetic, TikTok-trending)
- Her voice is natural, casual, enthusiastic but not over-the-top
- Feels like genuine honest review, NOT scripted commercial
- Music volume increases in final 2 seconds

TOTAL DURATION: 8 SECONDS MAXIMUM. DO NOT EXCEED.
TOTAL DIALOGUE: 6 SECONDS MAXIMUM.

════════════════════════════════════════════════════════════════════
CRITICAL RULES:
1. Product MUST look 100% identical to the uploaded photo — same shape, color, label, details
2. DO NOT redesign or reinterpret the product in any way
3. Must look like REAL TikTok UGC — organic feeling, NOT commercial
4. ALL dialogue in BAHASA INDONESIA — conversational, not formal
5. Handheld smartphone camera feel, natural lighting
6. Modern TikTok-style bold white subtitles with black outline
7. Character is a relatable young Indonesian woman (20-25)
8. Keep branding on product consistent with uploaded image
9. VIDEO MUST NOT EXCEED 8 SECONDS TOTAL
10. DIALOGUE MUST NOT EXCEED 6 SECONDS TOTAL
════════════════════════════════════════════════════════════════════

NEGATIVE PROMPT:
cinematic professional camera, tripod, studio lighting, static shot,
professional model, western person, anime, cartoon, blurry, low quality,
English dialogue, redesigned product, different product than uploaded,
corporate commercial feel, stiff acting, formal speech, announcer voice,
product without original branding, fancy studio backdrop, long video, slow pacing
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
