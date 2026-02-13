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
        Schema::create('conditional_field_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_result_id')->constrained()->onDelete('cascade');
            $table->foreignId('checklist_question_id')->constrained()->onDelete('cascade');
            $table->string('field_name');
            $table->text('field_value')->nullable();
            $table->timestamps();
            
            $table->index(['inspection_result_id', 'checklist_question_id'], 'cfr_inspection_question_idx');
            $table->index(['inspection_result_id', 'field_name'], 'cfr_inspection_field_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conditional_field_responses');
    }
};
