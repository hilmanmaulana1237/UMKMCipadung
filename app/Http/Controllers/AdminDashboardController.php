<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\AIGeneratedContent;
use App\Models\AIChatSession;
use App\Models\AIChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Admin dashboard — overview of all AI activity.
     */
    public function dashboard()
    {
        $totalSellers = User::where('role', 'umkm')->count();
        $totalStores = UmkmStore::count();

        // AI Content stats
        $totalVideos = AIGeneratedContent::whereIn('type', ['video_generation', 'video_script', 'video_prompt'])->count();
        $totalPosters = AIGeneratedContent::where('type', 'poster')->count();
        $totalChatSessions = AIChatSession::count();
        $totalChatMessages = AIChatMessage::count();
        $totalAIContent = AIGeneratedContent::count();

        // Status breakdown
        $contentByStatus = [
            'completed' => AIGeneratedContent::where('status', 'completed')->count(),
            'processing' => AIGeneratedContent::whereIn('status', ['processing', 'generating', 'queuing'])->count(),
            'failed' => AIGeneratedContent::where('status', 'failed')->count(),
        ];

        // Recent AI content (last 20)
        $recentContents = AIGeneratedContent::with('user')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'type' => $c->type,
                'status' => $c->status,
                'prompt' => $c->prompt ? \Illuminate\Support\Str::limit($c->prompt, 80) : null,
                'created_at' => $c->created_at,
                'user' => $c->user ? [
                    'id' => $c->user->id,
                    'name' => $c->user->name,
                    'email' => $c->user->email,
                ] : null,
            ]);

        // Top sellers by AI usage (SQLite-compatible: filter in PHP)
        $topSellers = User::where('role', 'umkm')
            ->withCount([
                'aiContents as video_count' => fn($q) => $q->whereIn('type', ['video_generation', 'video_script', 'video_prompt']),
                'aiContents as poster_count' => fn($q) => $q->where('type', 'poster'),
                'aiChatSessions as chat_count',
            ])
            ->get()
            ->filter(fn($u) => ($u->video_count + $u->poster_count + $u->chat_count) > 0)
            ->sortByDesc(fn($u) => $u->video_count + $u->poster_count + $u->chat_count)
            ->take(10)
            ->values()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'video_count' => $u->video_count ?? 0,
                'poster_count' => $u->poster_count ?? 0,
                'chat_count' => $u->chat_count ?? 0,
            ]);

        // Daily activity (last 14 days)
        $dailyActivity = AIGeneratedContent::where('created_at', '>=', now()->subDays(14))
            ->selectRaw("date(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalSellers' => $totalSellers,
                'totalStores' => $totalStores,
                'totalVideos' => $totalVideos,
                'totalPosters' => $totalPosters,
                'totalChatSessions' => $totalChatSessions,
                'totalChatMessages' => $totalChatMessages,
                'totalAIContent' => $totalAIContent,
                'contentByStatus' => $contentByStatus,
            ],
            'recentContents' => $recentContents,
            'topSellers' => $topSellers,
            'dailyActivity' => $dailyActivity,
        ]);
    }

    /**
     * List all sellers with their AI usage stats.
     */
    public function sellers(Request $request)
    {
        $search = $request->get('search', '');

        $query = User::where('role', 'umkm')
            ->with('umkmStore')
            ->withCount([
                'aiContents as total_content',
                'aiContents as video_count' => fn($q) => $q->whereIn('type', ['video_generation', 'video_script', 'video_prompt']),
                'aiContents as poster_count' => fn($q) => $q->where('type', 'poster'),
                'aiChatSessions as chat_count',
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $sellers = $query->latest()->paginate(20)->through(function ($seller) {
            $storeName = $seller->umkm_store?->name ?? null;
            $storeIncomplete = !$storeName || in_array(strtolower(trim($storeName)), [
                'masukkan nama warung', 'masukkan nama toko', 'nama toko', 'nama warung'
            ]);
            return [
                'id'           => $seller->id,
                'name'         => $seller->name,
                'email'        => $seller->email,
                'avatar_path'  => $seller->avatar_path,
                'created_at'   => $seller->created_at,
                'total_content'=> $seller->total_content,
                'video_count'  => $seller->video_count,
                'poster_count' => $seller->poster_count,
                'chat_count'   => $seller->chat_count,
                'store_name'   => $storeIncomplete ? null : $storeName,
                'store_incomplete' => $storeIncomplete,
                'umkm_store'   => $seller->umkm_store ? [
                    'id'   => $seller->umkm_store->id,
                    'name' => $storeName,
                ] : null,
            ];
        });

        return Inertia::render('admin/sellers', [
            'sellers' => $sellers,
            'search'  => $search,
        ]);
    }

    /**
     * Show detail of a specific seller's AI activity.
     */
    public function sellerDetail(User $user)
    {
        if ($user->role !== 'umkm') {
            abort(404);
        }

        $user->load('umkmStore');

        // AI content by this seller
        $contents = AIGeneratedContent::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        // Chat sessions by this seller
        $chatSessions = AIChatSession::where('user_id', $user->id)
            ->withCount('messages')
            ->latest()
            ->take(10)
            ->get();

        // Stats
        $stats = [
            'totalContent' => AIGeneratedContent::where('user_id', $user->id)->count(),
            'videoCount' => AIGeneratedContent::where('user_id', $user->id)
                ->whereIn('type', ['video_generation', 'video_script', 'video_prompt'])->count(),
            'posterCount' => AIGeneratedContent::where('user_id', $user->id)
                ->where('type', 'poster')->count(),
            'chatCount' => AIChatSession::where('user_id', $user->id)->count(),
            'completedCount' => AIGeneratedContent::where('user_id', $user->id)
                ->where('status', 'completed')->count(),
            'failedCount' => AIGeneratedContent::where('user_id', $user->id)
                ->where('status', 'failed')->count(),
        ];

        return Inertia::render('admin/seller-detail', [
            'seller' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_path' => $user->avatar_path,
                'created_at' => $user->created_at,
                'store' => $user->umkmStore ? [
                    'id' => $user->umkmStore->id,
                    'name' => $user->umkmStore->name,
                ] : null,
            ],
            'contents' => $contents,
            'chatSessions' => $chatSessions,
            'stats' => $stats,
        ]);
    }

    /**
     * List all AI generated content (videos & posters).
     */
    public function contents(Request $request)
    {
        $type = $request->get('type', 'all');
        $status = $request->get('status', 'all');

        $query = AIGeneratedContent::with('user')->latest();

        if ($type !== 'all') {
            if ($type === 'video') {
                $query->whereIn('type', ['video_generation', 'video_script', 'video_prompt']);
            } else {
                $query->where('type', $type);
            }
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $contents = $query->paginate(20);

        return Inertia::render('admin/contents', [
            'contents' => $contents,
            'currentType' => $type,
            'currentStatus' => $status,
        ]);
    }

    /**
     * List all AI chat sessions.
     */
    public function chatSessions(Request $request)
    {
        $sessions = AIChatSession::with('user')
            ->withCount('messages')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/chat-sessions', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * View a specific chat session's messages.
     */
    public function chatDetail(AIChatSession $session)
    {
        $session->load(['user', 'messages' => fn($q) => $q->orderBy('created_at', 'asc')]);

        return Inertia::render('admin/chat-detail', [
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'created_at' => $session->created_at,
                'user' => $session->user ? [
                    'id' => $session->user->id,
                    'name' => $session->user->name,
                    'email' => $session->user->email,
                ] : null,
                'messages' => $session->messages->map(fn($m) => [
                    'id' => $m->id,
                    'role' => $m->role,
                    'content' => $m->content,
                    'created_at' => $m->created_at,
                ]),
            ],
        ]);
    }

    /**
     * Create a new UMKM seller account.
     */
    public function createSeller(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(8)],
        ]);

        User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'plain_password' => $request->password,
            'role'           => 'umkm',
        ]);

        return redirect('/admin/sellers')->with('success', 'Akun penjual berhasil dibuat!');
    }

    /**
     * Delete a seller account (safe-guard: only UMKM role).
     */
    public function deleteSeller(User $user)
    {
        if ($user->role !== 'umkm') {
            return back()->with('error', 'Hanya akun penjual yang dapat dihapus.');
        }

        // Delete all related AI data first
        AIGeneratedContent::where('user_id', $user->id)->delete();
        AIChatSession::where('user_id', $user->id)->delete();
        UmkmStore::where('user_id', $user->id)->delete();

        $user->delete();

        return redirect('/admin/sellers')->with('success', 'Akun penjual berhasil dihapus.');
    }
}
