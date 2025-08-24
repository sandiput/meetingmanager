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
  UpdateSettingsForm
} from '../types';

// Mock data for demo purposes
const mockStats: DashboardStats = {
  total_meetings: 24,
  this_week_meetings: 8,
  notifications_sent: 156,
  active_participants: 42,
};

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Project Phoenix Kickoff',
    date: '2024-01-25',
    time: '10:00',
    location: 'Conference Room A',
    designated_attendee: 'Juan Rodriguez',
    dress_code: 'Business Casual',
    invitation_reference: 'REF-2024-001',
    attendance_link: 'https://forms.example.com/attendance',
    discussion_results: 'Initial planning and strategy session completed.',
    status: 'incoming',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Intelligence Briefing',
    date: '2024-01-26',
    time: '14:00',
    location: 'Virtual (Zoom)',
    designated_attendee: 'Maria Gonzalez',
    dress_code: 'Business Formal',
    invitation_reference: 'REF-2024-002',
    attendance_link: 'https://zoom.us/j/123456789',
    discussion_results: '',
    status: 'incoming',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    created_at: '2024-01-21T14:00:00Z',
    updated_at: '2024-01-21T14:00:00Z',
  },
];

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'Juan Rodriguez',
    whatsapp_number: '+52 1 55 1234 5678',
    nip: '198501012010011001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Gonzalez',
    whatsapp_number: '+52 1 55 8765 4321',
    nip: '198702022011012002',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Sofia Peña',
    whatsapp_number: '+52 1 55 1122 3344',
    nip: '198903032012013003',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    name: 'Andres Lopez',
    whatsapp_number: '+52 1 55 5566 7788',
    nip: '199004042013014004',
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
  },
];

const mockSettings: Settings = {
  group_notification_time: '07:00',
  group_notification_enabled: true,
  reminder_minutes_before: 30,
  individual_reminder_enabled: true,
  whatsapp_bot_token: 'demo_token',
  whatsapp_phone_number_id: 'demo_phone_id',
  whatsapp_business_account_id: 'demo_business_id',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
};

// Mock API delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(500);
    return { data: mockStats, success: true, message: 'Stats retrieved successfully' };
  },
    
  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    await delay(700);
    return { data: mockMeetings, success: true, message: 'Meetings retrieved successfully' };
  },
};

// Meetings API
export const meetingsApi = {
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    await delay(600);
    return { 
      data: {
        data: mockMeetings,
        current_page: page,
        last_page: 1,
        per_page: 10,
        total: mockMeetings.length,
      }, 
      success: true, 
      message: 'Meetings retrieved successfully' 
    };
  },
    
  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    await delay(400);
    const meeting = mockMeetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');
    return { data: meeting, success: true, message: 'Meeting retrieved successfully' };
  },
    
  create: async (data: CreateMeetingForm): Promise<ApiResponse<Meeting>> => {
    await delay(800);
    const newMeeting: Meeting = {
      id: String(mockMeetings.length + 1),
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockMeetings.push(newMeeting);
    return { data: newMeeting, success: true, message: 'Meeting created successfully' };
  },
    
  update: async (id: string, data: Partial<CreateMeetingForm>): Promise<ApiResponse<Meeting>> => {
    await delay(700);
    const meetingIndex = mockMeetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) throw new Error('Meeting not found');
    mockMeetings[meetingIndex] = { ...mockMeetings[meetingIndex], ...data, updated_at: new Date().toISOString() };
    return { data: mockMeetings[meetingIndex], success: true, message: 'Meeting updated successfully' };
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay(500);
    const meetingIndex = mockMeetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) throw new Error('Meeting not found');
    mockMeetings.splice(meetingIndex, 1);
    return { data: undefined, success: true, message: 'Meeting deleted successfully' };
  },
    
  sendWhatsAppReminder: async (id: string): Promise<ApiResponse<void>> => {
    await delay(1000);
    return { data: undefined, success: true, message: 'WhatsApp reminder sent successfully' };
  },
};

// Participants API
export const participantsApi = {
  getAll: async (page = 1): Promise<ApiResponse<PaginatedResponse<Participant>>> => {
    await delay(500);
    return { 
      data: {
        data: mockParticipants,
        current_page: page,
        last_page: 1,
        per_page: 10,
        total: mockParticipants.length,
      }, 
      success: true, 
      message: 'Participants retrieved successfully' 
    };
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    await delay(600);
    const newParticipant: Participant = {
      id: String(mockParticipants.length + 1),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockParticipants.push(newParticipant);
    return { data: newParticipant, success: true, message: 'Participant created successfully' };
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    await delay(600);
    const participantIndex = mockParticipants.findIndex(p => p.id === id);
    if (participantIndex === -1) throw new Error('Participant not found');
    mockParticipants[participantIndex] = { ...mockParticipants[participantIndex], ...data, updated_at: new Date().toISOString() };
    return { data: mockParticipants[participantIndex], success: true, message: 'Participant updated successfully' };
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay(500);
    const participantIndex = mockParticipants.findIndex(p => p.id === id);
    if (participantIndex === -1) throw new Error('Participant not found');
    mockParticipants.splice(participantIndex, 1);
    return { data: undefined, success: true, message: 'Participant deleted successfully' };
  },
    
  search: async (query: string): Promise<ApiResponse<Participant[]>> => {
    await delay(300);
    const filtered = mockParticipants.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtered, success: true, message: 'Search completed successfully' };
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    await delay(400);
    return { data: mockSettings, success: true, message: 'Settings retrieved successfully' };
  },
    
  update: async (data: UpdateSettingsForm): Promise<ApiResponse<Settings>> => {
    await delay(700);
    Object.assign(mockSettings, data, { updated_at: new Date().toISOString() });
    return { data: mockSettings, success: true, message: 'Settings updated successfully' };
  },
    
  testWhatsAppConnection: async (): Promise<ApiResponse<{ connected: boolean }>> => {
    await delay(1500);
    return { data: { connected: true }, success: true, message: 'WhatsApp connection test successful' };
  },
};