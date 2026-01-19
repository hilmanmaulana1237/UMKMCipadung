<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umkm_landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_store_id')->constrained()->onDelete('cascade');
            $table->string('slug')->unique(); // URL: /lp/slug
            $table->string('template'); // tema1, tema2, tema3, tema4, tema5
            $table->string('hero_image_path')->nullable();
            $table->string('tagline')->nullable(); // AI-generated or custom
            $table->text('description')->nullable(); // AI-generated store description
            $table->json('products')->nullable(); // Array of selected product IDs
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umkm_landing_pages');
    }
};
