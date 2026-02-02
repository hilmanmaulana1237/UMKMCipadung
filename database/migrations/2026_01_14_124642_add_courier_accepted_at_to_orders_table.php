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
            // Timestamp when courier accepted the order (for timeout tracking)
            $table->timestamp('courier_accepted_at')->nullable()->after('courier_status');
            // Last activity timestamp (updated on pickup/delivery status changes)
            $table->timestamp('courier_last_activity_at')->nullable()->after('courier_accepted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['courier_accepted_at', 'courier_last_activity_at']);
        });
    }
};
