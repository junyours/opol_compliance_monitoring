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
        Schema::create('penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_result_id')->constrained()->onDelete('cascade');
            $table->foreignId('establishment_id')->constrained()->onDelete('cascade');
            $table->foreignId('inspection_id')->constrained()->onDelete('cascade');
            $table->enum('penalty_type', ['first_penalty', 'second_penalty', 'third_penalty']);
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('document_path')->nullable();
            $table->string('document_name')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['inspection_result_id', 'penalty_type']);
            $table->index(['establishment_id', 'inspection_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penalties');
    }
};
