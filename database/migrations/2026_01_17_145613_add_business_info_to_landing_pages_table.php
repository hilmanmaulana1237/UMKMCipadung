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
        Schema::table('umkm_landing_pages', function (Blueprint $table) {
            $table->string('business_phone', 20)->nullable()->after('description');
            $table->text('business_address')->nullable()->after('business_phone');
            $table->string('business_hours', 50)->nullable()->after('business_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_landing_pages', function (Blueprint $table) {
            $table->dropColumn(['business_phone', 'business_address', 'business_hours']);
        });
    }
};
