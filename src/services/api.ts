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
    title: 'Rapat Koordinasi Mingguan Tim Intelijen',
    date: '2025-01-27',
    start_time: '08:30',
    end_time: '10:00',
    location: 'Ruang Rapat Lantai 3',
    meeting_link: 'https://zoom.us/j/987654321',
    designated_attendees: ['Ahmad Rizki Pratama', 'Siti Nurhaliza'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-007',
    attendance_link: 'https://forms.google.com/attendance-007',
    discussion_results: 'Pembahasan strategi operasional minggu ini. Disepakati fokus pada peningkatan koordinasi antar seksi dan monitoring aktivitas mencurigakan di wilayah perbatasan.',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-25T08:00:00Z',
    updated_at: '2025-01-25T08:00:00Z',
  },
  {
    id: '2',
    title: 'Workshop Analisis Data Intelijen Lanjutan',
    date: '2025-01-28',
    start_time: '13:00',
    end_time: '16:30',
    location: 'Lab Komputer Gedung B',
    meeting_link: 'https://teams.microsoft.com/workshop-456',
    designated_attendees: ['Budi Santoso', 'Diana Putri', 'Eko Wijaya', 'Fitri Handayani'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-008',
    attendance_link: 'https://forms.google.com/attendance-008',
    discussion_results: '',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: false,
    created_at: '2025-01-25T10:30:00Z',
    updated_at: '2025-01-25T10:30:00Z',
  },
  {
    id: '3',
    title: 'Evaluasi Kinerja Triwulan I-2025',
    date: '2025-01-29',
    start_time: '09:00',
    end_time: '12:00',
    location: 'Ruang Rapat Direktur',
    designated_attendees: ['Gunawan Setiawan', 'Hesti Ramadhani'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-009',
    attendance_link: 'https://forms.google.com/attendance-009',
    discussion_results: '',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-25T14:15:00Z',
    updated_at: '2025-01-25T14:15:00Z',
  },
  {
    id: '4',
    title: 'Sosialisasi Kebijakan Keamanan Baru',
    date: '2025-01-30',
    start_time: '10:00',
    end_time: '11:30',
    location: 'Aula Besar',
    designated_attendees: ['Ahmad Rizki Pratama', 'Diana Putri', 'Eko Wijaya'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-010',
    attendance_link: 'https://forms.google.com/attendance-010',
    discussion_results: '',
    whatsapp_reminder_enabled: false,
    group_notification_enabled: true,
    created_at: '2025-01-25T16:45:00Z',
    updated_at: '2025-01-25T16:45:00Z',
  },
  {
    id: '5',
    title: 'Briefing Operasi Khusus Februari',
    date: '2025-01-31',
    start_time: '14:00',
    end_time: '16:00',
    location: 'Ruang Briefing Khusus',
    designated_attendees: ['Siti Nurhaliza', 'Budi Santoso', 'Gunawan Setiawan'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-011',
    attendance_link: 'https://forms.google.com/attendance-011',
    discussion_results: '',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2025-01-26T09:20:00Z',
    updated_at: '2025-01-26T09:20:00Z',
  },
  {
    id: '6',
    title: 'Rapat Koordinasi Bulanan Januari',
    date: '2025-01-15',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Ruang Rapat Utama',
    meeting_link: 'https://zoom.us/j/123456789',
    designated_attendees: ['Fitri Handayani', 'Hesti Ramadhani'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-001',
    attendance_link: 'https://forms.google.com/attendance-001',
    discussion_results: 'Pembahasan target operasional bulan Januari telah tercapai 95%. Disepakati peningkatan koordinasi dengan unit terkait dan evaluasi sistem pelaporan.',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    reminder_sent_at: '2025-01-15T08:30:00Z',
    group_notification_sent_at: '2025-01-15T07:00:00Z',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-15T11:30:00Z',
  },
  {
    id: '7',
    title: 'Training Sistem Informasi Baru',
    date: '2025-01-18',
    start_time: '08:00',
    end_time: '12:00',
    location: 'Lab Training',
    designated_attendees: ['Ahmad Rizki Pratama', 'Budi Santoso', 'Diana Putri', 'Eko Wijaya'],
    dress_code: 'Casual',
    invitation_reference: 'REF-2025-002',
    attendance_link: 'https://forms.google.com/attendance-002',
    discussion_results: 'Pelatihan sistem informasi baru berhasil dilaksanakan. Semua peserta telah memahami fitur dasar dan siap mengimplementasikan dalam operasional harian.',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: false,
    reminder_sent_at: '2025-01-18T07:30:00Z',
    created_at: '2025-01-12T10:00:00Z',
    updated_at: '2025-01-18T12:30:00Z',
  },
  {
    id: '8',
    title: 'Review Keamanan Sistem IT',
    date: '2025-01-20',
    start_time: '13:30',
    end_time: '15:00',
    location: 'Ruang Server',
    designated_attendees: ['Gunawan Setiawan', 'Hesti Ramadhani', 'Fitri Handayani'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-003',
    discussion_results: 'Audit keamanan sistem menunjukkan tingkat keamanan baik. Direkomendasikan update patch keamanan dan peningkatan monitoring sistem.',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    reminder_sent_at: '2025-01-20T13:00:00Z',
    group_notification_sent_at: '2025-01-20T07:00:00Z',
    created_at: '2025-01-15T14:00:00Z',
    updated_at: '2025-01-20T15:30:00Z',
  },
  {
    id: '9',
    title: 'Briefing Keamanan Mingguan',
    date: '2025-01-22',
    start_time: '07:30',
    end_time: '08:30',
    location: 'Ruang Briefing',
    designated_attendees: ['Siti Nurhaliza', 'Ahmad Rizki Pratama'],
    dress_code: 'Formal',
    invitation_reference: 'REF-2025-004',
    attendance_link: 'https://forms.google.com/attendance-004',
    discussion_results: 'Update situasi keamanan terkini. Tidak ada ancaman signifikan. Tim siap untuk operasional minggu ini.',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    reminder_sent_at: '2025-01-22T07:00:00Z',
    group_notification_sent_at: '2025-01-22T07:00:00Z',
    created_at: '2025-01-20T16:00:00Z',
    updated_at: '2025-01-22T09:00:00Z',
  },
  {
    id: '10',
    title: 'Evaluasi Prosedur Operasional',
    date: '2025-01-24',
    start_time: '10:00',
    end_time: '12:30',
    location: 'Ruang Rapat Kecil',
    designated_attendees: ['Budi Santoso', 'Diana Putri'],
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2025-005',
    attendance_link: 'https://forms.google.com/attendance-005',
    discussion_results: 'Evaluasi SOP operasional menunjukkan efektivitas 88%. Diusulkan penyederhanaan beberapa prosedur untuk meningkatkan efisiensi.',
    whatsapp_reminder_enabled: false,
    group_notification_enabled: true,
    group_notification_sent_at: '2025-01-24T07:00:00Z',
    created_at: '2025-01-22T11:00:00Z',
    updated_at: '2025-01-24T13:00:00Z',
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
  total_meetings: DUMMY_MEETINGS.length,
  this_week_meetings: DUMMY_MEETINGS.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return meetingDate >= weekStart && meetingDate <= weekEnd;
  }).length,
  notifications_sent: DUMMY_MEETINGS.filter(m => m.reminder_sent_at || m.group_notification_sent_at).length * 2,
  active_participants: DUMMY_PARTICIPANTS.filter(p => p.is_active).length,
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
    const completedMeetings = DUMMY_MEETINGS.filter(m => m.status === 'completed');
    const totalAttendees = DUMMY_MEETINGS.reduce((sum, meeting) => sum + (meeting.designated_attendees?.length || 0), 0);
    const notificationsSent = DUMMY_MEETINGS.filter(m => m.reminder_sent_at || m.group_notification_sent_at).length;
    
    const stats: ReviewStats = {
      total_meetings: DUMMY_MEETINGS.length,
      completed_meetings: completedMeetings.length,
      attendance_rate: 92.5,
      total_attendees: totalAttendees,
      avg_duration: 2.8,
      whatsapp_notifications: notificationsSent * 2, // Individual + group notifications
      ontime_rate: 94.2,
      whatsapp_response_rate: 85.7,
      completion_rate: (completedMeetings.length / DUMMY_MEETINGS.length) * 100,
      avg_participants: totalAttendees / DUMMY_MEETINGS.length,
    };
    return mockApiCall(stats);
  },

  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<TopParticipant[]>> => {
    // Calculate actual meeting participation from dummy data
    const participantStats = DUMMY_PARTICIPANTS.map(participant => {
      const meetingCount = DUMMY_MEETINGS.filter(meeting => 
        meeting.designated_attendees?.includes(participant.name)
      ).length;
      
      return {
        id: participant.id,
        name: participant.name,
        seksi: participant.seksi,
        meeting_count: meetingCount,
        attendance_rate: meetingCount > 0 ? Math.floor(Math.random() * 20) + 80 : 0,
      };
    }).filter(p => p.meeting_count > 0)
      .sort((a, b) => b.meeting_count - a.meeting_count)
      .slice(0, 10);
    
    return mockApiCall(participantStats);
  },

  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<SeksiStats[]>> => {
    // Calculate actual seksi statistics from dummy data
    const seksiMap = new Map<string, { meetings: Set<string>, participants: Set<string> }>();
    
    DUMMY_MEETINGS.forEach(meeting => {
      meeting.designated_attendees?.forEach(attendeeName => {
        const participant = DUMMY_PARTICIPANTS.find(p => p.name === attendeeName);
        if (participant) {
          if (!seksiMap.has(participant.seksi)) {
            seksiMap.set(participant.seksi, { meetings: new Set(), participants: new Set() });
          }
          seksiMap.get(participant.seksi)!.meetings.add(meeting.id);
          seksiMap.get(participant.seksi)!.participants.add(participant.name);
        }
      });
    });
    
    const seksiStats: SeksiStats[] = [
      'Intelijen Kepabeanan I',
      'Intelijen Kepabeanan II', 
      'Intelijen Cukai',
      'Dukungan Operasi Intelijen'
    ].map(seksi => {
      const stats = seksiMap.get(seksi) || { meetings: new Set(), participants: new Set() };
      return {
        seksi,
        meeting_count: stats.meetings.size,
        participant_count: stats.participants.size,
        attendance_rate: Math.floor(Math.random() * 15) + 85, // 85-100%
      };
    }).sort((a, b) => b.meeting_count - a.meeting_count);
    
    return mockApiCall(seksiStats);
  },

  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<MeetingTrend[]>> => {
    // Calculate trends based on actual meeting dates
    const meetingsByWeek = new Map<string, { total: number, completed: number }>();
    
    DUMMY_MEETINGS.forEach(meeting => {
      const date = new Date(meeting.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      
      if (!meetingsByWeek.has(weekKey)) {
        meetingsByWeek.set(weekKey, { total: 0, completed: 0 });
      }
      
      const weekStats = meetingsByWeek.get(weekKey)!;
      weekStats.total++;
      if (meeting.status === 'completed') {
        weekStats.completed++;
      }
    });
    
    const trends: MeetingTrend[] = Array.from(meetingsByWeek.entries()).map(([period, stats]) => ({
      period,
      count: stats.total,
      completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    })).sort((a, b) => a.period.localeCompare(b.period));
    
    return mockApiCall(trends);
  },
};