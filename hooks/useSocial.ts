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
  AiSuggestRequest,
  AiSuggestResponse,
  AiSuggestionTone,
  AnalyticsDashboardDTO,
  SpringPage,
} from '@/types/social';

// =================================================================
// INTERFAZ PÚBLICA DEL HOOK
// =================================================================

export interface UseSocialReturn {
  loading: boolean;
  error: string | null;

  // ── Estado reactivo CRM ─────────────────────────────────────────
  conversations: ConversationDTO[];
  messages: MessageDTO[];
  activeConversationId: string | null;

  // ── SSE: Video Ready ────────────────────────────────────────────
  sseVideoUrl: string | null;
  clearSseVideoUrl: () => void;

  // ── Conexiones OAuth ────────────────────────────────────────────
  connections: SocialConnectionDTO[];
  loadConnections: () => Promise<void>;
  getAuthUrl: (platform: string) => Promise<AuthUrlResponse>;
  /** ✅ Recibe el UUID de la conexión, no el nombre de plataforma */
  disconnectConnection: (connectionId: string) => Promise<void>;

  // ── IA ──────────────────────────────────────────────────────────
  generateText: (data: AiTextRequest) => Promise<AiTextResponse>;
  generateImage: (data: AiImageRequest) => Promise<AiImageResponse>;
  generateVideo: (data: AiVideoRequest) => Promise<AiVideoResponse>;

  // ── Scheduler ───────────────────────────────────────────────────
  schedulePost: (data: SchedulePostRequest) => Promise<{ message: string; postId: string }>;
  getScheduledPosts: (page?: number, size?: number) => Promise<SpringPage<ScheduledPostDTO>>;
  cancelPost: (id: string) => Promise<void>;

  // ── CRM ─────────────────────────────────────────────────────────
  loadConversations: (page?: number, size?: number) => Promise<void>;
  loadMessages: (conversationId: string, page?: number, size?: number) => Promise<void>;
  sendMessage: (conversationId: string, data: SendMessageRequest) => Promise<MessageDTO>;

  // ── Sugerencias IA CRM ──────────────────────────────────────────
  getAiReplySuggestions: (
    conversationId: string,
    preferredTone?: AiSuggestionTone
  ) => Promise<AiSuggestResponse>;

  // ── Analíticas ──────────────────────────────────────────────────
  getAnalyticsDashboard: () => Promise<AnalyticsDashboardDTO>;
}

// =================================================================
// CONSTANTES SSE
// =================================================================

/** URL directa a Cloud Run — bypassa Firebase que no soporta SSE */
const SSE_BASE_URL = 'https://social-service-629639328783.us-central1.run.app';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

// =================================================================
// HOOK
// =================================================================

export const useSocial = (): UseSocialReturn => {

  // ── Estado general ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Conexiones ──────────────────────────────────────────────────
  const [connections, setConnections] = useState<SocialConnectionDTO[]>([]);

  // ── CRM ─────────────────────────────────────────────────────────
  const [conversations, setConversations]           = useState<ConversationDTO[]>([]);
  const [messages, setMessages]                     = useState<MessageDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // ── SSE ─────────────────────────────────────────────────────────
  const [sseVideoUrl, setSseVideoUrl] = useState<string | null>(null);
  const clearSseVideoUrl = useCallback(() => setSseVideoUrl(null), []);

  // ── Zustand ─────────────────────────────────────────────────────
  const token = useSessionStore((state) => state.token);

  // ── Refs estables para SSE ──────────────────────────────────────
  // Evitan re-crear la conexión SSE en cada cambio de estado
  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  const loadConversationsRef = useRef<(page?: number, size?: number) => Promise<void>>(null!);

  // =================================================================
  // MANEJO CENTRALIZADO DE ERRORES
  // =================================================================

  const handleError = useCallback((err: any): never => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Ocurrió un error inesperado en el módulo social';
    setError(msg);
    throw new Error(msg);
  }, []);

  // =================================================================
  // 1. CONEXIONES OAuth
  // =================================================================

  const loadConnections = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await socialService.getActiveConnections();
      setConnections(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getAuthUrl = useCallback(async (platform: string) => {
    setLoading(true); setError(null);
    try {
      return await socialService.getAuthUrl(platform);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * ✅ CORREGIDO: recibe UUID de conexión, no nombre de plataforma.
   * Actualiza el estado local quitando la conexión desvinculada.
   */
  const disconnectConnection = useCallback(async (connectionId: string) => {
    setLoading(true); setError(null);
    try {
      await socialService.disconnectConnection(connectionId);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // =================================================================
  // 2. GENERACIÓN CON IA
  // =================================================================

  const generateText = useCallback(async (data: AiTextRequest) => {
    setLoading(true); setError(null);
    try {
      return await socialService.generateText(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const generateImage = useCallback(async (data: AiImageRequest) => {
    setLoading(true); setError(null);
    try {
      return await socialService.generateImage(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const generateVideo = useCallback(async (data: AiVideoRequest) => {
    setLoading(true); setError(null);
    try {
      return await socialService.generateVideo(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // =================================================================
  // 3. SCHEDULER DE POSTS
  // =================================================================

  const schedulePost = useCallback(async (data: SchedulePostRequest) => {
    setLoading(true); setError(null);
    try {
      return await socialService.schedulePost(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getScheduledPosts = useCallback(async (page = 0, size = 20) => {
    setLoading(true); setError(null);
    try {
      return await socialService.getScheduledPosts(page, size);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const cancelPost = useCallback(async (id: string) => {
    setLoading(true); setError(null);
    try {
      await socialService.cancelPost(id);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // =================================================================
  // 4. CRM OMNICANAL
  // =================================================================

  const loadConversations = useCallback(async (page = 0, size = 20) => {
    setLoading(true); setError(null);
    try {
      const res = await socialService.getConversations(page, size);
      setConversations(res.content);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadMessages = useCallback(async (
    conversationId: string,
    page = 0,
    size = 50
  ) => {
    setLoading(true); setError(null);
    setActiveConversationId(conversationId);
    try {
      const res = await socialService.getMessages(conversationId, page, size);
      // Spring devuelve DESC (más reciente primero), invertimos para la UI
      setMessages([...res.content].reverse());
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const sendMessage = useCallback(async (
    conversationId: string,
    data: SendMessageRequest
  ) => {
    setLoading(true); setError(null);
    try {
      const msg = await socialService.sendMessage(conversationId, data);

      // Inyectamos el mensaje inmediatamente en la UI del chat
      setMessages((prev) => [...prev, msg]);

      // Actualizamos el inbox subiendo el chat al tope
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, lastMessageAt: msg.createdAt, lastMessage: msg.content }
            : conv
        );
        return updated.sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });

      return msg;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // =================================================================
  // 5. SUGERENCIAS IA PARA EL CRM
  // =================================================================

  const getAiReplySuggestions = useCallback(async (
    conversationId: string,
    preferredTone?: AiSuggestionTone
  ): Promise<AiSuggestResponse> => {
    // No activamos loading global — el SocialInbox tiene su propio estado
    // para no bloquear el chat mientras se generan las sugerencias
    setError(null);
    try {
      const request: AiSuggestRequest = { conversationId, preferredTone };
      return await socialService.getAiReplySuggestions(request);
    } catch (err) {
      return handleError(err);
    }
  }, [handleError]);

  // =================================================================
  // 6. ANALÍTICAS
  // =================================================================

  const getAnalyticsDashboard = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      return await socialService.getAnalyticsDashboard();
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Mantener siempre la ref del loadConversations actualizada
  loadConversationsRef.current = loadConversations;

  // =================================================================
  // 🔌 TIEMPO REAL (SSE)
  // Firebase no soporta SSE — conectamos directo a Cloud Run.
  // Reconexión manual en onerror + recovery de videos al montar.
  // =================================================================

  useEffect(() => {
    if (!token) return;

    let retryCount = 0;
    let currentEventSource: EventSource | null = null;
    let isCancelled = false;

    const connectSSE = () => {
      if (isCancelled) return;

      const es = new EventSource(
        `${SSE_BASE_URL}/api/social/crm/stream?token=${token}`
      );
      currentEventSource = es;

      // ✅ Handshake confirmado
      es.addEventListener('CONNECTED', () => {
        console.log('🟢 Túnel SSE CRM Activo (Cloud Run directo)');
        retryCount = 0;
      });

      // 💬 Nuevo mensaje entrante en el CRM
      es.addEventListener('NEW_MESSAGE', (event) => {
        try {
          const incomingMsg: MessageDTO & { conversationId?: string } = JSON.parse(event.data);

          // Añadir al chat si es la conversación activa
          setMessages((prev) => {
            if (incomingMsg.conversationId === activeConversationIdRef.current) {
              return [...prev, incomingMsg];
            }
            return prev;
          });

          // Actualizar inbox
          setConversations((prev) => {
            let found = false;
            const updated = prev.map((conv) => {
              if (conv.id === incomingMsg.conversationId) {
                found = true;
                return {
                  ...conv,
                  lastMessageAt: incomingMsg.createdAt,
                  lastMessage: incomingMsg.content,
                  isRead: incomingMsg.conversationId === activeConversationIdRef.current,
                };
              }
              return conv;
            });

            // Si es una conversación nueva que no está en el inbox, recargamos
            if (!found) loadConversationsRef.current(0, 20);

            return updated.sort(
              (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
          });
        } catch (e) {
          console.warn('[SSE] Error parsing NEW_MESSAGE:', e);
        }
      });

      // 🎬 Video listo — llega cuando Veo terminó de renderizar
      es.addEventListener('VIDEO_READY', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🎬 VIDEO_READY recibido:', data);
          if (data.videoUrl) setSseVideoUrl(data.videoUrl);
        } catch (e) {
          console.warn('[SSE] Error parsing VIDEO_READY:', e);
        }
      });

      // ❌ Error en la generación del video
      es.addEventListener('VIDEO_ERROR', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.warn('❌ VIDEO_ERROR recibido:', data);
          setSseVideoUrl(null);
        } catch (e) {
          console.warn('[SSE] Error parsing VIDEO_ERROR:', e);
        }
      });

      // 🔄 Reconexión automática con backoff
      es.onerror = () => {
        es.close();
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          console.warn('🔴 SSE CRM: Máximo de reintentos alcanzado. Cerrando conexión.');
          return;
        }
        console.warn(
          `🟡 SSE caído (intento ${retryCount}/${MAX_RETRIES}). Reconectando en ${RETRY_DELAY_MS / 1000}s...`
        );
        setTimeout(connectSSE, RETRY_DELAY_MS);
      };
    };

    // 🚀 Iniciar conexión SSE
    connectSSE();

    // 🔍 Recovery: videos pendientes que se generaron con el SSE caído
    // Usamos fetch directo con el token (no axiosInstance) porque necesitamos
    // apuntar al Cloud Run URL directamente, no a Firebase
    const checkPendingVideo = async () => {
      try {
        const response = await fetch(
          `${SSE_BASE_URL}/api/social/ai/video-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const videoData = await response.json();
          if (videoData?.videoUrl) {
            console.log('🔍 Video pendiente recuperado:', videoData.videoUrl);
            setSseVideoUrl(videoData.videoUrl);
          }
        }
      } catch {
        // Silencioso — 404 es normal cuando no hay video pendiente
      }
    };
    checkPendingVideo();

    return () => {
      isCancelled = true;
      currentEventSource?.close();
    };
  }, [token]);

  // =================================================================
  // RETORNO PÚBLICO DEL HOOK
  // =================================================================

  return {
    loading,
    error,

    // Conexiones
    connections,
    loadConnections,
    getAuthUrl,
    disconnectConnection,

    // Estado reactivo CRM
    conversations,
    messages,
    activeConversationId,

    // SSE
    sseVideoUrl,
    clearSseVideoUrl,

    // IA
    generateText,
    generateImage,
    generateVideo,

    // Scheduler
    schedulePost,
    getScheduledPosts,
    cancelPost,

    // CRM
    loadConversations,
    loadMessages,
    sendMessage,

    // Sugerencias IA CRM
    getAiReplySuggestions,

    // Analíticas
    getAnalyticsDashboard,
  };
};