// src/hooks/useCrmStream.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { socialService } from '@/services/social.service';
import { useSessionStore } from '@/stores/SessionStore';

/**
 * STREAM-SEC-01: Resuelve la URL base del servicio social dinámicamente desde variables de entorno.
 * Erradica orígenes cableados a Cloud Run o URLs fijas en el cliente.
 */
export const getStreamBaseUrl = (): string => {
  const customUrl = process.env.NEXT_PUBLIC_SOCIAL_SERVICE_URL;
  if (customUrl) return customUrl.replace(/\/$/, '');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.replace(/\/$/, '');
  return '';
};

export interface CrmStreamEventHandlers {
  onConnected?: () => void;
  onNewMessage?: (data: any) => void;
  onVideoReady?: (data: { videoUrl: string }) => void;
  onVideoError?: (data: any) => void;
  onRawMessage?: (event: MessageEvent) => void;
  onError?: (err: any) => void;
}

export interface UseCrmStreamOptions extends CrmStreamEventHandlers {
  enabled?: boolean;
  maxRetries?: number;
}

export interface UseCrmStreamReturn {
  isStreamConnected: boolean;
  isStreamDegraded: boolean;
  reconnect: () => void;
}

const DEFAULT_MAX_RETRIES = 5;

/**
 * STREAM-SEC-01: Hook canónico y compartido para streaming administrativo SSE.
 * - Adquiere un ticket efímero de un solo uso (30s TTL) para cada conexión o reconexión.
 * - NUNCA expone el JWT de sesión en URLs, query params ni logs.
 * - Implementa backoff exponencial solicitando un nuevo ticket en cada intento.
 * - Gestiona estados visibles de degradación sin simular falso tiempo real.
 */
export const useCrmStream = (options: UseCrmStreamOptions = {}): UseCrmStreamReturn => {
  const {
    enabled = true,
    maxRetries = DEFAULT_MAX_RETRIES,
    onConnected,
    onNewMessage,
    onVideoReady,
    onVideoError,
    onRawMessage,
    onError,
  } = options;

  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [isStreamDegraded, setIsStreamDegraded] = useState(false);

  const token = useSessionStore((state) => state.token);

  // Mantener handlers en ref estable para evitar reconexiones innecesarias
  const handlersRef = useRef<CrmStreamEventHandlers>({
    onConnected,
    onNewMessage,
    onVideoReady,
    onVideoError,
    onRawMessage,
    onError,
  });

  handlersRef.current = {
    onConnected,
    onNewMessage,
    onVideoReady,
    onVideoError,
    onRawMessage,
    onError,
  };

  const reconnectTriggerRef = useRef(0);
  const [, setTrigger] = useState(0);
  const reconnect = useCallback(() => {
    reconnectTriggerRef.current++;
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!token || !enabled) {
      setIsStreamConnected(false);
      setIsStreamDegraded(false);
      return;
    }

    let retryCount = 0;
    let currentEventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const connectSSE = async () => {
      if (isCancelled) return;

      try {
        // 🎟️ Adquirir ticket efímero de un solo uso (TTL: 30s)
        const { ticket } = await socialService.getStreamTicket();
        if (isCancelled) return;

        const baseUrl = getStreamBaseUrl();
        const sseUrl = `${baseUrl}/api/social/crm/stream?ticket=${encodeURIComponent(ticket)}`;

        const es = new EventSource(sseUrl);
        currentEventSource = es;

        // Listener genérico onmessage
        es.onmessage = (event) => {
          if (isCancelled) return;
          handlersRef.current.onRawMessage?.(event);
          try {
            const data = JSON.parse(event.data);
            if (data) {
              handlersRef.current.onNewMessage?.(data);
            }
          } catch (e) {
            // No-op si no es JSON
          }
        };

        // Handshake confirmado
        es.addEventListener('CONNECTED', () => {
          if (isCancelled) return;
          retryCount = 0;
          setIsStreamConnected(true);
          setIsStreamDegraded(false);
          handlersRef.current.onConnected?.();
        });

        // 💬 Nuevo mensaje entrante en el CRM
        es.addEventListener('NEW_MESSAGE', (event: any) => {
          if (isCancelled) return;
          try {
            const incomingMsg = JSON.parse(event.data);
            handlersRef.current.onNewMessage?.(incomingMsg);
          } catch (e) {
            console.warn('[SSE] Error parsing NEW_MESSAGE:', e);
          }
        });

        // 🎬 Video listo
        es.addEventListener('VIDEO_READY', (event: any) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            handlersRef.current.onVideoReady?.(data);
          } catch (e) {
            console.warn('[SSE] Error parsing VIDEO_READY:', e);
          }
        });

        // ❌ Error en la generación del video
        es.addEventListener('VIDEO_ERROR', (event: any) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            handlersRef.current.onVideoError?.(data);
          } catch (e) {
            console.warn('[SSE] Error parsing VIDEO_ERROR:', e);
          }
        });

        // 🔄 Reconexión automática con backoff exponencial solicitando un nuevo ticket
        es.onerror = (err) => {
          es.close();
          currentEventSource = null;
          setIsStreamConnected(false);
          setIsStreamDegraded(true);
          handlersRef.current.onError?.(err);

          if (isCancelled) return;

          retryCount++;
          if (retryCount >= maxRetries) {
            console.warn('🔴 SSE CRM: Máximo de reintentos alcanzado. Modo degradado.');
            return;
          }

          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 15000);
          reconnectTimeout = setTimeout(connectSSE, backoffDelay);
        };
      } catch (ticketErr) {
        handlersRef.current.onError?.(ticketErr);
        setIsStreamConnected(false);
        setIsStreamDegraded(true);

        if (isCancelled) return;

        retryCount++;
        if (retryCount < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 15000);
          reconnectTimeout = setTimeout(connectSSE, backoffDelay);
        }
      }
    };

    connectSSE();

    return () => {
      isCancelled = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (currentEventSource) {
        currentEventSource.close();
        currentEventSource = null;
      }
      setIsStreamConnected(false);
    };
  }, [token, enabled, maxRetries, reconnectTriggerRef.current]);

  return {
    isStreamConnected,
    isStreamDegraded,
    reconnect,
  };
};
