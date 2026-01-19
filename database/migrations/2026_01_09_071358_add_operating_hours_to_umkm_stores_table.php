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
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->boolean('is_open_today')->default(false)->after('qris_path');
            $table->time('open_time')->nullable()->after('is_open_today');
            $table->time('close_time')->nullable()->after('open_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->dropColumn(['is_open_today', 'open_time', 'close_time']);
        });
    }
};
