<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockRole
{
    /**
     * Block specific roles from accessing certain routes.
     * Usage: BlockRole:courier,affiliator (blocks couriers and affiliators)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$blockedRoles  Roles that are NOT allowed
     */
    public function handle(Request $request, Closure $next, string ...$blockedRoles): Response
    {
        $user = $request->user();

        // If not authenticated, let auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        // Check if user's role is in the blocked list
        if (in_array($user->role, $blockedRoles)) {
            // Redirect to their appropriate dashboard
            $redirectRoute = match ($user->role) {
                'courier' => 'courier.radar',
                'umkm' => 'umkm.dashboard',
                'affiliator' => 'affiliate.dashboard',
                'admin' => 'admin.dashboard',
                default => 'dashboard',
            };
            
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Anda tidak memiliki akses ke halaman ini.',
                    'message' => 'Role Anda tidak diizinkan mengakses fitur ini.'
                ], 403);
            }
            
            return redirect()->route($redirectRoute)
                ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
        }

        return $next($request);
    }
}
