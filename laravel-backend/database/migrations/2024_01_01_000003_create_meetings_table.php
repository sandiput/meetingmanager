<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location', 200);
            $table->text('meeting_link')->nullable();
            $table->string('designated_attendee', 100);
            $table->string('dress_code', 100)->nullable();
            $table->string('invitation_reference', 100)->nullable();
            $table->text('attendance_link')->nullable();
            $table->text('discussion_results')->nullable();
            $table->boolean('whatsapp_reminder_enabled')->default(true);
            $table->boolean('group_notification_enabled')->default(true);
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamp('group_notification_sent_at')->nullable();
            $table->timestamps();

            $table->index(['date']);
            $table->index(['designated_attendee']);
            $table->index(['date', 'start_time']);
            $table->fullText(['title', 'location', 'discussion_results']);

            $table->foreign('designated_attendee')
                  ->references('name')
                  ->on('participants')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};