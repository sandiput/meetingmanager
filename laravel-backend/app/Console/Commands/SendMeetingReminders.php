<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Meeting;
use App\Models\Settings;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class SendMeetingReminders extends Command
{
    protected $signature = 'meeting:send-reminders';
    protected $description = 'Send meeting reminders to designated attendees';

    public function handle()
    {
        $settings = Settings::getInstance();
        
        if (!$settings->individual_reminder_enabled) {
            $this->info('Individual reminders are disabled');
            return;
        }

        $reminderMinutes = $settings->individual_reminder_minutes;
        $reminderTime = now()->addMinutes($reminderMinutes);

        // Get meetings that need reminders
        $meetings = Meeting::whereDate('date', $reminderTime->toDateString())
                          ->whereTime('start_time', '<=', $reminderTime->toTimeString())
                          ->whereTime('start_time', '>', now()->toTimeString())
                          ->where('whatsapp_reminder_enabled', true)
                          ->whereNull('reminder_sent_at')
                          ->with('participant')
                          ->get();

        $whatsappService = new WhatsAppService();

        foreach ($meetings as $meeting) {
            try {
                if ($meeting->participant) {
                    $whatsappService->sendMeetingReminder($meeting, $meeting->participant);
                    $meeting->update(['reminder_sent_at' => now()]);
                    $this->info("Reminder sent for meeting: {$meeting->title}");
                } else {
                    $this->warn("No participant found for meeting: {$meeting->title}");
                }
            } catch (\Exception $e) {
                $this->error("Failed to send reminder for meeting {$meeting->title}: " . $e->getMessage());
            }
        }

        $this->info('Meeting reminders processing completed');
    }
}