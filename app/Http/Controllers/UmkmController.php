<?php

namespace App\Http\Controllers;

use App\Models\UmkmStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Services\ImageService;

class UmkmController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Show UMKM dashboard with AI tools and content stats.
     */
    public function dashboard()
    {
        $user = auth()->user();
        $store = $user->umkmStore;

        // AI content statistics
        $aiStats = [
            'totalVideos' => 0,
            'totalPosters' => 0,
            'totalChats' => 0,
        ];

        $recentContents = [];

        try {
            $aiStats['totalVideos'] = \App\Models\AIGeneratedContent::where('user_id', $user->id)
                ->whereIn('type', ['video_generation', 'video_script', 'video_prompt'])
                ->count();

            $aiStats['totalPosters'] = \App\Models\AIGeneratedContent::where('user_id', $user->id)
                ->where('type', 'poster')
                ->count();

            $aiStats['totalChats'] = \App\Models\AIChatSession::where('user_id', $user->id)->count();

            $recentContents = \App\Models\AIGeneratedContent::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get(['id', 'type', 'status', 'created_at'])
                ->toArray();
        } catch (\Exception $e) {
            // Models may not exist yet, gracefully handle
        }

        return Inertia::render('umkm/dashboard', [
            'store' => $store ? [
                'id' => $store->id,
                'name' => $store->name,
            ] : null,
            'aiStats' => $aiStats,
            'recentContents' => $recentContents,
        ]);
    }

    /**
     * Show store setup form.
     */
    public function storeSetup()
    {
        $user  = auth()->user();
        $store = $user->umkmStore;

        return Inertia::render('umkm/store-setup', [
            'store'       => $store,
            'avatar_path' => $user->avatar_path,
        ]);
    }

    /**
     * Save/update store info (AI-focused: name, category, description, photo).
     */
    public function storeUpdate(Request $request)
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255', function ($attr, $value, $fail) {
                $blocked = ['masukkan nama warung', 'masukkan nama toko', 'nama toko', 'nama warung'];
                if (in_array(strtolower(trim($value)), $blocked)) {
                    $fail('Nama toko tidak boleh menggunakan teks default. Silakan masukkan nama toko Anda yang sebenarnya.');
                }
            }],
            'category'      => 'nullable|string|in:kuliner,kriya,jasa,lainnya',
            'description'   => 'nullable|string|max:1000',
            'profile_photo' => 'nullable|image|max:10240',
        ]);

        $user  = auth()->user();
        $store = $user->umkmStore ?? new UmkmStore(['user_id' => $user->id]);

        $store->name        = $validated['name'];
        $store->category    = $validated['category'] ?? $store->category;
        $store->description = $validated['description'] ?? $store->description;

        // Handle profile photo upload — saves as USER avatar (single source of truth)
        if ($request->hasFile('profile_photo')) {
            // Delete old avatar if exists
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            // Save to avatars/ folder (same as profile page)
            $path = $request->file('profile_photo')->store('avatars', 'public');
            $user->avatar_path        = $path;
            $store->profile_photo_path = $path; // sync for AI video generation
            $user->save();
        }

        $store->save();

        return redirect()->route('umkm.dashboard')
            ->with('success', 'Profil toko berhasil disimpan!');
    }
}
