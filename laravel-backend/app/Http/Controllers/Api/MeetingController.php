<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\Participant;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MeetingController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    public function index(Request $request)
    {
        try {
            $query = Meeting::with('participant')->orderBy('date', 'desc')->orderBy('start_time', 'desc');
            
            // Apply filters
            if ($request->has('status')) {
                if ($request->status === 'upcoming') {
                    $query->upcoming();
                } elseif ($request->status === 'completed') {
                    $query->completed();
                }
            }

            if ($request->has('date_from')) {
                $query->whereDate('date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('date', '<=', $request->date_to);
            }

            $meetings = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $meetings->items(),
                    'current_page' => $meetings->currentPage(),
                    'last_page' => $meetings->lastPage(),
                    'per_page' => $meetings->perPage(),
                    'total' => $meetings->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch meetings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'location' => 'required|string|max:200',
            'meeting_link' => 'nullable|url',
            'designated_attendee' => 'required|string|exists:participants,name',
            'dress_code' => 'nullable|string|max:100',
            'invitation_reference' => 'nullable|string|max:100',
            'attendance_link' => 'nullable|url',
            'discussion_results' => 'nullable|string',
            'whatsapp_reminder_enabled' => 'boolean',
            'group_notification_enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $meeting = Meeting::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $meeting,
                'message' => 'Meeting created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Meeting $meeting)
    {
        try {
            $meeting->load('participant', 'attachments');
            
            return response()->json([
                'success' => true,
                'data' => $meeting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Meeting $meeting)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            'location' => 'sometimes|required|string|max:200',
            'meeting_link' => 'nullable|url',
            'designated_attendee' => 'sometimes|required|string|exists:participants,name',
            'dress_code' => 'nullable|string|max:100',
            'invitation_reference' => 'nullable|string|max:100',
            'attendance_link' => 'nullable|url',
            'discussion_results' => 'nullable|string',
            'whatsapp_reminder_enabled' => 'boolean',
            'group_notification_enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $meeting->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $meeting,
                'message' => 'Meeting updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Meeting $meeting)
    {
        try {
            $meeting->delete();

            return response()->json([
                'success' => true,
                'message' => 'Meeting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = $request->get('q');
            $meetings = Meeting::search($query)
                ->with('participant')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $meetings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendReminder(Meeting $meeting)
    {
        try {
            if (!$meeting->participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'No participant found for this meeting'
                ], 400);
            }

            $this->whatsappService->sendMeetingReminder($meeting, $meeting->participant);

            $meeting->update(['reminder_sent_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp reminder sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send WhatsApp reminder',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}