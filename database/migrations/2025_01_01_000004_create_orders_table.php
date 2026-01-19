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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('umkm_store_id')->constrained()->onDelete('cascade');
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('promo_code_used')->nullable();
            $table->enum('status', [
                'pending_payment',
                'waiting_verification',
                'processing',
                'ready_to_ship',
                'on_delivery',
                'completed',
                'cancelled'
            ])->default('pending_payment');
            $table->enum('courier_status', [
                'idle',
                'finding_driver',
                'driver_assigned',
                'pickup_otw',
                'delivery_otw',
                'delivered'
            ])->default('idle');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('courier_fee', 12, 2)->default(0);
            $table->string('payment_proof_path')->nullable();
            $table->text('shipping_address');
            $table->decimal('shipping_lat', 10, 8)->nullable();
            $table->decimal('shipping_lng', 11, 8)->nullable();
            $table->timestamps();
        });

        // Order items table for multiple products per order
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('price', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
