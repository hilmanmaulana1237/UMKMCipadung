<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Change courier_status from enum to string to allow 'not_required' for digital/jasa orders.
 * SQLite doesn't support ALTER COLUMN for enums, so we use a workaround.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite: Create new column, copy data, drop old, rename new
        if (config('database.default') === 'sqlite') {
            // Add new column
            Schema::table('orders', function (Blueprint $table) {
                $table->string('courier_status_new')->default('idle')->after('courier_status');
            });

            // Copy data
            DB::statement('UPDATE orders SET courier_status_new = courier_status');

            // Drop old column and rename new one
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('courier_status');
            });

            Schema::table('orders', function (Blueprint $table) {
                $table->renameColumn('courier_status_new', 'courier_status');
            });
        } else {
            // For MySQL/PostgreSQL: Just modify the column type
            Schema::table('orders', function (Blueprint $table) {
                $table->string('courier_status')->default('idle')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No safe way to revert - leave as string column
    }
};
