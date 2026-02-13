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
        Schema::create('inspection_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained()->onDelete('cascade');
            $table->foreignId('establishment_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->onDelete('set null');
            
            // Other remarks and recommendations
            $table->text('other_remarks')->nullable();
            $table->text('recommendations')->nullable();
            
            // Recommendation checkboxes
            $table->boolean('comply_lacking_permits')->default(false);
            $table->boolean('provide_lacking_facilities')->default(false);
            $table->boolean('others_recommendation')->default(false);
            
            // Status and compliance
            $table->enum('status', ['draft', 'submitted', 'reviewed', 'approved'])->default('draft');
            $table->string('compliance_status')->nullable(); // 'compliant' or 'not_compliant'
            
            // Automated recommendations (JSON)
            $table->json('automated_recommendations')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['inspection_id', 'establishment_id'], 'ir_inspection_establishment_idx');
            $table->index('staff_id', 'ir_staff_idx');
            $table->index('status', 'ir_status_idx');
            $table->unique(['inspection_id', 'establishment_id'], 'unique_inspection_establishment');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_results');
    }
};
