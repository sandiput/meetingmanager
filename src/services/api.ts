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

// API now uses real backend data instead of dummy data

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://api.local/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Helper function to normalize API responses
const normalizeApiResponse = <T>(response: any): ApiResponse<T> => {
  return {
    data: response.data,
    message: response.message || '',
    success: response.success !== undefined ? response.success : true,
  };
};
// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return normalizeApiResponse<DashboardStats>(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    try {
      const response = await apiClient.get('/dashboard/upcoming');
      return normalizeApiResponse<Meeting[]>(response.data);
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      throw error;
    }
  },
};
// Review API
export const reviewApi = {
  getStats: async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<ReviewStats>> => {
    try {
      const response = await apiClient.get('/review/stats', { params: { period } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch review stats for period ${period}:`, error);
      throw error;
    }
  },
    
  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<TopParticipant[]>> => {
    try {
      const response = await apiClient.get('/review/top-participants', { params: { period } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch top participants for period ${period}:`, error);
      throw error;
    }
  },
    
  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<SeksiStats[]>> => {
    try {
      const response = await apiClient.get('/review/seksi-stats', { params: { period } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch seksi stats for period ${period}:`, error);
      throw error;
    }
  },
  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<MeetingTrend[]>> => {
    try {
      const response = await apiClient.get('/review/meeting-trends', { params: { period } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch meeting trends for period ${period}:`, error);
      throw error;
    }
  },
};

export { apiClient };

// Meetings API
export const meetingsApi = {
  getUpcoming: async (): Promise<ApiResponse<Meeting[]>> => {
    try {
      const response = await apiClient.get('/meetings/upcoming');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch upcoming meetings:', error);
      throw error;
    }
  },
    
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    try {
      const params = { page, ...filters };
      const response = await apiClient.get('/meetings', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch all meetings:', error);
      throw error;
    }
  },
    
  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    try {
      const response = await apiClient.get(`/meetings/${id}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch meeting with id ${id}:`, error);
      throw error;
    }
  },
    
  search: async (query: string): Promise<ApiResponse<Meeting[]>> => {
    try {
      const response = await apiClient.get(`/meetings/search`, { params: { q: query } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to search meetings with query ${query}:`, error);
      throw error;
    }
  },
    
  create: async (data: CreateMeetingForm): Promise<ApiResponse<Meeting>> => {
    try {
      const response = await apiClient.post('/meetings', data);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  },
    
  update: async (id: string, data: Partial<CreateMeetingForm>): Promise<ApiResponse<Meeting>> => {
    try {
      const response = await apiClient.put(`/meetings/${id}`, data);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to update meeting with id ${id}:`, error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/meetings/${id}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to delete meeting with id ${id}:`, error);
      throw error;
    }
  },
    
  sendWhatsAppReminder: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/meetings/${id}/send-reminder`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to send WhatsApp reminder for meeting ${id}:`, error);
      throw error;
    }
  },
    
  // Meeting attendees management
  addAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post(`/meetings/${meetingId}/attendees`, { attendee_ids: attendeeIds });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to add attendees to meeting ${meetingId}:`, error);
      throw error;
    }
  },
    
  removeAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/meetings/${meetingId}/attendees`, { 
        data: { attendee_ids: attendeeIds } 
      });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to remove attendees from meeting ${meetingId}:`, error);
      throw error;
    }
  },
    
  syncAttendees: async (meetingId: string, attendeeIds: string[]): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.put(`/meetings/${meetingId}/attendees`, { attendee_ids: attendeeIds });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to sync attendees for meeting ${meetingId}:`, error);
      throw error;
    }
  },
};

// Participants API
export const participantsApi = {
  getAll: async (page = 1): Promise<ApiResponse<PaginatedResponse<Participant>>> => {
    try {
      const response = await apiClient.get('/participants', { params: { page } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      throw error;
    }
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    try {
      const response = await apiClient.post('/participants', data);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to create participant:', error);
      throw error;
    }
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    try {
      const response = await apiClient.put(`/participants/${id}`, data);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to update participant with id ${id}:`, error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/participants/${id}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to delete participant with id ${id}:`, error);
      throw error;
    }
  },
    
  search: async (query: string): Promise<ApiResponse<Participant[]>> => {
    try {
      const response = await apiClient.get(`/participants/search`, { params: { q: query } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to search participants with query ${query}:`, error);
      throw error;
    }
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    try {
      const response = await apiClient.get('/settings');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },
    
  update: async (data: UpdateSettingsForm): Promise<ApiResponse<Settings>> => {
    try {
      const response = await apiClient.put('/settings', data);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },
    
  testWhatsAppConnection: async (): Promise<ApiResponse<{ connected: boolean }>> => {
    try {
      const response = await apiClient.get('/settings/whatsapp/test');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to test WhatsApp connection:', error);
      throw error;
    }
  },
    
  previewGroupMessage: async (date?: string): Promise<ApiResponse<{ message: string; meetings: Meeting[] }>> => {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get('/settings/whatsapp/preview-message', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to preview group message:', error);
      throw error;
    }
  },
    
  sendTestGroupMessage: async (date?: string): Promise<ApiResponse<void>> => {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.post('/settings/whatsapp/send-test', params);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to send test group message:', error);
      throw error;
    }
  },
};

// Review API section removed to fix duplicate declaration

// Export all API functions
export const api = {
  dashboard: dashboardApi,
  meetings: meetingsApi,
  participants: participantsApi,
  settings: settingsApi,
  review: reviewApi,
};

// End of file