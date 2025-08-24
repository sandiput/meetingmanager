<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path', 500);
            $table->unsignedInteger('file_size');
            $table->string('mime_type', 100);
            $table->enum('attachment_type', ['document', 'photo'])->default('document');
            $table->timestamps();

            $table->index(['meeting_id']);
            $table->index(['attachment_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_attachments');
    }
};