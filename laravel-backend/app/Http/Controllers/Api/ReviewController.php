<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\Participant;
use App\Models\WhatsappNotification;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function stats(Request $request)
    {
        try {
            $period = $request->get('period', 'monthly');
            $dateRange = $this->getDateRange($period);

            $totalMeetings = Meeting::whereBetween('date', $dateRange)->count();
            $completedMeetings = Meeting::whereBetween('date', $dateRange)
                ->whereRaw('CONCAT(date, " ", end_time) < ?', [now()])
                ->count();

            $attendanceRate = $totalMeetings > 0 ? round(($completedMeetings / $totalMeetings) * 100, 1) : 0;
            $totalAttendees = Participant::where('is_active', true)->count();
            
            $avgDuration = Meeting::whereBetween('date', $dateRange)
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as avg_minutes')
                ->value('avg_minutes');
            $avgDuration = $avgDuration ? round($avgDuration / 60, 1) : 0;

            $whatsappNotifications = WhatsappNotification::where('status', 'sent')
                ->whereBetween('created_at', $dateRange)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_meetings' => $totalMeetings,
                    'completed_meetings' => $completedMeetings,
                    'attendance_rate' => $attendanceRate,
                    'total_attendees' => $totalAttendees,
                    'avg_duration' => $avgDuration,
                    'whatsapp_notifications' => $whatsappNotifications,
                    'ontime_rate' => 85.5, // Mock data
                    'whatsapp_response_rate' => 92.3, // Mock data
                    'completion_rate' => $attendanceRate,
                    'avg_participants' => 1.2, // Mock data
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch review stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function topParticipants(Request $request)
    {
        try {
            $period = $request->get('period', 'monthly');
            $dateRange = $this->getDateRange($period);

            $topParticipants = Participant::select('participants.*')
                ->selectRaw('COUNT(meetings.id) as meeting_count')
                ->leftJoin('meetings', 'participants.name', '=', 'meetings.designated_attendee')
                ->whereBetween('meetings.date', $dateRange)
                ->where('participants.is_active', true)
                ->groupBy('participants.id')
                ->orderByDesc('meeting_count')
                ->limit(10)
                ->get()
                ->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'name' => $participant->name,
                        'seksi' => $participant->seksi,
                        'meeting_count' => $participant->meeting_count,
                        'attendance_rate' => 95.0, // Mock data
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $topParticipants
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top participants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function seksiStats(Request $request)
    {
        try {
            $period = $request->get('period', 'monthly');
            $dateRange = $this->getDateRange($period);

            $seksiStats = DB::table('participants')
                ->select('seksi')
                ->selectRaw('COUNT(DISTINCT participants.id) as participant_count')
                ->selectRaw('COUNT(meetings.id) as meeting_count')
                ->leftJoin('meetings', 'participants.name', '=', 'meetings.designated_attendee')
                ->whereBetween('meetings.date', $dateRange)
                ->where('participants.is_active', true)
                ->groupBy('seksi')
                ->get()
                ->map(function ($item) {
                    return [
                        'seksi' => $item->seksi,
                        'meeting_count' => $item->meeting_count,
                        'participant_count' => $item->participant_count,
                        'attendance_rate' => 90.0, // Mock data
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $seksiStats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch seksi stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function meetingTrends(Request $request)
    {
        try {
            $period = $request->get('period', 'monthly');
            
            $trends = [];
            $now = Carbon::now();

            if ($period === 'weekly') {
                for ($i = 6; $i >= 0; $i--) {
                    $date = $now->copy()->subDays($i);
                    $count = Meeting::whereDate('date', $date)->count();
                    $trends[] = [
                        'period' => $date->format('D'),
                        'count' => $count,
                        'completion_rate' => $count > 0 ? 85.0 : 0,
                    ];
                }
            } elseif ($period === 'monthly') {
                for ($i = 11; $i >= 0; $i--) {
                    $date = $now->copy()->subMonths($i);
                    $count = Meeting::whereYear('date', $date->year)
                        ->whereMonth('date', $date->month)
                        ->count();
                    $trends[] = [
                        'period' => $date->format('M'),
                        'count' => $count,
                        'completion_rate' => $count > 0 ? 85.0 : 0,
                    ];
                }
            } else {
                for ($i = 4; $i >= 0; $i--) {
                    $date = $now->copy()->subYears($i);
                    $count = Meeting::whereYear('date', $date->year)->count();
                    $trends[] = [
                        'period' => $date->format('Y'),
                        'count' => $count,
                        'completion_rate' => $count > 0 ? 85.0 : 0,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $trends
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch meeting trends',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getDateRange($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'weekly':
                return [$now->startOfWeek(), $now->endOfWeek()];
            case 'monthly':
                return [$now->startOfMonth(), $now->endOfMonth()];
            case 'yearly':
                return [$now->startOfYear(), $now->endOfYear()];
            default:
                return [$now->startOfMonth(), $now->endOfMonth()];
        }
    }
}