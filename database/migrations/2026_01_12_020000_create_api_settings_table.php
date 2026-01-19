<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('api_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // 'api_primary', 'api_secondary', 'api_video'
            $table->text('value')->nullable(); // Encrypted API key
            $table->string('model')->nullable(); // Model name (deepseek, gemini, etc)
            $table->string('provider')->default('openrouter'); // openrouter, openai, google
            $table->string('base_url')->nullable(); // Custom base URL if needed
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default settings
        DB::table('api_settings')->insert([
            [
                'key' => 'api_primary',
                'value' => null,
                'model' => 'deepseek/deepseek-r1-0528:free',
                'provider' => 'openrouter',
                'base_url' => 'https://openrouter.ai/api/v1/chat/completions',
                'description' => 'API Utama untuk UMKM Mentor dan Admin Chatbot. Gunakan model yang pintar (GPT-4, DeepSeek R1, Claude).',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'api_secondary',
                'value' => null,
                'model' => 'deepseek/deepseek-r1-0528:free',
                'provider' => 'openrouter',
                'base_url' => 'https://openrouter.ai/api/v1/chat/completions',
                'description' => 'API Sekunder untuk tugas ringan: generate deskripsi, Shopping AI, smart replies.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'api_video',
                'value' => null,
                'model' => null,
                'provider' => 'openrouter',
                'base_url' => null,
                'description' => 'API untuk Video Generation (masa depan). Belum aktif.',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_settings');
    }
};
