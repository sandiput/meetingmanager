import axios from 'axios';
import { 
  Meeting, 
  Participant, 
  Settings, 
  DashboardStats, 
  ApiResponse, 
  PaginatedResponse,
  CreateMeetingForm,
  CreateParticipantForm,
  UpdateSettingsForm,
  ReviewStats,
  TopParticipant,
  SeksiStats,
  MeetingTrend,
} from '../types';

import { API_CONFIG } from '../utils/constants';

// Dummy data for development
const DUMMY_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'Ahmad Rizki Pratama',
    whatsapp_number: '+6281234567890',
    nip: '198501012010011001',
    seksi: 'Intelijen Kepabeanan I',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    whatsapp_number: '+6281234567891',
    nip: '198502022010012002',
    seksi: 'Intelijen Kepabeanan II',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    whatsapp_number: '+6281234567892',
    nip: '198503032010013003',
    seksi: 'Intelijen Cukai',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    name: 'Diana Putri',
    whatsapp_number: '+6281234567893',
    nip: '198504042010014004',
    seksi: 'Dukungan Operasi Intelijen',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    name: 'Eko Wijaya',
    whatsapp_number: '+6281234567894',
    nip: '198505052010015005',
    seksi: 'Intelijen Kepabeanan I',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '6',
    name: 'Fitri Handayani',
    whatsapp_number: '+6281234567895',
    nip: '198506062010016006',
    seksi: 'Intelijen Kepabeanan II',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '7',
    name: 'Gunawan Setiawan',
    whatsapp_number: '+6281234567896',
    nip: '198507072010017007',
    seksi: 'Intelijen Cukai',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '8',
    name: 'Hesti Ramadhani',
    whatsapp_number: '+6281234567897',
    nip: '198508082010018008',
    seksi: 'Dukungan Operasi Intelijen',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
];

const DUMMY_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Rapat Koordinasi Bulanan',
    date: '2025-01-25',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Ruang Rapat Utama',
    meeting_link: 'https://zoom.us/j/123456789',
    designated_attendees: ['Ahmad Rizki Pratama', 'Siti Nurhaliza', 'Budi Santoso'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-001',
    attendance_link: 'https://forms.google.com/attendance-001',
    discussion_results: 'Pembahasan mengenai strategi intelijen untuk kuartal pertama 2025. Disepakati peningkatan koordinasi antar seksi dan implementasi sistem monitoring baru.',
    status: 'confirmed',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-20T08:00:00Z',
    updated_at: '2025-01-20T08:00:00Z',
  },
  {
    id: '2',
    title: 'Briefing Intelijen Mingguan',
    date: '2025-01-26',
    start_time: '08:00',
    end_time: '09:30',
    location: 'Ruang Briefing',
    designated_attendees: ['Diana Putri', 'Eko Wijaya'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-002',
    discussion_results: '',
    status: 'pending',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-21T08:00:00Z',
    updated_at: '2025-01-21T08:00:00Z',
  },
  {
    id: '3',
    title: 'Workshop Analisis Data Intelijen',
    date: '2025-01-27',
    start_time: '13:00',
    end_time: '16:00',
    location: 'Lab Komputer',
    meeting_link: 'https://teams.microsoft.com/workshop-123',
    designated_attendees: ['Fitri Handayani', 'Gunawan Setiawan', 'Hesti Ramadhani', 'Ahmad Rizki Pratama'],
    dress_code: 'Casual',
    invitation_reference: 'REF-2025-003',
    attendance_link: 'https://forms.google.com/attendance-003',
    discussion_results: '',
    status: 'confirmed',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: false,
    created_at: '2025-01-22T08:00:00Z',
    updated_at: '2025-01-22T08:00:00Z',
  },
  {
    id: '4',
    title: 'Evaluasi Kinerja Triwulan',
    date: '2025-01-28',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Ruang Rapat Direktur',
    designated_attendees: ['Siti Nurhaliza', 'Budi Santoso'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-004',
    discussion_results: '',
    status: 'pending',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-23T08:00:00Z',
    updated_at: '2025-01-23T08:00:00Z',
  },
  {
    id: '5',
    title: 'Sosialisasi Kebijakan Baru',
    date: '2025-01-29',
    start_time: '14:00',
    end_time: '15:30',
    location: 'Aula Besar',
    designated_attendees: ['Diana Putri', 'Eko Wijaya', 'Fitri Handayani'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-005',
    attendance_link: 'https://forms.google.com/attendance-005',
    discussion_results: '',
    status: 'confirmed',
    whatsapp_reminder_enabled: false,
    group_notification_enabled: true,
    created_at: '2025-01-24T08:00:00Z',
    updated_at: '2025-01-24T08:00:00Z',
  },
];

const DUMMY_SETTINGS: Settings = {
  id: '1',
  group_notification_time: '07:00',
  group_notification_enabled: true,
  individual_reminder_minutes: 30,
  individual_reminder_enabled: true,
  whatsapp_connected: true,
  updated_at: '2025-01-24T08:00:00Z',
};

const DUMMY_DASHBOARD_STATS: DashboardStats = {
  total_meetings: 5,
  this_week_meetings: 3,
  notifications_sent: 12,
  active_participants: 8,
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://api.local/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // No authentication required - remove token logic
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Ensure unified API response shape { success, data }
function normalizeApiResponse<T>(body: any): ApiResponse<T> {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body as ApiResponse<T>;
  }
  // When backend returns raw array/object/primitive, wrap it
  return { success: true, data: body as T };
}

// Mock API functions that return dummy data
const mockApiCall = <T>(data: T, delay = 500): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delay);
  });
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return mockApiCall(DUMMY_DASHBOARD_STATS);
  },
    
  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    const upcomingMeetings = DUMMY_MEETINGS.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const today = new Date();
      return meetingDate >= today;
    });
    return mockApiCall(upcomingMeetings);
  },
};

// Meetings API
export const meetingsApi = {
  getUpcoming: async (): Promise<ApiResponse<Meeting[]>> => {
    const upcomingMeetings = DUMMY_MEETINGS.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const today = new Date();
      return meetingDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return mockApiCall(upcomingMeetings);
  },
    
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    const paginatedData: PaginatedResponse<Meeting> = {
      data: DUMMY_MEETINGS,
      current_page: page,
      last_page: 1,
      per_page: 10,
      total: DUMMY_MEETINGS.length,
    };
    return mockApiCall(paginatedData);
  },
    
  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    const meeting = DUMMY_MEETINGS.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');
    return mockApiCall(meeting);
  },
    
  search: async (query: string): Promise<ApiResponse<Meeting[]>> => {
    const results = DUMMY_MEETINGS.filter(meeting =>
      meeting.title.toLowerCase().includes(query.toLowerCase()) ||
      meeting.location.toLowerCase().includes(query.toLowerCase()) ||
      meeting.designated_attendees.some(attendee => 
        attendee.toLowerCase().includes(query.toLowerCase())
      )
    );
    return mockApiCall(results);
  },
    
  create: async (data: CreateMeetingForm): Promise<ApiResponse<Meeting>> => {
    const newMeeting: Meeting = {
      id: (DUMMY_MEETINGS.length + 1).toString(),
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DUMMY_MEETINGS.push(newMeeting);
    return mockApiCall(newMeeting);
  },
    
  update: async (id: string, data: Partial<CreateMeetingForm>): Promise<ApiResponse<Meeting>> => {
    const meetingIndex = DUMMY_MEETINGS.findIndex(m => m.id === id);
    if (meetingIndex === -1) throw new Error('Meeting not found');
    
    DUMMY_MEETINGS[meetingIndex] = {
      ...DUMMY_MEETINGS[meetingIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockApiCall(DUMMY_MEETINGS[meetingIndex]);
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const meetingIndex = DUMMY_MEETINGS.findIndex(m => m.id === id);
    if (meetingIndex === -1) throw new Error('Meeting not found');
    
    DUMMY_MEETINGS.splice(meetingIndex, 1);
    return mockApiCall(undefined as any);
  },
    
  sendWhatsAppReminder: async (id: string): Promise<ApiResponse<void>> => {
    return mockApiCall(undefined as any);
  },
    
  // Meeting attendees management
  addAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    return mockApiCall(undefined as any);
  },
    
  removeAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    return mockApiCall(undefined as any);
  },
    
  syncAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    return mockApiCall(undefined as any);
  },
};

// Participants API
export const participantsApi = {
  getAll: async (page = 1): Promise<ApiResponse<PaginatedResponse<Participant>>> => {
    const paginatedData: PaginatedResponse<Participant> = {
      data: DUMMY_PARTICIPANTS,
      current_page: page,
      last_page: 1,
      per_page: 10,
      total: DUMMY_PARTICIPANTS.length,
    };
    return mockApiCall(paginatedData);
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    const newParticipant: Participant = {
      id: (DUMMY_PARTICIPANTS.length + 1).toString(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DUMMY_PARTICIPANTS.push(newParticipant);
    return mockApiCall(newParticipant);
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    const participantIndex = DUMMY_PARTICIPANTS.findIndex(p => p.id === id);
    if (participantIndex === -1) throw new Error('Participant not found');
    
    DUMMY_PARTICIPANTS[participantIndex] = {
      ...DUMMY_PARTICIPANTS[participantIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockApiCall(DUMMY_PARTICIPANTS[participantIndex]);
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const participantIndex = DUMMY_PARTICIPANTS.findIndex(p => p.id === id);
    if (participantIndex === -1) throw new Error('Participant not found');
    
    DUMMY_PARTICIPANTS.splice(participantIndex, 1);
    return mockApiCall(undefined as any);
  },
    
  search: async (query: string): Promise<ApiResponse<Participant[]>> => {
    const results = DUMMY_PARTICIPANTS.filter(participant =>
      participant.name.toLowerCase().includes(query.toLowerCase()) ||
      participant.seksi.toLowerCase().includes(query.toLowerCase())
    );
    return mockApiCall(results);
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    return mockApiCall(DUMMY_SETTINGS);
  },
    
  update: async (data: UpdateSettingsForm): Promise<ApiResponse<Settings>> => {
    const updatedSettings = {
      ...DUMMY_SETTINGS,
      ...data,
      updated_at: new Date().toISOString(),
    };
    Object.assign(DUMMY_SETTINGS, updatedSettings);
    return mockApiCall(updatedSettings);
  },
    
  testWhatsAppConnection: async (): Promise<ApiResponse<{ connected: boolean }>> => {
    return mockApiCall({ connected: true });
  },
    
  previewGroupMessage: async (date?: string): Promise<ApiResponse<{ message: string; meetings: Meeting[] }>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const meetingsForDate = DUMMY_MEETINGS.filter(meeting => meeting.date === targetDate);
    
    let message = `🗓️ *Jadwal Meeting Hari Ini*\n📅 ${new Date(targetDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    
    if (meetingsForDate.length === 0) {
      message += '✅ Tidak ada meeting yang dijadwalkan hari ini.\n\n';
    } else {
      meetingsForDate.forEach((meeting, index) => {
        message += `${index + 1}. *${meeting.title}*\n`;
        message += `   ⏰ ${meeting.start_time} - ${meeting.end_time}\n`;
        message += `   📍 ${meeting.location}\n`;
        message += `   👥 ${meeting.designated_attendees.join(', ')}\n`;
        if (meeting.dress_code) {
          message += `   👔 ${meeting.dress_code}\n`;
        }
        message += '\n';
      });
    }
    
    message += '📱 Pesan otomatis dari Meeting Manager\n🤖 Subdirektorat Intelijen';
    
    return mockApiCall({ message, meetings: meetingsForDate });
  },
    
  sendTestGroupMessage: async (date?: string): Promise<ApiResponse<void>> => {
    return mockApiCall(undefined as any);
  },
};

// Review API
export const reviewApi = {
  getStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<ReviewStats>> => {
    const stats: ReviewStats = {
      total_meetings: DUMMY_MEETINGS.length,
      completed_meetings: DUMMY_MEETINGS.filter(m => m.status === 'completed').length,
      attendance_rate: 85.5,
      total_attendees: DUMMY_PARTICIPANTS.length,
      avg_duration: 2.5,
      whatsapp_notifications: 24,
      ontime_rate: 92.3,
      whatsapp_response_rate: 78.9,
      completion_rate: 96.2,
      avg_participants: 2.8,
    };
    return mockApiCall(stats);
  },

  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<TopParticipant[]>> => {
    const topParticipants: TopParticipant[] = DUMMY_PARTICIPANTS.slice(0, 10).map((participant, index) => ({
      id: participant.id,
      name: participant.name,
      seksi: participant.seksi,
      meeting_count: Math.floor(Math.random() * 10) + 1,
      attendance_rate: Math.floor(Math.random() * 30) + 70,
    })).sort((a, b) => b.meeting_count - a.meeting_count);
    
    return mockApiCall(topParticipants);
  },

  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<SeksiStats[]>> => {
    const seksiStats: SeksiStats[] = [
      {
        seksi: 'Intelijen Kepabeanan I',
        meeting_count: 8,
        participant_count: 3,
        attendance_rate: 88.5,
      },
      {
        seksi: 'Intelijen Kepabeanan II',
        meeting_count: 6,
        participant_count: 2,
        attendance_rate: 92.1,
      },
      {
        seksi: 'Intelijen Cukai',
        meeting_count: 5,
        participant_count: 2,
        attendance_rate: 85.7,
      },
      {
        seksi: 'Dukungan Operasi Intelijen',
        meeting_count: 4,
        participant_count: 2,
        attendance_rate: 90.3,
      },
    ];
    return mockApiCall(seksiStats);
  },

  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<MeetingTrend[]>> => {
    const trends: MeetingTrend[] = [
      { period: 'Week 1', count: 3, completion_rate: 95.2 },
      { period: 'Week 2', count: 5, completion_rate: 88.7 },
      { period: 'Week 3', count: 4, completion_rate: 92.1 },
      { period: 'Week 4', count: 6, completion_rate: 89.5 },
    ];
    return mockApiCall(trends);
  },
};