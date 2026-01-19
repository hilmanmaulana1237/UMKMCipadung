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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('admin_fee', 12, 2)->default(0)->after('total_amount');
            $table->enum('admin_fee_status', ['pending', 'billed', 'paid', 'void'])
                  ->default('pending')
                  ->after('admin_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['admin_fee', 'admin_fee_status']);
        });
    }
};
