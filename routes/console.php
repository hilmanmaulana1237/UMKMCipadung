<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule: Reset all UMKM stores to CLOSED at midnight
// UMKM owners must manually open their stores each day
Schedule::command('stores:reset-open')->dailyAt('00:00')->timezone('Asia/Jakarta');
Schedule::command('app:backup-database')->dailyAt('00:00')->timezone('Asia/Jakarta');
Schedule::command('sitemap:generate')->daily()->timezone('Asia/Jakarta');

// Schedule: Release idle courier orders (1 hour timeout)
// Runs every 15 minutes to check for orders that have been idle too long
Schedule::command('courier:release-idle-orders --timeout=60')
    ->everyFifteenMinutes()
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();
