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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['buyer', 'umkm', 'courier', 'affiliator', 'admin'])->default('buyer')->after('password');
            $table->string('wa_number')->nullable()->after('role');
            $table->string('avatar_path')->nullable()->after('wa_number');
            $table->decimal('wallet_balance', 15, 2)->default(0)->after('avatar_path');
            $table->string('affiliate_code')->unique()->nullable()->after('wallet_balance');
            $table->boolean('is_courier_active')->default(false)->after('affiliate_code');
            $table->decimal('current_lat', 10, 8)->nullable()->after('is_courier_active');
            $table->decimal('current_lng', 11, 8)->nullable()->after('current_lat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'wa_number',
                'avatar_path',
                'wallet_balance',
                'affiliate_code',
                'is_courier_active',
                'current_lat',
                'current_lng',
            ]);
        });
    }
};
