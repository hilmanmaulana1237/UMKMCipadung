<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;

/**
 * Seeder to create ready_to_ship orders for testing courier distance sorting.
 * 
 * Run with: php artisan db:seed --class=CourierTestSeeder
 */
class CourierTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating orders for courier testing...');

        // Get a buyer
        $buyer = User::where('role', 'buyer')->first();
        if (!$buyer) {
            $this->command->error('No buyer found. Please run DummyDataSeeder first.');
            return;
        }

        // Get stores with different locations (distance from courier)
        $stores = UmkmStore::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->has('products')
            ->take(10)
            ->get();

        if ($stores->isEmpty()) {
            $this->command->error('No stores with location found. Please run DummyDataSeeder first.');
            return;
        }

        $faker = \Faker\Factory::create('id_ID');
        $createdCount = 0;

        // Cipadung center (where courier is assumed to be)
        $cipadungLat = -6.9237;
        $cipadungLng = 107.7042;

        foreach ($stores as $index => $store) {
            $products = $store->products()->active()->inStock()->get();
            if ($products->isEmpty()) continue;

            // Calculate distance from Cipadung center
            $distance = $this->calculateDistance(
                $cipadungLat, $cipadungLng,
                $store->latitude, $store->longitude
            );

            $this->command->info("Store: {$store->name} | Distance: {$distance} km | Lat: {$store->latitude}, Lng: {$store->longitude}");

            // Create order with status ready_to_ship
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'buyer_id' => $buyer->id,
                'umkm_store_id' => $store->id,
                'courier_id' => null, // No courier assigned yet
                'status' => 'ready_to_ship',
                'courier_status' => 'finding_driver',
                'total_amount' => 0,
                'courier_fee' => Order::COURIER_COMMISSION_AMOUNT,
                'payment_proof_path' => 'payment_proofs/default.jpg',
                'shipping_address' => $faker->address,
                'shipping_lat' => $cipadungLat + ($faker->randomFloat(6, -0.005, 0.005)),
                'shipping_lng' => $cipadungLng + ($faker->randomFloat(6, -0.005, 0.005)),
                'created_at' => now()->subMinutes(rand(5, 60)),
            ]);

            // Add items
            $totalAmount = 0;
            $itemCount = rand(1, 3);
            
            for ($i = 0; $i < $itemCount; $i++) {
                $product = $products->random();
                $qty = rand(1, 2);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price' => $product->price,
                ]);
                
                $totalAmount += ($product->price * $qty);
            }
            
            $order->update(['total_amount' => $totalAmount + $order->courier_fee]);
            $createdCount++;
        }

        $this->command->info('');
        $this->command->info("✅ Created {$createdCount} orders ready for courier pickup!");
        $this->command->info('');
        $this->command->info('Login as courier (courier@demo.com / password) and check the radar.');
        $this->command->info('Orders should be sorted by distance from the courier location.');
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        if (!$lat1 || !$lng1 || !$lat2 || !$lng2) {
            return 0;
        }

        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}
