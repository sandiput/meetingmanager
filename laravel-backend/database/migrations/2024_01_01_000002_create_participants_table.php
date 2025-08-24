<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('whatsapp_number', 20)->unique();
            $table->string('nip', 18)->unique();
            $table->enum('seksi', [
                'Intelijen Kepabeanan I',
                'Intelijen Kepabeanan II',
                'Intelijen Cukai',
                'Dukungan Operasi Intelijen'
            ]);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['name']);
            $table->index(['is_active']);
            $table->index(['seksi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};