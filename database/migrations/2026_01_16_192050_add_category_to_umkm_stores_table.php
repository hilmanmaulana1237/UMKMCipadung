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
            $table->enum('category', ['kuliner', 'kriya', 'jasa'])->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_stores', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
