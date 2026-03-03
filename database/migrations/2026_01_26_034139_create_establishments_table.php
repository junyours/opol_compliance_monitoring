<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('establishments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('proponent')->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable()->unique();
            $table->foreignId('type_of_business_id')->nullable()->constrained('business_types');
            $table->string('Barangay')->nullable();
            $table->integer('total_capacity')->nullable();
            $table->integer('number_of_rooms')->nullable();
            $table->integer('number_of_employees')->nullable();
             $table->enum('status', ['active', 'inactive', 'terminated'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('establishments');
    }
};
