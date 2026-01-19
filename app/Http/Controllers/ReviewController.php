<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit a review for a completed order.
     */
    public function store(Request $request, \App\Models\Order $order)
    {
        // Ensure user is the buyer of this order
        if ($order->buyer_id !== auth()->id()) {
            return back()->with('error', 'Anda tidak dapat mereview pesanan ini.');
        }

        // Ensure order is completed
        if ($order->status !== 'completed') {
            return back()->with('error', 'Hanya pesanan yang selesai dapat direview.');
        }

        // Check if already reviewed
        $existingReview = \App\Models\StoreReview::where('order_id', $order->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingReview) {
            return back()->with('error', 'Anda sudah memberikan review untuk pesanan ini.');
        }

        // Validate input
        $validated = $request->validate([
            'sentiment' => 'required|in:positive,negative',
            'comment' => 'nullable|string|max:500',
        ]);

        // Create the review
        \App\Models\StoreReview::create([
            'umkm_store_id' => $order->umkm_store_id,
            'user_id' => auth()->id(),
            'order_id' => $order->id,
            'sentiment' => $validated['sentiment'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return back()->with('success', 'Terima kasih atas review Anda! 🎉');
    }

    /**
     * Get reviews for a store.
     */
    public function index(\App\Models\UmkmStore $store)
    {
        $reviews = \App\Models\StoreReview::where('umkm_store_id', $store->id)
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json($reviews);
    }
}
