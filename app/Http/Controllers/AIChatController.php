<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


use App\Models\AIChatMessage;
use App\Models\AIChatSession;
use App\Services\AIService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AIChatController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index()
    {
        $sessions = AIChatSession::where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('umkm/ai-mentor/index', [
            'sessions' => $sessions
        ]);
    }

    public function show($id)
    {
        $session = AIChatSession::where('user_id', Auth::id())
            ->where('id', $id)
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        return Inertia::render('umkm/ai-mentor/chat', [
            'session' => $session,
            'messages' => $session->messages
        ]);
    }

    public function store()
    {
        $session = AIChatSession::create([
            'user_id' => Auth::id(),
            'title' => 'Obrolan Baru ' . now()->format('d M H:i'),
        ]);

        // Add initial greeting from Si Mudapreneur
        AIChatMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => "Halo Kak! Saya Si Mudapreneur, mentor bisnis siap bantu UMKM kakak. Mau diskusi soal apa hari ini?

Bisa tanya soal:
1. Strategi pemasaran hemat
2. Hitung harga jual yang pas
3. Ide konten TikTok/IG
4. Solusi stok numpuk",
        ]);

        return redirect()->route('umkm.ai-mentor.chat', $session->id);
    }

    public function sendMessage(Request $request, $sessionId)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $session = AIChatSession::where('user_id', Auth::id())
            ->where('id', $sessionId)
            ->firstOrFail();

        // Save user message
        AIChatMessage::create([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $request->message,
        ]);

        // Get chat history for context
        $history = $session->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])
            ->toArray();

        // Get AI response
        $aiResponse = $this->aiService->chatWithMentor($request->message, $history);

        // Save AI response
        $message = AIChatMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => $aiResponse,
        ]);

        // Update session timestamp
        $session->touch();

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }
}
