<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add is_digital field to distinguish truly digital products (e-book, voucher)
 * from services (jasa) that still require courier delivery.
 * 
 * - is_physical = true, is_digital = false → Physical product (courier needed)
 * - is_physical = false, is_digital = false → Service/Jasa (courier needed for delivery)
 * - is_physical = false, is_digital = true → Digital product (no courier, auto-complete)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_digital')->default(false)->after('is_physical');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_digital');
        });
    }
};
