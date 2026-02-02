<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Order;

echo "Testing All UMKM Stores Orders\n";
echo "================================\n\n";

$umkms = User::where('role', 'umkm')->with('umkmStore')->get();

foreach ($umkms as $umkm) {
    echo "🏪 {$umkm->name} ({$umkm->email})\n";
    echo "   Store: {$umkm->umkmStore->name}\n";
    
    $orders = Order::where('umkm_store_id', $umkm->umkmStore->id)->get();
    echo "   Total Orders: " . $orders->count() . "\n";
    
    if ($orders->count() > 0) {
        $byStatus = $orders->groupBy('status');
        foreach ($byStatus as $status => $statusOrders) {
            echo "     - {$status}: " . $statusOrders->count() . "\n";
        }
    }
    echo "\n";
}
