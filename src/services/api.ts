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

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/dashboard/statistics');
    return normalizeApiResponse<DashboardStats>(response.data);
  },
    
  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get('/dashboard/upcoming-meetings');
    return normalizeApiResponse<Meeting[]>(response.data);
  },
};

// Meetings API
export const meetingsApi = {
  getUpcoming: async (): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get('/meetings/upcoming');
    return normalizeApiResponse<Meeting[]>(response.data);
  },
    
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    const params = { page, ...filters };
    const response = await apiClient.get('/meetings', { params });
    return normalizeApiResponse<PaginatedResponse<Meeting>>(response.data);
  },
    
  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return normalizeApiResponse<Meeting>(response.data);
  },
    
  search: async (query: string): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get('/meetings/search', { params: { q: query } });
    return normalizeApiResponse<Meeting[]>(response.data);
  },
    
  create: async (data: CreateMeetingForm): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.post('/meetings', data);
    return normalizeApiResponse<Meeting>(response.data);
  },
    
  update: async (id: string, data: Partial<CreateMeetingForm>): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.put(`/meetings/${id}`, data);
    return normalizeApiResponse<Meeting>(response.data);
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/meetings/${id}`);
    return normalizeApiResponse<void>(response.data ?? null);
  },
    
  sendWhatsAppReminder: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/meetings/${id}/send-reminder`);
    return normalizeApiResponse<void>(response.data ?? null);
  },
    
  // Meeting attendees management
  addAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/meetings/${meetingId}/attendees`, { attendee_ids: attendeeIds });
    return normalizeApiResponse<void>(response.data ?? null);
  },
    
  removeAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/meetings/${meetingId}/attendees`, { data: { attendee_ids: attendeeIds } });
    return normalizeApiResponse<void>(response.data ?? null);
  },
    
  syncAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/meetings/${meetingId}/attendees`, { attendee_ids: attendeeIds });
    return normalizeApiResponse<void>(response.data ?? null);
  },
};

// Participants API
export const participantsApi = {
  getAll: async (page = 1): Promise<ApiResponse<PaginatedResponse<Participant>>> => {
    const response = await apiClient.get('/participants', { params: { page } });
    return normalizeApiResponse<PaginatedResponse<Participant>>(response.data);
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    const response = await apiClient.post('/participants', data);
    return normalizeApiResponse<Participant>(response.data);
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    const response = await apiClient.put(`/participants/${id}`, data);
    return normalizeApiResponse<Participant>(response.data);
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/participants/${id}`);
    return normalizeApiResponse<void>(response.data ?? null);
  },
    
  search: async (query: string): Promise<ApiResponse<Participant[]>> => {
    const response = await apiClient.get('/participants/search', { params: { q: query } });
    return normalizeApiResponse<Participant[]>(response.data);
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.get('/settings');
    return normalizeApiResponse<Settings>(response.data);
  },
    
  update: async (data: UpdateSettingsForm): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.put('/settings', data);
    return normalizeApiResponse<Settings>(response.data);
  },
    
  testWhatsAppConnection: async (): Promise<ApiResponse<{ connected: boolean }>> => {
    const response = await apiClient.post('/settings/test-whatsapp');
    return normalizeApiResponse<{ connected: boolean }>(response.data);
  },
    
  previewGroupMessage: async (date?: string): Promise<ApiResponse<{ message: string; meetings: Meeting[] }>> => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/settings/preview-group-message', { params });
    return normalizeApiResponse<{ message: string; meetings: Meeting[] }>(response.data);
  },
    
  sendTestGroupMessage: async (date?: string): Promise<ApiResponse<void>> => {
    const params = date ? { date } : {};
    const response = await apiClient.post('/settings/send-test-group-message', params);
    return normalizeApiResponse<void>(response.data ?? null);
  },
};

// Review API
export const reviewApi = {
  getStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get('/review/stats', { params: { period } });
    return normalizeApiResponse<ReviewStats>(response.data);
  },

  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<TopParticipant[]>> => {
    const response = await apiClient.get('/review/top-participants', { params: { period } });
    return normalizeApiResponse<TopParticipant[]>(response.data);
  },

  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<SeksiStats[]>> => {
    const response = await apiClient.get('/review/seksi-stats', { params: { period } });
    return normalizeApiResponse<SeksiStats[]>(response.data);
  },

  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<MeetingTrend[]>> => {
    const response = await apiClient.get('/review/meeting-trends', { params: { period } });
    return normalizeApiResponse<MeetingTrend[]>(response.data);
  },
};