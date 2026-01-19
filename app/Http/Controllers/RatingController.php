<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    /**
     * Store ratings for courier and/or store from a completed order.
     */
    public function store(Request $request, Order $order)
    {
        // Validate request
        $validated = $request->validate([
            'courier_rating' => 'nullable|integer|min:1|max:5',
            'courier_comment' => 'nullable|string|max:500',
            'store_rating' => 'nullable|integer|min:1|max:5',
            'store_comment' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Check if user is the buyer of this order
        if ($order->buyer_id !== $user->id) {
            return back()->with('error', 'Anda tidak bisa memberi rating untuk pesanan ini.');
        }

        // Check if order is completed
        if ($order->status !== 'completed') {
            return back()->with('error', 'Hanya pesanan yang sudah selesai yang bisa diberi rating.');
        }

        // Rate courier if provided and order has courier
        if (!empty($validated['courier_rating']) && $order->courier_id) {
            // Check if already rated
            $existingCourierRating = Rating::where('order_id', $order->id)
                ->where('target_type', 'courier')
                ->first();

            if (!$existingCourierRating) {
                Rating::create([
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'target_type' => 'courier',
                    'target_id' => $order->courier_id,
                    'stars' => $validated['courier_rating'],
                    'comment' => $validated['courier_comment'] ?? null,
                ]);
            }
        }

        // Rate store if provided
        if (!empty($validated['store_rating'])) {
            // Check if already rated
            $existingStoreRating = Rating::where('order_id', $order->id)
                ->where('target_type', 'store')
                ->first();

            if (!$existingStoreRating) {
                Rating::create([
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'target_type' => 'store',
                    'target_id' => $order->umkm_store_id,
                    'stars' => $validated['store_rating'],
                    'comment' => $validated['store_comment'] ?? null,
                ]);
            }
        }

        return back()->with('success', 'Terima kasih atas penilaian Anda! ⭐');
    }

    /**
     * Check if order can be rated.
     */
    public static function canRate(Order $order, $userId): array
    {
        $canRateCourier = false;
        $canRateStore = false;

        if ($order->status === 'completed' && $order->buyer_id === $userId) {
            // Check courier rating
            if ($order->courier_id) {
                $canRateCourier = !Rating::where('order_id', $order->id)
                    ->where('target_type', 'courier')
                    ->exists();
            }

            // Check store rating
            $canRateStore = !Rating::where('order_id', $order->id)
                ->where('target_type', 'store')
                ->exists();
        }

        return [
            'canRateCourier' => $canRateCourier,
            'canRateStore' => $canRateStore,
            'canRate' => $canRateCourier || $canRateStore,
        ];
    }
}
