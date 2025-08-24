<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('recipient_type', ['individual', 'group']);
            $table->string('recipient_number', 20)->nullable();
            $table->text('message_content');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->string('whatsapp_message_id', 100)->nullable();
            $table->timestamps();

            $table->index(['meeting_id']);
            $table->index(['status']);
            $table->index(['recipient_type']);
            $table->index(['sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_notifications');
    }
};