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
//        Schema::create('promos', function (Blueprint $table) {
//            $table->id();
//            $table->string('code')->unique();
//            $table->enum('type', ['free_shipping', 'discount']); // 'free_shipping' or 'discount'
//            $table->decimal('value', 12, 2); // Max discount amount
//            $table->integer('quota')->default(0); // Max total usage
//            $table->integer('used_count')->default(0);
//            $table->decimal('min_purchase', 12, 2)->default(0);
//            $table->boolean('is_active')->default(true);
//            $table->timestamps();
//        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
