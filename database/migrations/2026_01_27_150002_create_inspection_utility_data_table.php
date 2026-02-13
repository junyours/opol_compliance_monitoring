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
        Schema::create('inspection_utility_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_result_id')->constrained()->onDelete('cascade');
            $table->foreignId('utility_id')->constrained()->onDelete('cascade');
            
            // Utility data stored as JSON
            $table->json('data')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index(['inspection_result_id', 'utility_id'], 'iud_inspection_utility_idx');
            $table->unique(['inspection_result_id', 'utility_id'], 'iud_inspection_utility_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_utility_data');
    }
};
