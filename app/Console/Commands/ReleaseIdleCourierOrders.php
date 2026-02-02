<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Release courier orders that have been idle for more than 1 hour.
 * This prevents orders from getting "stuck" when a courier becomes unavailable.
 */
class ReleaseIdleCourierOrders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'courier:release-idle-orders 
                            {--timeout=60 : Minutes of inactivity before releasing order}';

    /**
     * The console command description.
     */
    protected $description = 'Release courier orders that have been idle for too long (default: 60 minutes)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $timeoutMinutes = (int) $this->option('timeout');
        $cutoffTime = now()->subMinutes($timeoutMinutes);

        // Find orders that have been assigned to couriers but idle for too long
        $idleOrders = Order::whereNotNull('courier_id')
            ->whereIn('courier_status', ['driver_assigned', 'pickup_otw'])
            ->where(function ($query) use ($cutoffTime) {
                // Check last activity or acceptance time
                $query->where(function ($q) use ($cutoffTime) {
                    $q->whereNotNull('courier_last_activity_at')
                      ->where('courier_last_activity_at', '<', $cutoffTime);
                })->orWhere(function ($q) use ($cutoffTime) {
                    $q->whereNull('courier_last_activity_at')
                      ->whereNotNull('courier_accepted_at')
                      ->where('courier_accepted_at', '<', $cutoffTime);
                });
            })
            ->get();

        $releasedCount = 0;

        foreach ($idleOrders as $order) {
            $courierName = $order->courier?->name ?? 'Unknown';
            
            // Return order to pool
            $order->update([
                'courier_id' => null,
                'courier_status' => 'finding_driver',
                'status' => 'ready_to_ship',
                'courier_accepted_at' => null,
                'courier_last_activity_at' => null,
            ]);

            $releasedCount++;

            Log::info("Released idle order #{$order->order_number} from courier {$courierName} (idle > {$timeoutMinutes} min)");
            $this->info("Released order #{$order->order_number} from {$courierName}");
        }

        if ($releasedCount > 0) {
            $this->info("✅ Released {$releasedCount} idle orders back to the pool.");
        } else {
            $this->info("No idle orders found.");
        }

        return Command::SUCCESS;
    }
}
