<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to block checkout when maintenance mode is active.
 * 
 * This only blocks NEW orders. Existing orders can still be:
 * - Viewed by buyers
 * - Processed by UMKM
 * - Delivered by couriers
 */
class MaintenanceMode
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::isMaintenanceMode()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Aplikasi sedang dalam mode maintenance. Silakan coba lagi nanti.',
                    'maintenance_mode' => true,
                ], 503);
            }

            return redirect()->route('marketplace')
                ->with('error', 'Aplikasi sedang dalam mode maintenance. Pemesanan tidak tersedia untuk sementara.');
        }

        return $next($request);
    }
}
