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
        Schema::table('umkm_landing_pages', function (Blueprint $table) {
            $table->string('feature1_title')->nullable()->after('description');
            $table->text('feature1_desc')->nullable()->after('feature1_title');
            $table->string('feature2_title')->nullable()->after('feature1_desc');
            $table->text('feature2_desc')->nullable()->after('feature2_title');
            $table->string('feature3_title')->nullable()->after('feature2_desc');
            $table->text('feature3_desc')->nullable()->after('feature3_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_landing_pages', function (Blueprint $table) {
            $table->dropColumn([
                'feature1_title', 'feature1_desc',
                'feature2_title', 'feature2_desc',
                'feature3_title', 'feature3_desc',
            ]);
        });
    }
};
