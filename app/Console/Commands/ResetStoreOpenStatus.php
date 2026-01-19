<?php

namespace App\Console\Commands;

use App\Models\UmkmStore;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ResetStoreOpenStatus extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'stores:reset-open';

    /**
     * The console command description.
     */
    protected $description = 'Reset all stores to closed at midnight - UMKM must manually open each day';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get today's day name in lowercase (e.g., 'monday')
        $today = strtolower(Carbon::now()->format('l'));

        $this->info("Updating store status for: $today");

        // Process all stores efficiently
        // If today is in their operating_days, open it. Otherwise close it.
        $opened = 0;
        $closed = 0;

        UmkmStore::chunk(100, function ($stores) use ($today, &$opened, &$closed) {
            foreach ($stores as $store) {
                $isOpenDay = $store->operating_days && in_array($today, $store->operating_days);
                
                $store->update(['is_open_today' => $isOpenDay]);
                
                if ($isOpenDay) $opened++; else $closed++;
            }
        });

        $this->info("Daily store status update complete!");
        $this->info("- $opened stores set to OPEN");
        $this->info("- $closed stores set to CLOSED");

        return Command::SUCCESS;
    }
}
