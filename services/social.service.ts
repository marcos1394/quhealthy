// services/social.service.ts
import axiosInstance from '@/lib/axios';
import {
  SpringPage,
  SocialConnectionDTO,
  AuthUrlResponse,
  AiTextRequest,
  AiTextResponse,
  AiImageRequest,
  AiImageResponse,
  AiVideoRequest,
  AiVideoResponse,
  SchedulePostRequest,
  ScheduledPostDTO,
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  AiSuggestRequest,
  AiSuggestResponse,
  AnalyticsDashboardDTO,
} from '@/types/social';

const BASE = '/api/social';

export const socialService = {

  // ============================================================
  // 1. CONEXIONES OAuth
  // ============================================================

  getActiveConnections: async (): Promise<SocialConnectionDTO[]> => {
    const response = await axiosInstance.get(`${BASE}/connections`);
    return response.data;
  },

  getAuthUrl: async (platform: string): Promise<AuthUrlResponse> => {
    const response = await axiosInstance.get(`${BASE}/${platform}/url`);
    return response.data;
  },

  /**
   * ✅ CORREGIDO: el backend espera DELETE /connections/{id} con UUID,
   * no DELETE /{platform} con nombre de plataforma.
   */
  disconnectConnection: async (connectionId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/connections/${connectionId}`);
  },

  // ============================================================
  // 2. GENERACIÓN CON IA
  // ============================================================

  generateText: async (data: AiTextRequest): Promise<AiTextResponse> => {
    const response = await axiosInstance.post(`${BASE}/ai/generate-text`, data);
    return response.data;
  },

  generateImage: async (data: AiImageRequest): Promise<AiImageResponse> => {
    const response = await axiosInstance.post(`${BASE}/ai/generate-image`, data);
    return response.data;
  },

  /**
   * ✅ CORREGIDO: timeout reducido de 480000ms a 10000ms.
   * El backend devuelve 202 ACCEPTED inmediatamente — el video
   * llega por SSE cuando está listo, no por esta respuesta HTTP.
   */
  generateVideo: async (data: AiVideoRequest): Promise<AiVideoResponse> => {
    const response = await axiosInstance.post(`${BASE}/ai/generate-video`, data, {
      timeout: 10_000,
    });
    return response.data;
  },

  /**
   * Recovery endpoint: consulta si hay un video listo pendiente de entrega
   * (para casos donde el SSE falló durante la generación).
   */
  checkPendingVideo: async (): Promise<AiVideoResponse | null> => {
    try {
      const response = await axiosInstance.get(`${BASE}/ai/video-status`);
      return response.data;
    } catch {
      // 404 = sin video pendiente, es un caso normal
      return null;
    }
  },

  // ============================================================
  // 3. SCHEDULER DE POSTS
  // ============================================================

  /**
   * ✅ CORREGIDO: endpoint era /posts, ahora /posts/schedule.
   * El body ahora incluye socialConnectionId (UUID) en lugar de platform.
   */
  schedulePost: async (data: SchedulePostRequest): Promise<{ message: string; postId: string }> => {
    const response = await axiosInstance.post(`${BASE}/posts/schedule`, data);
    return response.data;
  },

  getScheduledPosts: async (page = 0, size = 20): Promise<SpringPage<ScheduledPostDTO>> => {
    const response = await axiosInstance.get(`${BASE}/posts`, { params: { page, size } });
    return response.data;
  },

  /**
   * ⚠️ NOTA: El backend no tiene DELETE /posts/{id} implementado aún.
   * Por ahora este método existe para no romper el tipo, pero lanzará 404.
   * Hay que implementar el endpoint en SocialController cuando se requiera.
   */
  cancelPost: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/posts/${id}`);
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`${BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ============================================================
  // 4. CRM OMNICANAL
  // ============================================================

  getConversations: async (page = 0, size = 20): Promise<SpringPage<ConversationDTO>> => {
    const response = await axiosInstance.get(`${BASE}/crm/conversations`, {
      params: { page, size },
    });
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    page = 0,
    size = 50
  ): Promise<SpringPage<MessageDTO>> => {
    const response = await axiosInstance.get(
      `${BASE}/crm/conversations/${conversationId}/messages`,
      { params: { page, size } }
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    data: SendMessageRequest
  ): Promise<MessageDTO> => {
    const response = await axiosInstance.post(
      `${BASE}/crm/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  /**
   * ✅ NUEVO: Genera 3 sugerencias de respuesta con IA
   * basadas en el historial de la conversación.
   * Endpoint: POST /api/social/crm/ai-suggest
   */
  getAiReplySuggestions: async (data: AiSuggestRequest): Promise<AiSuggestResponse> => {
    const response = await axiosInstance.post(`${BASE}/crm/ai-suggest`, data);
    return response.data;
  },

  // ============================================================
  // 5. ANALÍTICAS
  // ============================================================

  getAnalyticsDashboard: async (): Promise<AnalyticsDashboardDTO> => {
    const response = await axiosInstance.get(`${BASE}/analytics/dashboard`);
    return response.data;
  },
};