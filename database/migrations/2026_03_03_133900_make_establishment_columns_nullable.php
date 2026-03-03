<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('proponent')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->string('contact_number')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->foreignId('type_of_business_id')->nullable()->change();
            $table->string('Barangay')->nullable()->change();
            $table->integer('total_capacity')->nullable()->change();
            $table->integer('number_of_rooms')->nullable()->change();
            $table->integer('number_of_employees')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
            $table->string('proponent')->nullable(false)->change();
            $table->string('address')->nullable(false)->change();
            $table->string('contact_number')->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
            $table->foreignId('type_of_business_id')->nullable(false)->change();
            $table->string('Barangay')->nullable(false)->change();
            $table->integer('total_capacity')->nullable(false)->change();
            $table->integer('number_of_rooms')->nullable(false)->change();
            $table->integer('number_of_employees')->nullable(false)->change();
        });
    }
};
