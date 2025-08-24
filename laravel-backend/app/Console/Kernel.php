<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send daily meeting notifications at configured time
        $schedule->command('meeting:send-daily-notifications')
                 ->dailyAt('07:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Check for meeting reminders every minute
        $schedule->command('meeting:send-reminders')
                 ->everyMinute()
                 ->withoutOverlapping()
                 ->runInBackground();

        // Clean up old notifications (older than 30 days)
        $schedule->command('model:prune', ['--model' => 'App\\Models\\WhatsappNotification'])
                 ->daily()
                 ->at('02:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}