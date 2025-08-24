<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->onDelete('cascade');
            $table->enum('notification_type', ['individual_reminder', 'group_notification']);
            $table->timestamp('scheduled_at');
            $table->enum('status', ['pending', 'processed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index(['meeting_id']);
            $table->index(['scheduled_at']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_notifications');
    }
};