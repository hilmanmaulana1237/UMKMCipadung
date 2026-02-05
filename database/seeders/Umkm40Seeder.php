<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class Umkm40Seeder extends Seeder
{
    public function run(): void
    {
        try {
            $this->command->info('');
            $this->command->info('🚀 Starting creation of 40 UMKM accounts...');
            $this->command->info('');

            $categories = ['kuliner', 'kriya', 'jasa'];

            $kulinerPrefixes = ['Warung', 'Kedai', 'Dapur', 'Rumah Makan', 'Catering', 'Bakso', 'Seblak', 'Sate', 'Nasi Goreng'];
            $kulinerSuffixes = ['Enak', 'Mantap', 'Berkah', 'Sari', 'Rasa', 'Ibu Juju', 'Pak Dedi', 'Keluarga', 'Nusantara', 'Pedas Gila'];

            $kriyaPrefixes = ['Kerajinan', 'Souvenir', 'Batik', 'Tenun', 'Aksesoris', 'Galeri', 'Studio', 'Handmade', 'Craft', 'Art'];
            $kriyaSuffixes = ['Cantik', 'Unik', 'Bandung', 'Kreatif', 'Jaya', 'Abadi', 'Lestari', 'Modern', 'Etnik', 'Indah'];

            $jasaPrefixes = ['Laundry', 'Service', 'Bengkel', 'Cuci', 'Jahit', 'Desain', 'Foto', 'Pijat', 'Salon', 'Barber'];
            $jasaSuffixes = ['Kilat', 'Express', 'Bersih', 'Rapi', 'Maju', 'Sejahtera', 'Prima', 'Professional', 'Ahli', 'Mandiri'];

            $faker = \Faker\Factory::create('id_ID');

            // Central Cipadung location
            $baseLat = -6.923700;
            $baseLng = 107.704200;

            $createdAccounts = [];

            for ($i = 1; $i <= 40; $i++) {
                $email = 'umkm' . $i . '@gmail.com';

                // Check if email already exists
                if (User::where('email', $email)->exists()) {
                    $this->command->warn("⚠️  Account $email already exists, skipping...");
                    continue;
                }

                $category = $categories[array_rand($categories)];

                // Generate Name based on category
                if ($category === 'kuliner') {
                    $storeName = $kulinerPrefixes[array_rand($kulinerPrefixes)] . ' ' . $kulinerSuffixes[array_rand($kulinerSuffixes)] . ' Gmail' . $i;
                } elseif ($category === 'kriya') {
                    $storeName = $kriyaPrefixes[array_rand($kriyaPrefixes)] . ' ' . $kriyaSuffixes[array_rand($kriyaSuffixes)] . ' Gmail' . $i;
                } else {
                    $storeName = $jasaPrefixes[array_rand($jasaPrefixes)] . ' ' . $jasaSuffixes[array_rand($jasaSuffixes)] . ' Gmail' . $i;
                }

                // Create User Owner
                $owner = User::create([
                    'name' => 'Owner ' . $storeName,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'umkm',
                    'wa_number' => '08' . $faker->numerify('##########'),
                    'wallet_balance' => rand(100000, 5000000),
                ]);
                DB::table('users')->where('id', $owner->id)->update(['email_verified_at' => now()]);

                // Randomize Schedule
                $openTime = sprintf("%02d:00", rand(7, 10));
                $closeTime = sprintf("%02d:00", rand(16, 22));

                // Randomize Operating Days
                $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                $scheduleType = rand(1, 3);
                if ($scheduleType == 1) {
                    $operatingDays = $days;
                } elseif ($scheduleType == 2) {
                    $operatingDays = array_slice($days, 0, 5);
                } else {
                    $operatingDays = array_slice($days, 0, 6);
                }

                $isOpenToday = in_array(strtolower(Carbon::now()->format('l')), $operatingDays);

                if (rand(1, 4) == 1) {
                    $isOpenToday = false;
                }

                $store = UmkmStore::create([
                    'user_id' => $owner->id,
                    'name' => $storeName,
                    'category' => $category,
                    'description' => 'Kami menyediakan berbagai macam ' . $category . ' berkualitas terbaik di Bandung. ' . $faker->sentence(10),
                    'address_pickup' => $faker->address,
                    'latitude' => $baseLat + ($faker->randomFloat(6, -0.02, 0.02)),
                    'longitude' => $baseLng + ($faker->randomFloat(6, -0.02, 0.02)),
                    'contact_number' => $owner->wa_number,
                    'bank_name' => 'BCA',
                    'bank_account' => $faker->bankAccountNumber,
                    'bank_holder' => $owner->name,
                    'is_open_today' => $isOpenToday,
                    'open_time' => $openTime,
                    'close_time' => $closeTime,
                    'operating_days' => $operatingDays,
                    'banner_path' => 'products/p5oJ8lpTgPAOnM6wkf9crBLuyQwFtJuHRoLjIATU.jpg',
                    'store_photo_path' => 'products/p5oJ8lpTgPAOnM6wkf9crBLuyQwFtJuHRoLjIATU.jpg',
                ]);

                // Generate Products (3-8 products per store)
                $productCount = rand(3, 8);
                for ($j = 1; $j <= $productCount; $j++) {
                    $price = ($category === 'kuliner') ? rand(10000, 50000) : (($category === 'jasa') ? rand(25000, 150000) : rand(50000, 300000));

                    $productName = '';
                    if ($category === 'kuliner') {
                        $foodItems = ['Nasi Paket', 'Ayam Geprek', 'Es Teh Manis', 'Kopi Susu', 'Seblak Spesial', 'Baso Aci', 'Mie Goreng', 'Pisang Keju'];
                        $productName = $foodItems[array_rand($foodItems)] . ' ' . $faker->word . ' ' . $j;
                    } elseif ($category === 'kriya') {
                        $kriyaItems = ['Tas Batik', 'Dompet Kulit', 'Gelang Etnik', 'Kalung Kayu', 'Topi Rajut', 'Syal Tenun', 'Hiasan Dinding'];
                        $productName = $kriyaItems[array_rand($kriyaItems)] . ' ' . $faker->word . ' ' . $j;
                    } else {
                        $jasaItems = ['Cuci Kiloan', 'Service Ringan', 'Paket Hemat', 'Jasa Desain', 'Potong Rambut', 'Pijat Refleksi'];
                        $productName = $jasaItems[array_rand($jasaItems)] . ' ' . $faker->word . ' ' . $j;
                    }

                    Product::create([
                        'umkm_store_id' => $store->id,
                        'name' => $productName,
                        'price' => $price,
                        'stock' => rand(10, 100),
                        'is_physical' => ($category !== 'jasa'),
                        'category' => $category,
                        'description' => 'Deskripsi untuk produk ' . $productName . '. Kualitas terjamin dan harga terjangkau.',
                        'is_active' => true,
                    ]);
                }

                $createdAccounts[] = [
                    'email' => $email,
                    'store' => $storeName,
                    'category' => $category,
                    'products' => $productCount,
                ];

                $this->command->info("✅ Created: $email -> $storeName ($category) with $productCount products");
            }

            // Summary
            $this->command->info('');
            $this->command->info('═══════════════════════════════════════════════════════════════');
            $this->command->info('✅ UMKM 40 Gmail Accounts created successfully!');
            $this->command->info('═══════════════════════════════════════════════════════════════');
            $this->command->info('');
            $this->command->info('📧 Account credentials:');
            $this->command->info('   Email: umkm1@gmail.com to umkm40@gmail.com');
            $this->command->info('   Password: password');
            $this->command->info('');
            $this->command->info('📊 Summary:');
            $this->command->info('   Total accounts created: ' . count($createdAccounts));
            $this->command->info('   Total UMKM stores: ' . UmkmStore::count());
            $this->command->info('   Total products: ' . Product::count());
            $this->command->info('');

        } catch (\Throwable $e) {
            $this->command->error("Seeder failed: " . $e->getMessage());
            Log::error("Umkm40Seeder failed: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
}
