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

import { API_CONFIG } from '../utils/constants';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('meeting_manager_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
    
  getUpcomingMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get('/dashboard/upcoming-meetings');
    return response.data;
  },
};

// Meetings API
export const meetingsApi = {
  getAll: async (page = 1, filters?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
    const params = { page, ...filters };
    const response = await apiClient.get('/meetings', { params });
    return response.data;
  },
    
  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return response.data;
  },
    
  search: async (query: string): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get('/meetings/search', { params: { q: query } });
    return response.data;
  },
    
  create: async (data: CreateMeetingForm): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.post('/meetings', data);
    return response.data;
  },
    
  update: async (id: string, data: Partial<CreateMeetingForm>): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.put(`/meetings/${id}`, data);
    return response.data;
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/meetings/${id}`);
    return response.data;
  },
    
  sendWhatsAppReminder: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/meetings/${id}/send-reminder`);
    return response.data;
  },
};

// Participants API
export const participantsApi = {
  getAll: async (page = 1): Promise<ApiResponse<PaginatedResponse<Participant>>> => {
    const response = await apiClient.get('/participants', { params: { page } });
    return response.data;
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    const response = await apiClient.post('/participants', data);
    return response.data;
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    const response = await apiClient.put(`/participants/${id}`, data);
    return response.data;
  },
    
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/participants/${id}`);
    return response.data;
  },
    
  search: async (query: string): Promise<ApiResponse<Participant[]>> => {
    const response = await apiClient.get('/participants/search', { params: { q: query } });
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
    
  update: async (data: UpdateSettingsForm): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
    
  testWhatsAppConnection: async (): Promise<ApiResponse<{ connected: boolean }>> => {
    const response = await apiClient.post('/settings/test-whatsapp');
    return response.data;
  },
};

// Review API
export const reviewApi = {
  getStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get('/review/stats', { params: { period } });
    return response.data;
  },

  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<TopParticipant[]>> => {
    const response = await apiClient.get('/review/top-participants', { params: { period } });
    return response.data;
  },

  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<SeksiStats[]>> => {
    const response = await apiClient.get('/review/seksi-stats', { params: { period } });
    return response.data;
  },

  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly'): Promise<ApiResponse<MeetingTrend[]>> => {
    const response = await apiClient.get('/review/meeting-trends', { params: { period } });
    return response.data;
  },
};