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
            $table->decimal('admin_fee', 10, 2)->default(0)->after('operating_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->dropColumn('admin_fee');
        });
    }
};
