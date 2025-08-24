<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\Participant;
use App\Models\WhatsappNotification;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            $totalMeetings = Meeting::count();
            $thisWeekMeetings = Meeting::whereBetween('date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count();
            
            $notificationsSent = WhatsappNotification::where('status', 'sent')->count();
            $activeParticipants = Participant::where('is_active', true)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_meetings' => $totalMeetings,
                    'this_week_meetings' => $thisWeekMeetings,
                    'notifications_sent' => $notificationsSent,
                    'active_participants' => $activeParticipants,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function upcomingMeetings()
    {
        try {
            $meetings = Meeting::upcoming()
                ->with('participant')
                ->limit(10)
                ->get()
                ->map(function ($meeting) {
                    return [
                        'id' => $meeting->id,
                        'title' => $meeting->title,
                        'date' => $meeting->date->format('Y-m-d'),
                        'start_time' => $meeting->start_time->format('H:i'),
                        'end_time' => $meeting->end_time->format('H:i'),
                        'location' => $meeting->location,
                        'meeting_link' => $meeting->meeting_link,
                        'designated_attendee' => $meeting->designated_attendee,
                        'dress_code' => $meeting->dress_code,
                        'invitation_reference' => $meeting->invitation_reference,
                        'attendance_link' => $meeting->attendance_link,
                        'discussion_results' => $meeting->discussion_results,
                        'whatsapp_reminder_enabled' => $meeting->whatsapp_reminder_enabled,
                        'group_notification_enabled' => $meeting->group_notification_enabled,
                        'created_at' => $meeting->created_at->toISOString(),
                        'updated_at' => $meeting->updated_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $meetings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming meetings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}