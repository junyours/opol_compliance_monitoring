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
        Schema::create('inspection_checklist_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_result_id')->constrained()->onDelete('cascade');
            $table->foreignId('checklist_question_id')->constrained()->onDelete('cascade');
            
            // Response data
            $table->text('response')->nullable();
            $table->text('notes')->nullable();
            $table->text('remarks')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index(['inspection_result_id', 'checklist_question_id'], 'icr_inspection_question_idx');
            $table->unique(['inspection_result_id', 'checklist_question_id'], 'icr_inspection_question_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_checklist_responses');
    }
};
