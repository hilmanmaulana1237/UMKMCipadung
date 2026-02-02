<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\UmkmStore;

echo "Testing UMKM Orders Query\n";
echo "==========================\n\n";

$user = User::where('email', 'umkm@demo.com')->first();

if (!$user) {
    echo "❌ User not found!\n";
    exit;
}

echo "✅ User: {$user->name} ({$user->email})\n";
echo "   Role: {$user->role}\n\n";

$store = $user->umkmStore;

if (!$store) {
    echo "❌ Store not found!\n";
    exit;
}

echo "✅ Store: {$store->name}\n";
echo "   Store ID: {$store->id}\n\n";

// Check all orders
$allOrders = Order::where('umkm_store_id', $store->id)->get();
echo "📦 Total Orders for this store: " . $allOrders->count() . "\n\n";

if ($allOrders->count() > 0) {
    echo "Orders by status:\n";
    $statuses = $allOrders->groupBy('status');
    foreach ($statuses as $status => $orders) {
        echo "  - {$status}: " . $orders->count() . "\n";
    }
    echo "\n";
    
    echo "Order details:\n";
    foreach ($allOrders as $order) {
        echo "  Order #{$order->id}: {$order->order_number}\n";
        echo "    Status: {$order->status}\n";
        echo "    Buyer ID: {$order->buyer_id}\n";
        echo "    Store ID: {$order->umkm_store_id}\n";
        echo "    Amount: Rp " . number_format($order->total_amount, 0, ',', '.') . "\n\n";
    }
}

// Test the relation
echo "Testing store->orders() relation:\n";
$ordersViaRelation = $store->orders()->get();
echo "  Orders via relation: " . $ordersViaRelation->count() . "\n";

// Test specific status
$waitingOrders = $store->orders()->where('status', 'waiting_verification')->get();
echo "  Waiting verification: " . $waitingOrders->count() . "\n";

$processingOrders = $store->orders()->where('status', 'processing')->get();
echo "  Processing: " . $processingOrders->count() . "\n";
