<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\AffiliateReward;
use App\Models\AIChatSession;
use App\Models\AIChatMessage;
use App\Models\StoreReview;
use App\Models\Rating;
use App\Models\Complaint;
use App\Models\WithdrawalRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        try {
            // =====================================================
            // BUYERS - Area Cipadung, Bandung
            // =====================================================
            $buyer1 = User::create([
                'name' => 'Ahmad Pembeli',
                'email' => 'buyer@demo.com',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'wa_number' => '081234567890',
                'wallet_balance' => 150000,
            ]);
            DB::table('users')->where('id', $buyer1->id)->update(['email_verified_at' => now()]);

            $buyer2 = User::create([
                'name' => 'Siti Warga Cipadung',
                'email' => 'siti@demo.com',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'wa_number' => '081234567891',
                'wallet_balance' => 75000,
            ]);
            DB::table('users')->where('id', $buyer2->id)->update(['email_verified_at' => now()]);

            $buyer3 = User::create([
                'name' => 'Budi Santoso',
                'email' => 'budi@demo.com',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'wa_number' => '081234567892',
                'wallet_balance' => 200000,
            ]);
            DB::table('users')->where('id', $buyer3->id)->update(['email_verified_at' => now()]);

            $buyer4 = User::create([
                'name' => 'Nina Kartika',
                'email' => 'nina@demo.com',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'wa_number' => '081234567893',
                'wallet_balance' => 50000,
            ]);
            DB::table('users')->where('id', $buyer4->id)->update(['email_verified_at' => now()]);

            // =====================================================
            // ADMIN ACCOUNT
            // =====================================================
            $admin = User::create([
                'name' => 'Admin MudaPreneur',
                'email' => 'admin@demo.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'wa_number' => '081234567899',
                'wallet_balance' => 0,
            ]);
            DB::table('users')->where('id', $admin->id)->update(['email_verified_at' => now()]);

            // =====================================================
            // UMKM ACCOUNTS - 50 Stores in Cipadung/Bandung area
            // =====================================================

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

            for ($i = 1; $i <= 50; $i++) {
                $category = $categories[array_rand($categories)];
                
                // Generate Name based on category
                if ($category === 'kuliner') {
                    $storeName = $kulinerPrefixes[array_rand($kulinerPrefixes)] . ' ' . $kulinerSuffixes[array_rand($kulinerSuffixes)] . ' ' . $i;
                } elseif ($category === 'kriya') {
                    $storeName = $kriyaPrefixes[array_rand($kriyaPrefixes)] . ' ' . $kriyaSuffixes[array_rand($kriyaSuffixes)] . ' ' . $i;
                } else {
                    $storeName = $jasaPrefixes[array_rand($jasaPrefixes)] . ' ' . $jasaSuffixes[array_rand($jasaSuffixes)] . ' ' . $i;
                }

                // Create User Owner
                $owner = User::create([
                    'name' => 'Owner ' . $storeName,
                    'email' => 'umkm' . $i . '@demo.com',
                    'password' => Hash::make('password'),
                    'role' => 'umkm',
                    'wa_number' => '08' . $faker->numerify('##########'),
                    'wallet_balance' => rand(100000, 5000000),
                ]);
                DB::table('users')->where('id', $owner->id)->update(['email_verified_at' => now()]);

                // Randomize Schedule
                $openTime = sprintf("%02d:00", rand(7, 10)); // 07:00 - 10:00
                $closeTime = sprintf("%02d:00", rand(16, 22)); // 16:00 - 22:00
                
                // Randomize Operating Days
                $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                $scheduleType = rand(1, 3);
                if ($scheduleType == 1) {
                    $operatingDays = $days; // Every day
                } elseif ($scheduleType == 2) {
                    $operatingDays = array_slice($days, 0, 5); // Mon-Fri
                } else {
                     $operatingDays = array_slice($days, 0, 6); // Mon-Sat
                }

                // Logic to simulate is_open_today based on schedule & current dummy time logic
                $isOpenToday = in_array(strtolower(Carbon::now()->format('l')), $operatingDays);
                
                // Force some to be closed for demo purposes
                if (rand(1, 4) == 1) { 
                    $isOpenToday = false; 
                }

                $store = UmkmStore::create([
                    'user_id' => $owner->id,
                    'name' => $storeName,
                    'description' => 'Kami menyediakan berbagai macam ' . $category . ' berkualitas terbaik di Bandung. ' . $faker->sentence(10),
                    'address_pickup' => $faker->address,
                    'latitude' => $baseLat + ($faker->randomFloat(6, -0.02, 0.02)), // ~2km variasi
                    'longitude' => $baseLng + ($faker->randomFloat(6, -0.02, 0.02)),
                    'contact_number' => $owner->wa_number,
                    'bank_name' => 'BCA',
                    'bank_account' => $faker->bankAccountNumber,
                    'bank_holder' => $owner->name,
                    'is_open_today' => $isOpenToday,
                    'open_time' => $openTime,
                    'close_time' => $closeTime,
                    'operating_days' => $operatingDays,
                    'banner_path' => 'products/p5oJ8lpTgPAOnM6wkf9crBLuyQwFtJuHRoLjIATU.jpg', // Dummy banner
                    'store_photo_path' => 'products/p5oJ8lpTgPAOnM6wkf9crBLuyQwFtJuHRoLjIATU.jpg', // Dummy store photo
                ]);

                // Generate Products
                $productCount = rand(5, 12);
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
            }

            // =====================================================
            // COURIERS - Active in Cipadung area
            // =====================================================
            $courier1 = User::create([
                'name' => 'Rudi Driver',
                'email' => 'courier@demo.com',
                'password' => Hash::make('password'),
                'role' => 'courier',
                'wa_number' => '083456789012',
                'wallet_balance' => 250000,
                'is_courier_active' => true,
                'current_lat' => -6.9200, // Near Cipadung
                'current_lng' => 107.7090,
            ]);
            DB::table('users')->where('id', $courier1->id)->update(['email_verified_at' => now()]);

            $courier2 = User::create([
                'name' => 'Dedi Kurir',
                'email' => 'courier2@demo.com',
                'password' => Hash::make('password'),
                'role' => 'courier',
                'wa_number' => '083456789013',
                'wallet_balance' => 180000,
                'is_courier_active' => false, // Offline
                'current_lat' => -6.9220,
                'current_lng' => 107.7110,
            ]);
            DB::table('users')->where('id', $courier2->id)->update(['email_verified_at' => now()]);

            $courier3 = User::create([
                'name' => 'Eko Pengantar',
                'email' => 'courier3@demo.com',
                'password' => Hash::make('password'),
                'role' => 'courier',
                'wa_number' => '083456789014',
                'wallet_balance' => 320000,
                'is_courier_active' => true,
                'current_lat' => -6.9180,
                'current_lng' => 107.7080,
            ]);
            DB::table('users')->where('id', $courier3->id)->update(['email_verified_at' => now()]);

            // =====================================================
            // AFFILIATORS
            // =====================================================
            $affiliator1 = User::create([
                'name' => 'Lisa Affiliate',
                'email' => 'affiliate@demo.com',
                'password' => Hash::make('password'),
                'role' => 'affiliator',
                'wa_number' => '084567890123',
                'wallet_balance' => 125000,
                'affiliate_code' => 'LISA2024',
            ]);
            DB::table('users')->where('id', $affiliator1->id)->update(['email_verified_at' => now()]);

            $affiliator2 = User::create([
                'name' => 'Andi Promo',
                'email' => 'affiliate2@demo.com',
                'password' => Hash::make('password'),
                'role' => 'affiliator',
                'wa_number' => '084567890124',
                'wallet_balance' => 85000,
                'affiliate_code' => 'ANDI123',
            ]);
            DB::table('users')->where('id', $affiliator2->id)->update(['email_verified_at' => now()]);

            // =====================================================
            // ORDERS & INTERACTIONS - Dynamic Generation
            // =====================================================

            $buyers = User::where('role', 'buyer')->get();
            $couriers = User::where('role', 'courier')->get();
            $affiliators = User::where('role', 'affiliator')->get();
            $stores = UmkmStore::with('products')->get();

            foreach ($buyers as $buyer) {
                // Each buyer makes 3-8 orders
                $orderCount = rand(3, 8);
                
                for ($k = 0; $k < $orderCount; $k++) {
                    $store = $stores->random();
                    $products = $store->products;
                    
                    if ($products->isEmpty()) continue;

                    $courier = $couriers->random();
                    
                    // Random status selection
                    $statusProb = rand(1, 100);
                    if ($statusProb <= 70) {
                        $status = 'completed';
                        $courierStatus = 'delivered';
                    } elseif ($statusProb <= 80) {
                        $status = 'on_delivery';
                        $courierStatus = 'delivery_otw';
                    } elseif ($statusProb <= 90) {
                        $status = 'processing';
                        $courierStatus = 'idle';
                    } else {
                        $status = 'cancelled';
                        $courierStatus = 'idle';
                    }

                    $orderLat = $baseLat + ($faker->randomFloat(6, -0.01, 0.01));
                    $orderLng = $baseLng + ($faker->randomFloat(6, -0.01, 0.01));

                    // Create Order
                    $order = Order::create([
                        'order_number' => Order::generateOrderNumber(),
                        'buyer_id' => $buyer->id,
                        'umkm_store_id' => $store->id,
                        'courier_id' => ($status !== 'processing' && $status !== 'cancelled') ? $courier->id : null,
                        'promo_code_used' => (rand(1, 10) == 1 && $affiliators->isNotEmpty()) ? $affiliators->random()->affiliate_code : null,
                        'status' => $status,
                        'courier_status' => $courierStatus,
                        'total_amount' => 0, // Will update
                        'courier_fee' => Order::COURIER_COMMISSION_AMOUNT,
                        'payment_proof_path' => 'payment_proofs/default.jpg',
                        'shipping_address' => $faker->address,
                        'shipping_lat' => $orderLat,
                        'shipping_lng' => $orderLng,
                        'cancellation_code' => ($status === 'cancelled') ? 'CNXL' . rand(1000, 9999) : null,
                        'cancelled_by' => ($status === 'cancelled') ? 'buyer' : null,
                        'cancelled_at' => ($status === 'cancelled') ? now()->subDays(rand(1, 5)) : null,
                        'created_at' => now()->subDays(rand(1, 30)),
                    ]);

                    // Add Items
                    $totalAmount = 0;
                    $itemCount = rand(1, 4);
                    
                    for ($m = 0; $m < $itemCount; $m++) {
                        $product = $products->random();
                        $qty = rand(1, 3);
                        
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'quantity' => $qty,
                            'price' => $product->price,
                        ]);
                        
                        $totalAmount += ($product->price * $qty);
                    }
                    
                    $order->update(['total_amount' => $totalAmount + $order->courier_fee]);

                    // Create Rating if completed
                    if ($status === 'completed' && rand(1, 10) <= 8) { // 80% chance to rate
                        Rating::create([
                            'order_id' => $order->id,
                            'user_id' => $buyer->id,
                            'target_type' => 'store',
                            'target_id' => $store->id,
                            'stars' => rand(3, 5),
                            'comment' => $faker->sentence(),
                            'created_at' => $order->created_at->addDays(1),
                        ]);

                        if ($order->courier_id) {
                            Rating::create([
                                'order_id' => $order->id,
                                'user_id' => $buyer->id,
                                'target_type' => 'courier',
                                'target_id' => $order->courier_id,
                                'stars' => rand(4, 5),
                                'comment' => 'Pengiriman cepat!',
                                'created_at' => $order->created_at->addDays(1),
                            ]);
                        }
                    }
                }
            }

            // =====================================================
            // COMPLAINTS - Create a few
            // =====================================================
            $completedOrders = Order::where('status', 'completed')->take(5)->get();
            foreach ($completedOrders as $order) {
                Complaint::create([
                    'user_id' => $order->buyer_id,
                    'order_id' => $order->id,
                    'type' => 'product_quality',
                    'description' => 'Produk tidak sesuai deskripsi',
                    'status' => 'pending',
                ]);
            }
            
            // =====================================================
            // WITHDRAWAL REQUESTS
            // =====================================================
            // Use store owner
            $randomStore = UmkmStore::inRandomOrder()->first();
            if ($randomStore) {
                WithdrawalRequest::create([
                    'user_id' => $randomStore->user_id,
                    'amount' => 100000,
                    'bank_name' => 'BCA',
                    'bank_account' => '1234567890',
                    'bank_holder' => 'Tuti Sumarni',
                    'status' => 'pending',
                    'created_at' => now()->subDays(1),
                ]);
            }

            WithdrawalRequest::create([
                'user_id' => $courier1->id,
                'amount' => 50000,
                'bank_name' => 'Dana',
                'bank_account' => '083456789012',
                'bank_holder' => 'Rudi Driver',
                'status' => 'approved',
                'admin_notes' => 'Transfer berhasil', // Fixed key
                'processed_at' => now()->subDays(1),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(4),
            ]);

            WithdrawalRequest::create([
                'user_id' => $courier1->id,
                'amount' => 75000,
                'bank_name' => 'Dana',
                'bank_account' => '083456789012',
                'bank_holder' => 'Rudi Driver',
                'status' => 'rejected',
                'admin_notes' => 'Pembatalan sudah disetujui otomatis oleh sistem.', // Fixed key
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(2),
            ]);

            // =====================================================
            // SUMMARY OUTPUT
            // =====================================================
            $this->command->info('');
            $this->command->info('✅ Comprehensive dummy data created successfully!');
            $this->command->info('');
            $this->command->info('📧 Demo Accounts:');
            $this->command->info('   Buyer:      buyer@demo.com / password');
            $this->command->info('   UMKM:       umkm1@demo.com / password (Check DB for others)');
            $this->command->info('   Courier:    courier@demo.com / password');
            $this->command->info('   Affiliate:  affiliate@demo.com / password');
            $this->command->info('   Admin:      admin@demo.com / password');
            $this->command->info('');
            $this->command->info('🏪 Stores Created: ' . UmkmStore::count());
            $this->command->info('📦 Orders Created: ' . Order::count());
            $this->command->info('⭐ Ratings: ' . Rating::count() . ' total');
            $this->command->info('💰 Courier fee: Rp ' . number_format(Order::COURIER_COMMISSION_AMOUNT, 0, ',', '.'));

        } catch (\Throwable $e) {
            $this->command->error("Seeder failed: " . $e->getMessage());
            Log::error("Seeder failed: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
}
