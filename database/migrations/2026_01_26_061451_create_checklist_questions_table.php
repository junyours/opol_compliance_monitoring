<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('inspection_categories')->onDelete('cascade');
            $table->string('question');
            $table->string('type')->default('text');
            $table->json('options')->nullable();
            $table->json('conditional_logic')->nullable();
            $table->boolean('is_conditional')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_questions');
    }
};
