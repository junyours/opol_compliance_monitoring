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
            $table->string('name');
            $table->string('proponent');
            $table->string('address');
            $table->string('contact_number');
            $table->string('email')->unique();
            $table->foreignId('type_of_business_id')->constrained('business_types');
            $table->string('Barangay');
            $table->integer('total_capacity');
            $table->integer('number_of_rooms');
            $table->integer('number_of_employees');
             $table->enum('status', ['active', 'inactive', 'terminated'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('establishments');
    }
};
