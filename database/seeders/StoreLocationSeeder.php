<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Str;

class StoreLocationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding stores with varied locations around Cipadung...');

        // Base Location (Cipadung)
        $baseLat = -6.923700;
        $baseLng = 107.704200;

        $faker = \Faker\Factory::create('id_ID');

        // Categories Configuration
        $categories = ['kuliner', 'kriya', 'jasa'];
        
        // 1. Create 5 Stores VERY CLOSE (0-1 km)
        $this->createStores($baseLat, $baseLng, 0.005, 5, 'Near', $categories, $faker);

        // 2. Create 5 Stores MEDIUM DISTANCE (1-5 km)
        $this->createStores($baseLat, $baseLng, 0.04, 5, 'Medium', $categories, $faker);

        // 3. Create 5 Stores FAR DISTANCE (5-15 km)
        $this->createStores($baseLat, $baseLng, 0.1, 5, 'Far', $categories, $faker);

        $this->command->info('✅ Store seeding completed!');
    }

    private function createStores($lat, $lng, $spread, $count, $prefix, $categories, $faker)
    {
        for ($i = 1; $i <= $count; $i++) {
            $category = $categories[array_rand($categories)];
            $storeName = "$prefix Store $category $i";

            $uniqueId = uniqid();
            $owner = User::create([
                'name' => "Owner $storeName",
                'email' => strtolower("owner_{$prefix}_{$category}_{$i}_{$uniqueId}@demo.com"),
                'password' => Hash::make('password'),
                'role' => 'umkm',
                'wa_number' => '08' . $faker->numerify('##########'),
            ]);
            
            // Create Store
            $store = UmkmStore::create([
                'user_id' => $owner->id,
                'name' => $storeName,
                'slug' => Str::slug($storeName . '-' . $uniqueId),
                'description' => "Toko $category di lokasi $prefix. Menyediakan produk berkualitas.",
                'address_pickup' => $faker->address,
                'latitude' => $lat + ($faker->randomFloat(6, -$spread, $spread)),
                'longitude' => $lng + ($faker->randomFloat(6, -$spread, $spread)),
                'contact_number' => $owner->wa_number,
                'bank_name' => 'BCA',
                'bank_account' => $faker->bankAccountNumber,
                'is_open_today' => true,
            ]);

            // Create Products (Crucial for appearing in Marketplace)
            for ($j = 1; $j <= 5; $j++) {
                Product::create([
                    'umkm_store_id' => $store->id,
                    'name' => "Produk $prefix $j",
                    'slug' => Str::slug("produk_{$prefix}_{$category}_{$i}_{$j}_" . uniqid()),
                    'description' => "Deskripsi produk $j dari $storeName",
                    'price' => rand(10000, 200000),
                    'stock' => rand(10, 100),
                    'category' => $category,
                    'is_active' => true,
                    'image_path' => 'products/default.jpg',
                ]);
            }
        }
    }
}
