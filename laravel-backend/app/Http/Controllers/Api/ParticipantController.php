<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParticipantController extends Controller
{
    public function index(Request $request)
    {
        try {
            $participants = Participant::where('is_active', true)
                ->orderBy('name')
                ->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $participants->items(),
                    'current_page' => $participants->currentPage(),
                    'last_page' => $participants->lastPage(),
                    'per_page' => $participants->perPage(),
                    'total' => $participants->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch participants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'whatsapp_number' => 'required|string|max:20|unique:participants,whatsapp_number',
            'nip' => 'required|string|size:18|unique:participants,nip',
            'seksi' => 'required|in:Intelijen Kepabeanan I,Intelijen Kepabeanan II,Intelijen Cukai,Dukungan Operasi Intelijen',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Format WhatsApp number
            $whatsappNumber = $request->whatsapp_number;
            if (!str_starts_with($whatsappNumber, '+62')) {
                $whatsappNumber = '+62' . ltrim($whatsappNumber, '0');
            }

            $participant = Participant::create([
                'name' => $request->name,
                'whatsapp_number' => $whatsappNumber,
                'nip' => $request->nip,
                'seksi' => $request->seksi,
            ]);

            return response()->json([
                'success' => true,
                'data' => $participant,
                'message' => 'Participant created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create participant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Participant $participant)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $participant
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch participant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Participant $participant)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'whatsapp_number' => 'sometimes|required|string|max:20|unique:participants,whatsapp_number,' . $participant->id,
            'nip' => 'sometimes|required|string|size:18|unique:participants,nip,' . $participant->id,
            'seksi' => 'sometimes|required|in:Intelijen Kepabeanan I,Intelijen Kepabeanan II,Intelijen Cukai,Dukungan Operasi Intelijen',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Format WhatsApp number if provided
            if (isset($data['whatsapp_number'])) {
                $whatsappNumber = $data['whatsapp_number'];
                if (!str_starts_with($whatsappNumber, '+62')) {
                    $data['whatsapp_number'] = '+62' . ltrim($whatsappNumber, '0');
                }
            }

            $participant->update($data);

            return response()->json([
                'success' => true,
                'data' => $participant,
                'message' => 'Participant updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update participant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Participant $participant)
    {
        try {
            $participant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Participant deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete participant',
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
            $participants = Participant::search($query)
                ->where('is_active', true)
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $participants
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}