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
    /**
     * Generate random phone number
     */
    private function generatePhone(): string
    {
        return '08' . rand(10, 99) . rand(1000, 9999) . rand(1000, 9999);
    }

    public function run(): void
    {
        try {
            $this->command->info('');
            $this->command->info('🚀 Starting UMKM 40 Gmail Seeder...');
            $this->command->info('');

            // =====================================================
            // STEP 1: DELETE EXISTING ACCOUNTS (umkm1-40@gmail.com)
            // =====================================================
            $this->command->info('🗑️  Deleting existing umkm1-40@gmail.com accounts...');

            $deletedCount = 0;
            for ($i = 1; $i <= 40; $i++) {
                $email = 'umkm' . $i . '@gmail.com';
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Delete associated store and products
                    $store = UmkmStore::where('user_id', $user->id)->first();
                    if ($store) {
                        // Delete products first
                        Product::where('umkm_store_id', $store->id)->delete();
                        // Delete store
                        $store->delete();
                    }
                    // Delete user
                    $user->delete();
                    $deletedCount++;
                    $this->command->info("   ❌ Deleted: $email");
                }
            }

            $this->command->info("   Total deleted: $deletedCount accounts");
            $this->command->info('');

            // =====================================================
            // STEP 2: CREATE NEW ACCOUNTS (EMPTY STORES, NO PRODUCTS)
            // =====================================================
            $this->command->info('✨ Creating new 40 UMKM accounts with empty stores...');
            $this->command->info('');

            $createdAccounts = [];

            for ($i = 1; $i <= 40; $i++) {
                $email = 'umkm' . $i . '@gmail.com';

                // Check if email already exists (shouldn't happen after deletion)
                if (User::where('email', $email)->exists()) {
                    $this->command->warn("⚠️  Account $email already exists, skipping...");
                    continue;
                }

                $waNumber = $this->generatePhone();

                // Create User Owner
                $owner = User::create([
                    'name' => 'UMKM ' . $i,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'umkm',
                    'wa_number' => $waNumber,
                    'wallet_balance' => 0,
                ]);
                DB::table('users')->where('id', $owner->id)->update(['email_verified_at' => now()]);

                // Create EMPTY store with placeholder name
                $store = UmkmStore::create([
                    'user_id' => $owner->id,
                    'name' => 'Masukkan Nama Warung',
                    'slug' => 'umkm-' . $i, // Unique slug for each store
                    'category' => 'kuliner',
                    'description' => '',
                    'address_pickup' => '',
                    'latitude' => null,
                    'longitude' => null,
                    'contact_number' => $waNumber,
                    'bank_name' => null,
                    'bank_account' => null,
                    'bank_holder' => null,
                    'is_open_today' => false,
                    'open_time' => null,
                    'close_time' => null,
                    'operating_days' => null,
                    'banner_path' => null,
                    'store_photo_path' => null,
                ]);

                // NO PRODUCTS CREATED - store is empty

                $createdAccounts[] = [
                    'email' => $email,
                    'store_id' => $store->id,
                ];

                $this->command->info("✅ Created: $email -> Empty store (ID: {$store->id})");
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
            $this->command->info('   Accounts deleted: ' . $deletedCount);
            $this->command->info('   Accounts created: ' . count($createdAccounts));
            $this->command->info('   Store name: "Masukkan Nama Warung" (empty)');
            $this->command->info('   Products: 0 (empty)');
            $this->command->info('');

        } catch (\Throwable $e) {
            $this->command->error("Seeder failed: " . $e->getMessage());
            Log::error("Umkm40Seeder failed: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
}
