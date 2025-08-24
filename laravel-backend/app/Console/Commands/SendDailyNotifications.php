<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Meeting;
use App\Models\Settings;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class SendDailyNotifications extends Command
{
    protected $signature = 'meeting:send-daily-notifications';
    protected $description = 'Send daily meeting notifications to WhatsApp group';

    public function handle()
    {
        $settings = Settings::getInstance();
        
        if (!$settings->group_notification_enabled) {
            $this->info('Group notifications are disabled');
            return;
        }

        // Get today's meetings
        $meetings = Meeting::whereDate('date', today())
                          ->where('group_notification_enabled', true)
                          ->orderBy('start_time')
                          ->get();

        try {
            $whatsappService = new WhatsAppService();
            $whatsappService->sendGroupNotification($meetings);
            
            // Update sent timestamp
            Meeting::whereDate('date', today())
                   ->where('group_notification_enabled', true)
                   ->update(['group_notification_sent_at' => now()]);

            $this->info('Daily notifications sent successfully');
        } catch (\Exception $e) {
            $this->error('Failed to send daily notifications: ' . $e->getMessage());
        }
    }
}