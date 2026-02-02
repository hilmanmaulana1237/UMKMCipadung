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
            // JSON array of day names: ["monday","tuesday","wednesday",...]
            $table->json('operating_days')->nullable()->after('close_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->dropColumn('operating_days');
        });
    }
};
