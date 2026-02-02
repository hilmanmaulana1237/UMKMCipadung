<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        DB::table('settings')->insertOrIgnore([
            ['key' => 'courier_fee', 'value' => '10000', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'app_name', 'value' => 'UMKM Connect', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
