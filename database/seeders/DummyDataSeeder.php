<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UmkmStore;
use App\Models\AIGeneratedContent;
use App\Models\AIChatSession;
use App\Models\AIChatMessage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        try {
            // =====================================================
            // ADMIN ACCOUNT
            // =====================================================
            $admin = User::create([
                'name' => 'Admin MudaPreneur',
                'email' => 'admin@demo.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
            DB::table('users')->where('id', $admin->id)->update(['email_verified_at' => now()]);

            // =====================================================
            // UMKM SELLER ACCOUNTS
            // =====================================================
            $faker = \Faker\Factory::create('id_ID');

            $sellerNames = [
                'Warung Enak Berkah', 'Kedai Kopi Mantap', 'Dapur Sari Rasa', 'Seblak Pedas Gila', 'Bakso Pak Dedi',
                'Kerajinan Cantik', 'Batik Modern Jaya', 'Souvenir Unik Bandung', 'Galeri Etnik Lestari', 'Studio Kreatif',
                'Laundry Express Kilat', 'Salon Rapi Prima', 'Bengkel Maju Sejahtera', 'Foto Studio Profesional', 'Jahit Ahli Mandiri',
                'Catering Keluarga', 'Nasi Goreng Nusantara', 'Sate Ibu Juju', 'Rumah Makan Berkah', 'Kedai Rasa Mantap',
            ];

            $sellers = [];

            for ($i = 0; $i < count($sellerNames); $i++) {
                $storeName = $sellerNames[$i];

                $owner = User::create([
                    'name' => 'Penjual ' . $storeName,
                    'email' => 'umkm' . ($i + 1) . '@demo.com',
                    'password' => Hash::make('password'),
                    'role' => 'umkm',
                ]);
                DB::table('users')->where('id', $owner->id)->update(['email_verified_at' => now()]);

                $store = UmkmStore::create([
                    'user_id' => $owner->id,
                    'name' => $storeName,
                    'slug' => Str::slug($storeName) . '-' . Str::random(5),
                    'description' => 'UMKM ' . $storeName . ' menyediakan produk & layanan terbaik di Cipadung.',
                    'address_pickup' => $faker->address,
                ]);

                $sellers[] = $owner;

                // Generate AI content for some sellers
                if (rand(1, 3) <= 2) { // ~66% of sellers have AI content
                    $contentCount = rand(2, 8);
                    $types = ['video_generation', 'video_script', 'poster', 'video_prompt'];
                    $statuses = ['completed', 'completed', 'completed', 'failed', 'processing'];

                    for ($j = 0; $j < $contentCount; $j++) {
                        $type = $types[array_rand($types)];
                        $prompts = [
                            'Buat video promosi untuk ' . $storeName,
                            'Generate poster diskon 50% untuk ' . $storeName,
                            'Buat script video testimonial pelanggan',
                            'Poster promo akhir pekan ' . $storeName,
                            'Video company profile ' . $storeName,
                            'Poster menu baru spesial',
                            'Script video tutorial produk',
                        ];

                        AIGeneratedContent::create([
                            'user_id' => $owner->id,
                            'type' => $type,
                            'prompt' => $prompts[array_rand($prompts)],
                            'status' => $statuses[array_rand($statuses)],
                            'generated_result' => json_encode(['text' => 'Hasil konten AI untuk ' . $storeName]),
                            'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                        ]);
                    }
                }

                // Generate AI chat sessions for some sellers
                if (rand(1, 3) <= 2) { // ~66%
                    $sessionCount = rand(1, 4);
                    $chatTopics = [
                        'Strategi pemasaran digital',
                        'Cara menentukan harga produk',
                        'Tips meningkatkan penjualan',
                        'Konsultasi branding bisnis',
                        'Cara membuat konten menarik',
                    ];

                    for ($k = 0; $k < $sessionCount; $k++) {
                        $session = AIChatSession::create([
                            'user_id' => $owner->id,
                            'title' => $chatTopics[array_rand($chatTopics)],
                            'created_at' => now()->subDays(rand(0, 30)),
                        ]);

                        // Add messages
                        $messageCount = rand(2, 8);
                        for ($m = 0; $m < $messageCount; $m++) {
                            $role = ($m % 2 === 0) ? 'user' : 'assistant';
                            $userMessages = [
                                'Bagaimana cara meningkatkan penjualan online?',
                                'Saya ingin tahu strategi harga yang tepat',
                                'Apa tips untuk membuat konten menarik di Instagram?',
                                'Bagaimana cara menarik pelanggan baru?',
                                'Apa yang harus saya lakukan untuk branding?',
                            ];
                            $aiMessages = [
                                'Untuk meningkatkan penjualan online, Anda bisa mulai dengan optimasi media sosial dan membuat konten yang menarik secara konsisten.',
                                'Strategi harga yang tepat dimulai dari memahami biaya produksi, margin keuntungan, dan harga kompetitor di pasar.',
                                'Untuk konten Instagram, fokuslah pada visual yang menarik, caption yang engaging, dan gunakan hashtag yang relevan.',
                                'Cara menarik pelanggan baru: berikan promo khusus, bangun review positif, dan aktif di media sosial.',
                                'Branding dimulai dari konsistensi visual (logo, warna, font) dan pesan yang jelas tentang value proposition bisnis Anda.',
                            ];

                            AIChatMessage::create([
                                'session_id' => $session->id,
                                'role' => $role,
                                'content' => $role === 'user' ? $userMessages[array_rand($userMessages)] : $aiMessages[array_rand($aiMessages)],
                                'created_at' => $session->created_at->addMinutes($m * rand(1, 5)),
                            ]);
                        }
                    }
                }
            }

            // =====================================================
            // SUMMARY OUTPUT
            // =====================================================
            $this->command->info('');
            $this->command->info('✅ Demo data created successfully!');
            $this->command->info('');
            $this->command->info('📧 Demo Accounts:');
            $this->command->info('   Admin:     admin@demo.com / password');
            $this->command->info('   Penjual:   umkm1@demo.com / password (and umkm2-20)');
            $this->command->info('');
            $this->command->info('🏪 Stores Created: ' . UmkmStore::count());
            $this->command->info('🎬 AI Content Created: ' . AIGeneratedContent::count());
            $this->command->info('💬 AI Chat Sessions: ' . AIChatSession::count());
            $this->command->info('📝 AI Chat Messages: ' . AIChatMessage::count());

        } catch (\Throwable $e) {
            $this->command->error("Seeder failed: " . $e->getMessage());
            Log::error("Seeder failed: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
}
