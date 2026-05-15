<?php

use App\Http\Controllers\AIContentController;
use App\Http\Controllers\UmkmController;
use App\Http\Middleware\RoleCheck;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Public media routes for generated AI content
Route::get('/media/generated-file/{token}', [AIContentController::class, 'publicGeneratedFile'])
    ->name('media.generated-file');

Route::get('/storage/generated-videos/{filename}', [AIContentController::class, 'publicGeneratedVideoByName'])
    ->where('filename', '.*');

Route::get('/storage/generated-posters/{filename}', [AIContentController::class, 'publicGeneratedPosterByName'])
    ->where('filename', '.*');

// Landing Page
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public Landing Page (canonical + backward-compatible alias)
Route::get('toko/{slug}', [\App\Http\Controllers\LandingPageController::class, 'show'])->name('landing-page.show');
Route::get('l/{slug}', [\App\Http\Controllers\LandingPageController::class, 'show'])->name('landing-page.show-short');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Universal Dashboard - redirect based on role
    Route::get('dashboard', function () {
        if (auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('umkm.dashboard');
    })->name('dashboard');

    // Profile (simplified - nama, email, foto)
    Route::get('profile', function () {
        return Inertia::render('profile/index');
    })->name('profile');

    // Avatar upload (used for AI content generation)
    Route::post('profile/avatar', function (\Illuminate\Http\Request $request) {
        $request->validate(['avatar' => 'required|image|max:10240']);

        $user = \App\Models\User::find(auth()->id());

        // Delete old avatar if exists
        if ($user->avatar_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar_path = $path;
        $user->save();

        return back()->with('success', 'Foto profil berhasil diperbarui!');
    })->name('profile.avatar');

    /*
    |--------------------------------------------------------------------------
    | UMKM / Seller Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('umkm')->name('umkm.')->group(function () {
        Route::get('dashboard', [UmkmController::class, 'dashboard'])->name('dashboard');

        // Store Setup (simplified profile)
        Route::get('setup-toko', [UmkmController::class, 'storeSetup'])->name('store.setup');
        Route::post('store', [UmkmController::class, 'storeUpdate'])->name('store.update');
    });

    /*
    |--------------------------------------------------------------------------
    | AI Feature Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::post('/generate-description', [\App\Http\Controllers\AIController::class, 'generateDescription'])->name('generate-description');
        Route::post('/suggest-price', [\App\Http\Controllers\AIController::class, 'suggestPrice'])->name('suggest-price');
        Route::get('/insights', [\App\Http\Controllers\AIController::class, 'getInsights'])->name('insights');
        Route::post('/smart-replies', [\App\Http\Controllers\AIController::class, 'getSmartReplies'])->name('smart-replies');
        Route::get('/bundle-suggestions', [\App\Http\Controllers\AIController::class, 'getBundleSuggestions'])->name('bundle-suggestions');
        Route::get('/sentiment', [\App\Http\Controllers\AIController::class, 'getSentiment'])->name('sentiment');
        Route::get('/trending', [\App\Http\Controllers\AIController::class, 'getTrending'])->name('trending');
    });

    // AI Mentor (Chatbot)
    Route::prefix('umkm')->name('umkm.')->group(function () {
        Route::get('ai-mentor', [\App\Http\Controllers\AIChatController::class, 'index'])->name('ai-mentor.index');
        Route::post('ai-mentor', [\App\Http\Controllers\AIChatController::class, 'store'])->name('ai-mentor.store');
        Route::get('ai-mentor/{id}', [\App\Http\Controllers\AIChatController::class, 'show'])->name('ai-mentor.chat');
        Route::post('ai-mentor/{id}/message', [\App\Http\Controllers\AIChatController::class, 'sendMessage'])->name('ai-mentor.message');

        // AI Content Generator
        Route::get('ai-content', [\App\Http\Controllers\AIContentController::class, 'index'])->name('ai-content.index');
        Route::post('ai-content/video-script', [\App\Http\Controllers\AIContentController::class, 'generateVideoScript'])->name('ai-content.video');
        Route::post('ai-content/video-prompt', [\App\Http\Controllers\AIContentController::class, 'generateVideoPrompt'])->name('ai-content.video-prompt');
        Route::post('ai-content/generate-video-description', [\App\Http\Controllers\AIContentController::class, 'generateVideoDescription'])->name('ai-content.generate-video-description');
        Route::post('ai-content/generate-ugc-photo', [\App\Http\Controllers\AIContentController::class, 'generateUGCPhoto'])->name('ai-content.generate-ugc-photo');
        Route::post('ai-content/check-ugc-photo-status', [\App\Http\Controllers\AIContentController::class, 'checkUGCPhotoStatus'])->name('ai-content.check-ugc-photo-status');
        Route::post('ai-content/generate-video', [\App\Http\Controllers\AIContentController::class, 'generateVideo'])->name('ai-content.generate-video');
        Route::post('ai-content/check-video-status', [\App\Http\Controllers\AIContentController::class, 'checkVideoStatus'])->name('ai-content.check-video-status');
        Route::post('ai-content/poster', [\App\Http\Controllers\AIContentController::class, 'generatePoster'])->name('ai-content.poster');

        // AI Poster Generator (Template-Based)
        Route::get('ai-content/poster-templates', [\App\Http\Controllers\AIContentController::class, 'getPosterTemplates'])->name('ai-content.poster-templates');
        Route::post('ai-content/generate-poster-template', [\App\Http\Controllers\AIContentController::class, 'generatePosterFromTemplate'])->name('ai-content.generate-poster-template');
        Route::post('ai-content/check-poster-status', [\App\Http\Controllers\AIContentController::class, 'checkPosterStatus'])->name('ai-content.check-poster-status');
        Route::post('ai-content/generate-poster-copywriting', [\App\Http\Controllers\AIContentController::class, 'generatePosterCopywriting'])->name('ai-content.generate-poster-copywriting');

        // AI Landing Page Builder
        Route::get('landing-page', [\App\Http\Controllers\LandingPageController::class, 'index'])->name('landing-page.index');
        Route::post('landing-page', [\App\Http\Controllers\LandingPageController::class, 'store'])->name('landing-page.store');
        Route::delete('landing-page/{id}', [\App\Http\Controllers\LandingPageController::class, 'destroy'])->name('landing-page.destroy');
        Route::get('landing-page/preview-template/{templateId}', [\App\Http\Controllers\LandingPageController::class, 'previewTemplate'])->name('landing-page.preview-template');
        Route::post('landing-page/generate-content', [\App\Http\Controllers\LandingPageController::class, 'generateContent'])->name('landing-page.generate-content');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes — Monitor AI Activity
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->middleware(RoleCheck::class . ':admin')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'dashboard'])->name('dashboard');
        Route::get('sellers', [\App\Http\Controllers\AdminDashboardController::class, 'sellers'])->name('sellers');
        Route::post('sellers', [\App\Http\Controllers\AdminDashboardController::class, 'createSeller'])->name('sellers.create');
        Route::delete('sellers/{user}', [\App\Http\Controllers\AdminDashboardController::class, 'deleteSeller'])->name('sellers.delete');
        Route::get('sellers/{user}', [\App\Http\Controllers\AdminDashboardController::class, 'sellerDetail'])->name('sellers.detail');
        Route::get('contents', [\App\Http\Controllers\AdminDashboardController::class, 'contents'])->name('contents');
        Route::get('chats', [\App\Http\Controllers\AdminDashboardController::class, 'chatSessions'])->name('chats');
        Route::get('chats/{session}', [\App\Http\Controllers\AdminDashboardController::class, 'chatDetail'])->name('chats.detail');
    });
});

require __DIR__ . '/settings.php';
