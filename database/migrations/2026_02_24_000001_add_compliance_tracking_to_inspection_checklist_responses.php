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
        Schema::table('inspection_checklist_responses', function (Blueprint $table) {
            // Compliance tracking fields
            $table->timestamp('complied_at')->nullable()->after('remarks');
            $table->text('compliance_notes')->nullable()->after('complied_at');
            
            // Indexes for better performance
            $table->index('complied_at', 'icr_complied_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_checklist_responses', function (Blueprint $table) {
            $table->dropIndex('icr_complied_at_idx');
            $table->dropColumn(['complied_at', 'compliance_notes']);
        });
    }
};
