<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Order;
use Symfony\Component\HttpFoundation\Response;

/**
 * Prevents couriers from logging out while they have active orders.
 * This ensures orders don't get "stuck" with an unavailable courier.
 */
class PreventCourierLogout
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'courier') {
            $activeOrder = Order::where('courier_id', $user->id)
                ->whereIn('courier_status', ['driver_assigned', 'pickup_otw', 'delivery_otw'])
                ->first();

            if ($activeOrder) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Anda masih memiliki pesanan aktif. Selesaikan atau batalkan pesanan terlebih dahulu.',
                        'has_active_order' => true,
                        'order_id' => $activeOrder->id,
                        'order_number' => $activeOrder->order_number,
                    ], 403);
                }

                return redirect()->route('courier.active')
                    ->with('error', 'Anda masih memiliki pesanan aktif. Selesaikan atau batalkan terlebih dahulu sebelum logout.');
            }
        }

        return $next($request);
    }
}
