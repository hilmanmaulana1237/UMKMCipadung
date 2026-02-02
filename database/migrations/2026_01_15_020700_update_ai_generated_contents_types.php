<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds new type values for AI video generation
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table to change enum constraints
        // This is a workaround since SQLite doesn't support ALTER COLUMN for enums

        // 1. Create backup table
        Schema::create('ai_generated_contents_backup', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // Changed from enum to string
            $table->string('original_image_path')->nullable();
            $table->text('generated_result')->nullable();
            $table->string('status')->default('processing'); // Changed from enum to string
            $table->timestamps();
        });

        // 2. Copy data
        DB::statement('INSERT INTO ai_generated_contents_backup SELECT * FROM ai_generated_contents');

        // 3. Drop old table
        Schema::dropIfExists('ai_generated_contents');

        // 4. Rename backup to original
        Schema::rename('ai_generated_contents_backup', 'ai_generated_contents');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to enum-based constraints (not recommended, keeping string for flexibility)
    }
};
