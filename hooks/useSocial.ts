// src/hooks/useSocial.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { socialService } from '@/services/social.service';
import { useSessionStore } from '@/stores/SessionStore';
import {
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
  AnalyticsDashboardDTO,
  SpringPage
} from '@/types/social';

export interface UseSocialReturn {
  loading: boolean;
  error: string | null;

  // ==========================================
  // ESTADO LOCAL DEL CRM
  // ==========================================
  conversations: ConversationDTO[];
  messages: MessageDTO[];
  activeConversationId: string | null;

  // ==========================================
  // MÉTODOS OAUTH (Conexiones)
  // ==========================================
  getActiveConnections: () => Promise<SocialConnectionDTO[]>;
  getAuthUrl: (platform: string) => Promise<AuthUrlResponse>;
  disconnectPlatform: (platform: string) => Promise<void>;

  // ==========================================
  // MÉTODOS IA (Separados por tipo)
  // ==========================================
  generateText: (data: AiTextRequest) => Promise<AiTextResponse>;
  generateImage: (data: AiImageRequest) => Promise<AiImageResponse>;
  generateVideo: (data: AiVideoRequest) => Promise<AiVideoResponse>;
  schedulePost: (data: SchedulePostRequest) => Promise<ScheduledPostDTO>;
  getScheduledPosts: (page?: number, size?: number) => Promise<SpringPage<ScheduledPostDTO>>;
  cancelPost: (id: string) => Promise<void>;

  // ==========================================
  // MÉTODOS CRM
  // ==========================================
  loadConversations: (page?: number, size?: number) => Promise<void>;
  loadMessages: (conversationId: string, page?: number, size?: number) => Promise<void>;
  sendCrmMessage: (conversationId: string, data: SendMessageRequest) => Promise<MessageDTO>;

  // ==========================================
  // MÉTODOS ANALÍTICAS
  // ==========================================
  getAnalyticsDashboard: () => Promise<AnalyticsDashboardDTO>;
}

export const useSocial = (): UseSocialReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados Reactivos para la UI del CRM
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  // 🚀 Obtenemos el token directamente del store de Zustand
  const token = useSessionStore((state) => state.token);

  // Refs estables para el SSE — evita re-crear la conexión en cada cambio de estado
  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  const loadConversationsRef = useRef<(page?: number, size?: number) => Promise<void>>(null!);

  // ==========================================
  // MANEJO CENTRALIZADO DE ERRORES
  // ==========================================
  const handleError = (err: any): never => {
    const msg = err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Ocurrió un error inesperado en el módulo social';
    setError(msg);
    throw new Error(msg);
  };

  // ==========================================
  // 1. CONEXIONES OAUTH
  // ==========================================
  const getActiveConnections = async () => {
    setLoading(true); setError(null);
    try { return await socialService.getActiveConnections(); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const getAuthUrl = async (platform: string) => {
    setLoading(true); setError(null);
    try { return await socialService.getAuthUrl(platform); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const disconnectPlatform = async (platform: string) => {
    setLoading(true); setError(null);
    try { await socialService.disconnectPlatform(platform); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // ==========================================
  // 2. GENERACIÓN CON IA (3 endpoints separados)
  // ==========================================
  const generateText = async (data: AiTextRequest) => {
    setLoading(true); setError(null);
    try { return await socialService.generateText(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const generateImage = async (data: AiImageRequest) => {
    setLoading(true); setError(null);
    try { return await socialService.generateImage(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const generateVideo = async (data: AiVideoRequest) => {
    setLoading(true); setError(null);
    try { return await socialService.generateVideo(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const schedulePost = async (data: SchedulePostRequest) => {
    setLoading(true); setError(null);
    try { return await socialService.schedulePost(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const getScheduledPosts = async (page = 0, size = 20) => {
    setLoading(true); setError(null);
    try { return await socialService.getScheduledPosts(page, size); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const cancelPost = async (id: string) => {
    setLoading(true); setError(null);
    try { await socialService.cancelPost(id); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // ==========================================
  // 3. CRM OMNICANAL
  // ==========================================
  const loadConversations = useCallback(async (page = 0, size = 20) => {
    setLoading(true); setError(null);
    try {
      const res = await socialService.getConversations(page, size);
      setConversations(res.content);
    }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  }, []);

  const loadMessages = useCallback(async (conversationId: string, page = 0, size = 50) => {
    setLoading(true); setError(null);
    setActiveConversationId(conversationId);
    try {
      const res = await socialService.getMessages(conversationId, page, size);
      setMessages(res.content.reverse()); // Spring lo manda DESC, UI lo lee de arriba abajo
    }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  }, []);

  const sendCrmMessage = async (conversationId: string, data: SendMessageRequest) => {
    setLoading(true); setError(null);
    try {
      const msg = await socialService.sendMessage(conversationId, data);

      // Inyectamos el mensaje inmediatamente en la UI del chat
      setMessages((prev) => [...prev, msg]);

      // Subimos el chat al principio del inbox
      setConversations((prev) => {
        const updated = prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessageAt: msg.createdAt, lastMessagePreview: msg.content }
            : conv
        );
        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });

      return msg;
    }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // ==========================================
  // 4. ANALÍTICAS DE MARKETING
  // ==========================================
  const getAnalyticsDashboard = async () => {
    setLoading(true); setError(null);
    try { return await socialService.getAnalyticsDashboard(); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // Mantener siempre la referencia actualizada
  loadConversationsRef.current = loadConversations;

  // =====================================================================
  // 🔌 TIEMPO REAL (SSE): Una sola conexión estable por sesión
  // Solo se re-crea si cambia el token (login/logout).
  // activeConversationId y loadConversations se leen desde refs.
  // =====================================================================
  useEffect(() => {
    // Si no hay token de Zustand, no abrimos el túnel
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.com';
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const eventSource = new EventSource(`${apiUrl}/api/social/crm/stream?token=${token}`);

    eventSource.addEventListener('CONNECTED', () => {
      console.log('🟢 Túnel SSE CRM Activo');
      retryCount = 0;
    });

    eventSource.addEventListener('NEW_MESSAGE', (event) => {
      const incomingMsg: MessageDTO & { conversationId?: string } = JSON.parse(event.data);

      // A. Si el paciente está en el chat activo, aparece su mensaje en pantalla
      setMessages((prev) => {
        if (incomingMsg.conversationId === activeConversationIdRef.current) {
          return [...prev, incomingMsg];
        }
        return prev;
      });

      // B. Actualizamos el Inbox
      setConversations((prev) => {
        let isExistingChat = false;
        const updated = prev.map(conv => {
          if (conv.id === incomingMsg.conversationId) {
            isExistingChat = true;
            return {
              ...conv,
              lastMessageAt: incomingMsg.createdAt,
              lastMessagePreview: incomingMsg.content,
              isRead: incomingMsg.conversationId === activeConversationIdRef.current
            };
          }
          return conv;
        });

        if (!isExistingChat) {
          loadConversationsRef.current(0, 20);
        }

        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    });

    eventSource.onerror = () => {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.warn('🔴 SSE CRM: Máximo de reintentos alcanzado. Cerrando conexión.');
        eventSource.close();
      } else {
        console.warn(`🟡 Intermitencia en SSE (intento ${retryCount}/${MAX_RETRIES}), el navegador reintentará...`);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [token]); // ← Solo depende del token: 1 conexión por sesión

  return {
    loading,
    error,

    // Estados Reactivos
    conversations,
    messages,
    activeConversationId,

    // Métodos
    getActiveConnections,
    getAuthUrl,
    disconnectPlatform,
    generateText,
    generateImage,
    generateVideo,
    schedulePost,
    getScheduledPosts,
    cancelPost,
    loadConversations,
    loadMessages,
    sendCrmMessage,
    getAnalyticsDashboard
  };
};