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

// Generate current date and future dates dynamically
const getCurrentDate = () => new Date();
const getDateString = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Dummy data for development - ALWAYS FRESH DATES
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

// Generate dummy meetings with dynamic dates - ALWAYS UPCOMING
const generateDummyMeetings = (): Meeting[] => {
  console.log('🔄 Generating fresh dummy meetings with current dates...');
  
  const meetings: Meeting[] = [
    // UPCOMING MEETINGS (8 meetings)
    {
      id: '1',
      title: 'Rapat Koordinasi Mingguan Tim Intelijen',
      date: getDateString(0), // Today
      start_time: '09:00',
      end_time: '11:00',
      location: 'Ruang Rapat Lantai 3',
      meeting_link: 'https://zoom.us/j/987654321',
      designated_attendees: ['Ahmad Rizki Pratama', 'Siti Nurhaliza'],
      designated_attendee: 'Ahmad Rizki Pratama',
      status: 'pending',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-012',
      attendance_link: 'https://forms.google.com/attendance-012',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Workshop Analisis Data Intelijen Lanjutan',
      date: getDateString(1), // Tomorrow
      start_time: '13:00',
      end_time: '16:30',
      location: 'Lab Komputer Gedung B',
      meeting_link: 'https://teams.microsoft.com/workshop-456',
      designated_attendees: ['Budi Santoso', 'Diana Putri', 'Eko Wijaya', 'Fitri Handayani'],
      designated_attendee: 'Budi Santoso',
      status: 'pending',
      dress_code: 'Business Casual',
      invitation_reference: 'REF-2025-013',
      attendance_link: 'https://forms.google.com/attendance-013',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Evaluasi Kinerja Triwulan I-2025',
      date: getDateString(2), // Day after tomorrow
      start_time: '09:00',
      end_time: '12:00',
      location: 'Ruang Rapat Direktur',
      designated_attendees: ['Gunawan Setiawan', 'Hesti Ramadhani'],
      designated_attendee: 'Gunawan Setiawan',
      status: 'pending',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-014',
      attendance_link: 'https://forms.google.com/attendance-014',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Sosialisasi Kebijakan Keamanan Baru',
      date: getDateString(3), // 3 days from now
      start_time: '10:00',
      end_time: '11:30',
      location: 'Aula Besar',
      designated_attendees: ['Ahmad Rizki Pratama', 'Diana Putri', 'Eko Wijaya'],
      designated_attendee: 'Ahmad Rizki Pratama',
      status: 'pending',
      dress_code: 'Business Casual',
      invitation_reference: 'REF-2025-015',
      attendance_link: 'https://forms.google.com/attendance-015',
      discussion_results: '',
      whatsapp_reminder_enabled: false,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Briefing Operasi Khusus Februari',
      date: getDateString(4), // 4 days from now
      start_time: '14:00',
      end_time: '16:00',
      location: 'Ruang Briefing Khusus',
      designated_attendees: ['Siti Nurhaliza', 'Budi Santoso', 'Gunawan Setiawan'],
      designated_attendee: 'Siti Nurhaliza',
      status: 'pending',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-016',
      attendance_link: 'https://forms.google.com/attendance-016',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Rapat Evaluasi Sistem Keamanan',
      date: getDateString(5), // 5 days from now
      start_time: '08:00',
      end_time: '10:00',
      location: 'Ruang Rapat Keamanan',
      meeting_link: 'https://zoom.us/j/111222333',
      designated_attendees: ['Ahmad Rizki Pratama', 'Budi Santoso'],
      designated_attendee: 'Ahmad Rizki Pratama',
      status: 'pending',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-017',
      attendance_link: 'https://forms.google.com/attendance-017',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      title: 'Training Protokol Keamanan Baru',
      date: getDateString(7), // 1 week from now
      start_time: '13:30',
      end_time: '17:00',
      location: 'Aula Training',
      designated_attendees: ['Diana Putri', 'Eko Wijaya', 'Fitri Handayani', 'Hesti Ramadhani'],
      designated_attendee: 'Diana Putri',
      status: 'pending',
      dress_code: 'Casual',
      invitation_reference: 'REF-2025-018',
      attendance_link: 'https://forms.google.com/attendance-018',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '8',
      title: 'Briefing Mingguan Operasional',
      date: getDateString(10), // 10 days from now
      start_time: '07:30',
      end_time: '08:30',
      location: 'Ruang Briefing',
      designated_attendees: ['Gunawan Setiawan', 'Siti Nurhaliza'],
      designated_attendee: 'Gunawan Setiawan',
      status: 'pending',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-019',
      attendance_link: 'https://forms.google.com/attendance-019',
      discussion_results: '',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    
    // COMPLETED MEETINGS (5 meetings) - Past dates
    {
      id: '9',
      title: 'Evaluasi Kinerja Individu',
      date: getDateString(-1), // Yesterday
      start_time: '14:00',
      end_time: '16:00',
      location: 'Ruang Meeting Kecil',
      designated_attendees: ['Fitri Handayani'],
      designated_attendee: 'Fitri Handayani',
      status: 'completed',
      dress_code: 'Business Casual',
      invitation_reference: 'REF-2025-008',
      attendance_link: 'https://forms.google.com/attendance-008',
      discussion_results: 'Meeting berhasil dilaksanakan. Evaluasi kinerja menunjukkan peningkatan produktivitas tim sebesar 15%. Beberapa area yang perlu diperbaiki telah diidentifikasi dan akan ditindaklanjuti minggu depan.',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10',
      title: 'Rapat Koordinasi Tim',
      date: getDateString(-2), // 2 days ago
      start_time: '10:00',
      end_time: '12:00',
      location: 'Ruang Rapat Utama',
      designated_attendees: ['Ahmad Rizki Pratama', 'Siti Nurhaliza', 'Budi Santoso'],
      designated_attendee: 'Ahmad Rizki Pratama',
      status: 'completed',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-007',
      attendance_link: 'https://forms.google.com/attendance-007',
      discussion_results: 'Koordinasi tim berjalan lancar. Pembagian tugas untuk proyek Q1 2025 telah disepakati. Target pencapaian ditetapkan 95% dengan timeline 3 bulan ke depan.',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '11',
      title: 'Briefing Keamanan Mingguan',
      date: getDateString(-3), // 3 days ago
      start_time: '08:00',
      end_time: '09:30',
      location: 'Ruang Briefing',
      designated_attendees: ['Diana Putri', 'Eko Wijaya'],
      designated_attendee: 'Diana Putri',
      status: 'completed',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-006',
      attendance_link: 'https://forms.google.com/attendance-006',
      discussion_results: 'Update protokol keamanan telah disampaikan. Semua peserta memahami prosedur baru. Implementasi akan dimulai minggu depan dengan monitoring ketat.',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: false,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '12',
      title: 'Workshop Pelatihan Sistem',
      date: getDateString(-5), // 5 days ago
      start_time: '13:00',
      end_time: '17:00',
      location: 'Lab Training',
      meeting_link: 'https://zoom.us/j/555666777',
      designated_attendees: ['Gunawan Setiawan', 'Hesti Ramadhani', 'Fitri Handayani'],
      designated_attendee: 'Gunawan Setiawan',
      status: 'completed',
      dress_code: 'Casual',
      invitation_reference: 'REF-2025-005',
      attendance_link: 'https://forms.google.com/attendance-005',
      discussion_results: 'Pelatihan sistem baru berhasil diselesaikan. Tingkat pemahaman peserta mencapai 90%. Materi tambahan akan diberikan untuk memperkuat kompetensi tim.',
      whatsapp_reminder_enabled: false,
      group_notification_enabled: true,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '13',
      title: 'Rapat Evaluasi Bulanan',
      date: getDateString(-7), // 1 week ago
      start_time: '09:00',
      end_time: '11:30',
      location: 'Ruang Rapat Direktur',
      designated_attendees: ['Ahmad Rizki Pratama', 'Siti Nurhaliza', 'Budi Santoso', 'Diana Putri'],
      designated_attendee: 'Ahmad Rizki Pratama',
      status: 'completed',
      dress_code: 'Formal',
      invitation_reference: 'REF-2025-004',
      attendance_link: 'https://forms.google.com/attendance-004',
      discussion_results: 'Evaluasi bulanan menunjukkan pencapaian target 98%. Beberapa inisiatif baru disetujui untuk meningkatkan efisiensi operasional. Budget tambahan dialokasikan untuk pengembangan SDM.',
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  console.log('✅ Generated meetings:', meetings.length);
  console.log('📅 Meeting dates:', meetings.map(m => `${m.title}: ${m.date} (${m.status || 'pending'})`));
  
  return meetings;
};

// Initialize dummy meetings
let DUMMY_MEETINGS = generateDummyMeetings();

const DUMMY_SETTINGS: Settings = {
  id: '1',
  group_notification_time: '07:00',
  group_notification_enabled: true,
  individual_reminder_minutes: 30,
  individual_reminder_enabled: true,
  whatsapp_connected: true,
  updated_at: new Date().toISOString(),
};

// Calculate dynamic dashboard stats from dummy data
const calculateDashboardStats = (): DashboardStats => {
  console.log('📊 Calculating dashboard stats...');
  
  // Refresh meetings data to ensure fresh dates
  DUMMY_MEETINGS = generateDummyMeetings();
  
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get upcoming meetings (today and future)
  const upcomingMeetings = DUMMY_MEETINGS.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  });
  
  console.log('📈 Stats calculated:', {
    total: DUMMY_MEETINGS.length,
    upcoming: upcomingMeetings.length,
    participants: DUMMY_PARTICIPANTS.length
  });
  
  return {
    total_meetings: DUMMY_MEETINGS.length,
    this_week_meetings: upcomingMeetings.length,
    notifications_sent: 15,
    active_participants: DUMMY_PARTICIPANTS.length,
  };
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
      console.log('🔄 Mock API call returning data:', data);
      resolve({ success: true, data });
    }, delay);
  });
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    console.log('🎯 Dashboard API: Getting stats...');
    
    // Refresh meetings to ensure current data
    DUMMY_MEETINGS = generateDummyMeetings();
    const stats = calculateDashboardStats();
    
    return mockApiCall(stats);
  },
    
  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    console.log('🎯 Dashboard API: Getting all meetings sorted by date...');
    
    // Always refresh meetings to ensure current dates
    DUMMY_MEETINGS = generateDummyMeetings();
    
    // Sort ALL meetings by date: earliest to latest (chronological order)
    const sortedMeetings = DUMMY_MEETINGS.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.start_time}`);
      const dateTimeB = new Date(`${b.date}T${b.start_time}`);
      
      // Sort by date and time: earliest first, latest last
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
    
    console.log('✅ Sorted meetings:', sortedMeetings.length);
    console.log('📋 Meeting chronological order:', sortedMeetings.map(m => {
      const meetingDateTime = new Date(`${m.date}T${m.start_time}`);
      const now = new Date();
      const status = meetingDateTime > now ? 'UPCOMING' : 'COMPLETED';
      return `${m.date} ${m.start_time} - ${m.title} [${status}]`;
    }));
    
    return mockApiCall(sortedMeetings);
  },
};

// Meetings API
export const meetingsApi = {
  getUpcoming: async (): Promise<ApiResponse<Meeting[]>> => {
    // Refresh meetings data
    DUMMY_MEETINGS = generateDummyMeetings();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingMeetings = DUMMY_MEETINGS.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return mockApiCall(upcomingMeetings);
  },
    
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    // Refresh meetings data
    DUMMY_MEETINGS = generateDummyMeetings();
    
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
      designated_attendee: data.designated_attendees[0] || '',
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
    
    const updateData = { ...data };
    if (data.designated_attendees && data.designated_attendees.length > 0) {
      updateData.designated_attendee = data.designated_attendees[0];
    }
    
    DUMMY_MEETINGS[meetingIndex] = {
      ...DUMMY_MEETINGS[meetingIndex],
      ...updateData,
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