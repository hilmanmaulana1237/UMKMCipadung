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
            $table->string('instagram')->nullable()->after('business_hours');
            $table->string('email')->nullable()->after('instagram');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_landing_pages', function (Blueprint $table) {
            $table->dropColumn(['instagram', 'email']);
        });
    }
};
