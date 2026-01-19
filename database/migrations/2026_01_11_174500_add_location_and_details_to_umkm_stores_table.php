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
            $table->decimal('latitude', 10, 8)->nullable()->after('address_pickup');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('contact_number')->nullable()->after('longitude');
            $table->string('banner_path')->nullable()->after('qris_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'contact_number', 'banner_path']);
        });
    }
};
