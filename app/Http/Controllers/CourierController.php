<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourierController extends Controller
{
    /**
     * Show courier dashboard/radar with available jobs.
     */
    public function radar()
    {
        $user = auth()->user();

        // Get orders ready to ship without a courier assigned
        $availableJobs = Order::with(['store', 'buyer'])
            ->where('status', 'ready_to_ship')
            ->whereNull('courier_id')
            ->where('courier_status', 'finding_driver')
            ->get()
            ->map(function ($order) use ($user) {
                // Calculate estimated distance (simplified - in real app use Google Maps API)
                $distance = $this->calculateDistance(
                    $user->current_lat,
                    $user->current_lng,
                    $order->store->latitude ?? 0,
                    $order->store->longitude ?? 0
                );

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'store_name' => $order->store->name,
                    'store_address' => $order->store->address_pickup,
                    'buyer_address' => $order->shipping_address,
                    'courier_fee' => $order->courier_fee,
                    'distance' => $distance,
                    'created_at' => $order->created_at,
                ];
            })
            ->sortBy('distance') // Sort by nearest first
            ->values();

        // Check if courier has an active order
        $activeOrder = Order::with(['store', 'buyer'])
            ->where('courier_id', $user->id)
            ->whereIn('courier_status', ['driver_assigned', 'pickup_otw', 'delivery_otw'])
            ->first();

        return Inertia::render('courier/radar', [
            'availableJobs' => $availableJobs,
            'isActive' => $user->is_courier_active,
            'activeOrder' => $activeOrder,
            'courierRating' => [
                'average' => $user->courier_average_rating,
                'total' => $user->courier_total_ratings,
            ],
        ]);
    }

    /**
     * Toggle courier active status.
     */
    public function toggleActive(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        $user->update([
            'is_courier_active' => !$user->is_courier_active,
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
        ]);

        return back()->with('success', $user->is_courier_active 
            ? 'Mode kurir aktif!' 
            : 'Mode kurir nonaktif.');
    }

    /**
     * Update courier location manually.
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        auth()->user()->update([
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
        ]);

        return back()->with('success', 'Lokasi berhasil diperbarui!');
    }

    /**
     * Accept a delivery job.
     * Requires courier location within Cipadung area (3km radius).
     */
    public function acceptJob(Request $request, Order $order)
    {
        // Validate location is provided
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ], [
            'lat.required' => 'Harap aktifkan GPS dan izinkan akses lokasi.',
            'lng.required' => 'Harap aktifkan GPS dan izinkan akses lokasi.',
        ]);

        // Cipadung area validation (3km radius from center)
        $cipadungLat = -6.9237;
        $cipadungLng = 107.7042;
        $maxRadiusKm = 3.0;

        $distance = $this->calculateDistance(
            $request->lat, $request->lng,
            $cipadungLat, $cipadungLng
        );

        if ($distance > $maxRadiusKm) {
            return back()->withErrors([
                'error' => 'Anda berada di luar area operasional Cipadung (radius 3km). Jarak Anda: ' . round($distance, 1) . ' km dari pusat.'
            ]);
        }

        $user = auth()->user();

        // Update courier's current location
        $user->update([
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
        ]);

        if (!$user->is_courier_active) {
            return back()->withErrors(['error' => 'Aktifkan mode kurir terlebih dahulu.']);
        }

        if ($order->courier_id !== null) {
            return back()->withErrors(['error' => 'Pesanan sudah diambil kurir lain.']);
        }

        if ($order->status !== 'ready_to_ship') {
            return back()->withErrors(['error' => 'Pesanan tidak tersedia.']);
        }

        // Check if courier already has an active order
        $hasActiveOrder = Order::where('courier_id', $user->id)
            ->whereIn('courier_status', ['driver_assigned', 'pickup_otw', 'delivery_otw'])
            ->exists();

        if ($hasActiveOrder) {
            return back()->withErrors(['error' => 'Selesaikan pesanan aktif Anda terlebih dahulu.']);
        }

        $order->update([
            'courier_id' => $user->id,
            'courier_status' => 'driver_assigned',
            'courier_accepted_at' => now(), // Track when courier accepted for timeout
        ]);

        return redirect()->route('courier.active')
            ->with('success', 'Berhasil mengambil pesanan!');
    }


    /**
     * Show active delivery trip.
     */
    public function activeTrip()
    {
        $user = auth()->user();

        $activeOrder = Order::with(['store', 'buyer', 'items.product'])
            ->where('courier_id', $user->id)
            ->whereIn('courier_status', ['driver_assigned', 'pickup_otw', 'delivery_otw'])
            ->first();

        return Inertia::render('courier/active-trip', [
            'order' => $activeOrder,
        ]);
    }

    /**
     * Update to pickup on the way.
     */
    public function pickupOtw(Order $order)
    {
        $this->validateCourierOrder($order);

        $order->update([
            'courier_status' => 'pickup_otw',
            'courier_last_activity_at' => now(),
        ]);

        return back()->with('success', 'Status diperbarui: Menuju toko.');
    }

    /**
     * Mark items as picked up, start delivery.
     */
    public function pickedUp(Order $order)
    {
        $this->validateCourierOrder($order);

        $order->update([
            'status' => 'on_delivery',
            'courier_status' => 'delivery_otw',
            'courier_last_activity_at' => now(),
        ]);

        return back()->with('success', 'Barang diambil. Mengantar ke pembeli.');
    }

    /**
     * Complete the delivery.
     */
    public function complete(Order $order)
    {
        $this->validateCourierOrder($order);

        DB::transaction(function () use ($order) {
            // 1. Update order status
            $order->update([
                'status' => 'completed',
                'courier_status' => 'delivered',
            ]);

            // 2. Pay courier (add courier fee to wallet)
            $order->courier->increment('wallet_balance', $order->courier_fee);

            // 3. Pay affiliator (if verified reward exists)
            $reward = $order->affiliateReward;
            if ($reward && $reward->isVerified()) {
                $reward->markAsPaid();
            }
        });

        return redirect()->route('courier.radar')
            ->with('success', 'Pengiriman selesai! Komisi ditambahkan ke dompet.');
    }

    /**
     * Validate that user is the assigned courier for this order.
     */
    private function validateCourierOrder(Order $order): void
    {
        if ($order->courier_id !== auth()->id()) {
            abort(403, 'Anda bukan kurir untuk pesanan ini.');
        }
    }

    /**
     * Courier cancels/abandons the delivery.
     * Order returns to radar for other couriers.
     */
    public function cancelOrder(Order $order)
    {
        $this->validateCourierOrder($order);

        // Security: Prevent cancellation if items are already picked up (Theft Risk)
        if ($order->courier_status === 'delivery_otw') {
            return back()->with('error', 'Barang sudah diambil! Tidak bisa batalkan. Hubungi Admin/CS jika ada darurat.');
        }

        // Security: Prevent cancellation if already on the way to pickup (for better reliability)
        // Or if we want to be strict: once accepted, cannot cancel without penalty.
        // For now, let's just block delivery_otw as requested.
        
        if ($order->courier_status === 'delivered') {
            return back()->with('error', 'Pesanan sudah selesai, tidak bisa dibatalkan.');
        }

        $order->update([
            'courier_id' => null,
            'courier_status' => 'finding_driver',
            'status' => 'ready_to_ship',
        ]);

        return redirect()->route('courier.radar')
            ->with('success', 'Pesanan dibatalkan dan dikembalikan ke radar.');
    }

    /**
     * Show courier delivery history.
     */
    public function history()
    {
        $user = auth()->user();

        $deliveries = Order::with(['store', 'buyer'])
            ->where('courier_id', $user->id)
            ->whereIn('courier_status', ['delivered'])
            ->orWhere(function ($query) use ($user) {
                $query->where('courier_id', $user->id)
                      ->where('status', 'cancelled');
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        $stats = [
            'totalDeliveries' => Order::where('courier_id', $user->id)
                ->where('courier_status', 'delivered')
                ->count(),
            'totalEarnings' => Order::where('courier_id', $user->id)
                ->where('courier_status', 'delivered')
                ->sum('courier_fee'),
            'thisMonthEarnings' => Order::where('courier_id', $user->id)
                ->where('courier_status', 'delivered')
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->sum('courier_fee'),
        ];

        return Inertia::render('courier/history', [
            'deliveries' => $deliveries,
            'stats' => $stats,
        ]);
    }

    /**
     * Calculate distance between two coordinates (Haversine formula).
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        if (!$lat1 || !$lng1 || !$lat2 || !$lng2) {
            return 0;
        }

        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 1);
    }
}
