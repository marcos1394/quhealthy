// services/social.service.ts
import axiosInstance from '@/lib/axios';
import {
  SpringPage,
  SocialConnectionDTO,
  AuthUrlResponse,
  GeneratePostRequest,
  GeneratePostResponse,
  SchedulePostRequest,
  ScheduledPostDTO,
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  AnalyticsDashboardDTO
} from '@/types/social';

const BASE_URL = '/api/social';

export const socialService = {
  // ==========================================
  // 1. CONEXIONES OAUTH
  // ==========================================
  getActiveConnections: async (): Promise<SocialConnectionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/auth/connections`);
    return response.data;
  },
  getAuthUrl: async (platform: string): Promise<AuthUrlResponse> => {
    const response = await axiosInstance.get(`${BASE_URL}/auth/${platform}/url`);
    return response.data;
  },
  disconnectPlatform: async (platform: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/auth/${platform}`);
  },

  // ==========================================
  // 2. CREACIÓN IA Y SCHEDULER
  // ==========================================
  generateContent: async (data: GeneratePostRequest): Promise<GeneratePostResponse> => {
    const response = await axiosInstance.post(`${BASE_URL}/posts/generate`, data);
    return response.data;
  },
  schedulePost: async (data: SchedulePostRequest): Promise<ScheduledPostDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/posts`, data);
    return response.data;
  },
  getScheduledPosts: async (page = 0, size = 20): Promise<SpringPage<ScheduledPostDTO>> => {
    const response = await axiosInstance.get(`${BASE_URL}/posts`, { params: { page, size } });
    return response.data;
  },
  cancelPost: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/posts/${id}`);
  },

  // ==========================================
  // 3. CRM OMNICANAL
  // ==========================================
  getConversations: async (page = 0, size = 20): Promise<SpringPage<ConversationDTO>> => {
    const response = await axiosInstance.get(`${BASE_URL}/crm/conversations`, { params: { page, size } });
    return response.data;
  },
  getMessages: async (conversationId: string, page = 0, size = 50): Promise<SpringPage<MessageDTO>> => {
    const response = await axiosInstance.get(`${BASE_URL}/crm/conversations/${conversationId}/messages`, { params: { page, size } });
    return response.data;
  },
  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<MessageDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/crm/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  // ==========================================
  // 4. ANALÍTICAS DE MARKETING
  // ==========================================
  getAnalyticsDashboard: async (): Promise<AnalyticsDashboardDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/analytics/dashboard`);
    return response.data;
  }
};