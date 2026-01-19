<?php

use App\Models\UmkmStore;
use App\Models\Product;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Total Stores: " . UmkmStore::count() . "\n";
echo "Stores with Active Products: " . UmkmStore::whereHas('products', function($q) {
    $q->active()->inStock();
})->count() . "\n";

echo "\n--- First 5 Stores ---\n";
$stores = UmkmStore::take(5)->get();
foreach ($stores as $store) {
    echo "ID: {$store->id} | Name: {$store->name} | Lat: {$store->latitude} | Lng: {$store->longitude}\n";
    echo "   Active Products: " . $store->products()->active()->inStock()->count() . "\n";
}
