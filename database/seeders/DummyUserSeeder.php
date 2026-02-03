<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DummyUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Membuat 50 user dummy dengan nama Indonesia
     */
    public function run(): void
    {
        $namaDepan = [
            'Budi',
            'Siti',
            'Agus',
            'Dewi',
            'Eko',
            'Rina',
            'Wahyu',
            'Putri',
            'Andi',
            'Ratna',
            'Yudi',
            'Ayu',
            'Dian',
            'Rudi',
            'Fitri',
            'Joko',
            'Lestari',
            'Hendra',
            'Wati',
            'Bambang',
            'Indah',
            'Teguh',
            'Sari',
            'Prasetyo',
            'Nita',
            'Galih',
            'Rini',
            'Tono',
            'Maya',
            'Dedi',
            'Nurul',
            'Arif',
            'Lina',
            'Fajar',
            'Yanti',
            'Rizki',
            'Mega',
            'Bayu',
            'Citra',
            'Hadi',
            'Nia',
            'Surya',
            'Tika',
            'Wawan',
            'Yuni'
        ];

        $namaBelakang = [
            'Santoso',
            'Wijaya',
            'Pratama',
            'Kusuma',
            'Putra',
            'Hidayat',
            'Saputra',
            'Nugroho',
            'Rahayu',
            'Wibowo',
            'Setiawan',
            'Permana',
            'Suryadi',
            'Hartono',
            'Puspita',
            'Ramadhan',
            'Utami',
            'Prasetyo',
            'Anggraini',
            'Susanto',
            'Gunawan',
            'Laksono',
            'Firmansyah',
            'Handoko',
            'Kurniawan'
        ];

        $this->command->info('Membuat 50 user dummy dengan nama Indonesia...');
        $this->command->newLine();

        // Array untuk menyimpan data user
        $userData = [];
        $userData[] = "==============================================";
        $userData[] = "DAFTAR AKUN USER DUMMY - MUDAPRENEUR";
        $userData[] = "==============================================";
        $userData[] = "";
        $userData[] = "Password untuk semua akun: password123";
        $userData[] = "";
        $userData[] = "----------------------------------------------";
        $userData[] = sprintf("| %-3s | %-25s | %-30s |", "No", "Nama", "Email");
        $userData[] = "----------------------------------------------";

        for ($i = 1; $i <= 50; $i++) {
            $nama = $namaDepan[array_rand($namaDepan)] . ' ' . $namaBelakang[array_rand($namaBelakang)];
            $email = 'user' . $i . '@gmail.com';

            User::create([
                'name' => $nama,
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'buyer',
                'email_verified_at' => now(),
            ]);

            $userData[] = sprintf("| %-3d | %-25s | %-30s |", $i, $nama, $email);
            $this->command->info("Created: {$nama} ({$email})");
        }

        $userData[] = "----------------------------------------------";
        $userData[] = "";
        $userData[] = "Total: 50 user";
        $userData[] = "Generated: " . now()->format('d-m-Y H:i:s');

        // Simpan ke file
        $content = implode("\n", $userData);
        file_put_contents(base_path('daftar_user_dummy.txt'), $content);

        $this->command->newLine();
        $this->command->info('✅ Berhasil membuat 50 user dummy!');
        $this->command->info('📄 Data disimpan di: daftar_user_dummy.txt');
        $this->command->newLine();

        // Tampilkan di console juga
        $this->command->info($content);
    }
}
