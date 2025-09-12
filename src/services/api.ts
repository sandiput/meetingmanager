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
  Attachment,
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
  getStats: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<ApiResponse<ReviewStats>> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/stats', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch review stats for period ${period}:`, error);
      throw error;
    }
  },
    
  getTopParticipants: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<ApiResponse<TopParticipant[]>> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/top-participants', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch top participants for period ${period}:`, error);
      throw error;
    }
  },
    
  getTopInvitedBy: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<ApiResponse<any[]>> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/top-invited-by', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch top invited by for period ${period}:`, error);
      throw error;
    }
  },
    
  getSeksiStats: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<ApiResponse<SeksiStats[]>> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/seksi-stats', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch seksi stats for period ${period}:`, error);
      throw error;
    }
  },
    
  getMeetingTrends: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<ApiResponse<MeetingTrend[]>> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/meeting-trends', { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch meeting trends for period ${period}:`, error);
      throw error;
    }
  },
  
  exportExcel: async (period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly', queryParams: Record<string, any> = {}): Promise<Blob> => {
    try {
      const params = { period, ...queryParams };
      const response = await apiClient.get('/review/export-excel', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to export Excel for period ${period}:`, error);
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
      console.log('coba baru', response)
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
      // Validate meeting ID
      if (!id) {
        throw new Error('Meeting ID is required for update operation');
      }
      
      // Log the data being sent to the API for debugging
      console.log(`Sending update request for meeting ${id} with data:`, data);
      
      // Ensure we're not sending an id in the data object to prevent conflicts
      const cleanData = { ...data };
      if ('id' in cleanData) {
        console.warn('Removing id from update data to prevent conflicts');
        delete cleanData.id;
      }
      
      const response = await apiClient.put(`/meetings/${id}`, cleanData);
      return normalizeApiResponse(response.data);
    } catch (error: any) {
      // Enhanced error logging with response details if available
      if (error.response) {
        console.error(`Failed to update meeting with id ${id}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else {
        console.error(`Failed to update meeting with id ${id}:`, error);
      }
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
    
  sendWhatsAppReminder: async (id: string, options?: { sendToAttendee?: boolean; sendToGroup?: boolean; customMessage?: string; recipients?: string[] }): Promise<ApiResponse<void>> => {
    try {
      // Determine type based on frontend options
      let type = 'both';
      if (options?.sendToAttendee && !options?.sendToGroup) {
        type = 'individual';
      } else if (!options?.sendToAttendee && options?.sendToGroup) {
        type = 'group';
      }
      
      const response = await apiClient.post(`/meetings/${id}/send-reminder`, {
        type,
        recipients: options?.recipients || [],
        customMessage: options?.customMessage
      });
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
      const response = await apiClient.get('/participants', { params: { page, limit:1000 } });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      throw error;
    }
  },
    
  create: async (data: CreateParticipantForm): Promise<ApiResponse<Participant>> => {
    try {
      // Format WhatsApp number to remove '+' before sending to backend
      const formattedData = {
        ...data,
        whatsapp_number: data.whatsapp_number.replace(/^\+/, '')
      };
      
      const response = await apiClient.post('/participants', formattedData);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to create participant:', error);
      throw error;
    }
  },
    
  update: async (id: string, data: Partial<CreateParticipantForm>): Promise<ApiResponse<Participant>> => {
    try {
      // Format WhatsApp number to remove '+' before sending to backend
      const formattedData = {
        ...data,
        whatsapp_number: data.whatsapp_number ? data.whatsapp_number.replace(/^\+/, '') : data.whatsapp_number
      };
      
      const response = await apiClient.put(`/participants/${id}`, formattedData);
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
      const response = await apiClient.get('/settings/test-whatsapp');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to test WhatsApp connection:', error);
      throw error;
    }
  },
    

    
  sendTestGroupMessage: async (date?: string): Promise<ApiResponse<void>> => {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.post('/settings/whatsapp-test-message', params);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to send test group message:', error);
      throw error;
    }
  },

  getWhatsAppGroups: async (): Promise<ApiResponse<{ id: string; name: string; participants: number }[]>> => {
    try {
      const response = await apiClient.get('/settings/whatsapp-available-groups');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch WhatsApp groups:', error);
      throw error;
    }
  },

  previewGroupMessage: async (date: string): Promise<ApiResponse<{ message: string; meetings: Meeting[] }>> => {
    try {
      const response = await apiClient.get(`/settings/preview-group-message?date=${date}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to preview group message:', error);
      throw error;
    }
  },

  getWhatsAppStatus: async (): Promise<ApiResponse<{ isInitialized: boolean; isConnected: boolean; isEnabled: boolean; qrCode?: string; whatsapp_connected?: boolean }>> => {
    try {
      const response = await apiClient.get('/whatsapp/status');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to get WhatsApp status:', error);
      throw error;
    }
  },

  reinitializeWhatsApp: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/settings/whatsapp-reinitialize');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to reinitialize WhatsApp:', error);
      throw error;
    }
  },

  getWhatsAppQRCode: async (): Promise<ApiResponse<{ qrCode: string; isAvailable: boolean }>> => {
    try {
      const response = await apiClient.get('/settings/whatsapp-qr-code');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to get WhatsApp QR code:', error);
      throw error;
    }
  },
};

// Review API section removed to fix duplicate declaration

// Export all API functions
// Daftar Kantor API
export const daftarKantorApi = {
  getAll: async (): Promise<ApiResponse<{ kd_kantor: string; nama_kantor_pendek: string; nama_kantor_lengkap: string }[]>> => {
    try {
      const response = await apiClient.get('/kantor');
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch daftar kantor:', error);
      throw error;
    }
  },

  search: async (query: string): Promise<ApiResponse<{ kd_kantor: string; nama_kantor_pendek: string; nama_kantor_lengkap: string }[]>> => {
    try {
      const response = await apiClient.get(`/kantor/search/${query}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to search daftar kantor with query ${query}:`, error);
      throw error;
    }
  },
};

// Attachments API
export const attachmentsApi = {
  upload: async (meetingId: string, file: File, fileCategory: 'attachment' | 'photo' = 'attachment', onProgress?: (progress: number) => void): Promise<ApiResponse<Attachment>> => {
    try {
      const formData = new FormData();
      formData.append('meetingId', meetingId);
      formData.append('fileCategory', fileCategory);
      formData.append('file', file);

      const response = await apiClient.post('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw error;
    }
  },

  getByMeetingId: async (meetingId: string, category?: 'attachment' | 'photo'): Promise<ApiResponse<{ attachments: Attachment[] }>> => {
    try {
      const params = category ? { category } : {};
      const response = await apiClient.get(`/attachments/meeting/${meetingId}`, { params });
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to fetch attachments for meeting ${meetingId}:`, error);
      throw error;
    }
  },

  download: async (attachmentId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/attachments/download/${attachmentId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download attachment ${attachmentId}:`, error);
      throw error;
    }
  },

  delete: async (attachmentId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/attachments/${attachmentId}`);
      return normalizeApiResponse(response.data);
    } catch (error) {
      console.error(`Failed to delete attachment ${attachmentId}:`, error);
      throw error;
    }
  },
};

export const api = {
  dashboard: dashboardApi,
  meetings: meetingsApi,
  participants: participantsApi,
  settings: settingsApi,
  review: reviewApi,
  daftarKantor: daftarKantorApi,
  attachments: attachmentsApi,
};

// End of file