import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useSessionStore } from '@/stores/SessionStore';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';

export const useStompTeleconsultation = (onSignalingMessage: (msg: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);
  const { token } = useSessionStore();
  const { teleconsultationId } = useTeleconsultationStore();

  const connect = useCallback(() => {
    if (!teleconsultationId || !token) return;

    // 🚀 La conexión STOMP usa WebSockets (ws:// o wss://), por lo que no puede pasar por Axios (http://).
    // Construimos la URL apuntando al endpoint configurado en WebSocketConfig.java
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/appointments/teleconsultation/ws';
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.debug('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to STOMP');
      
      // Suscripción a mensajes dirigidos (Señalización WebRTC)
      client.subscribe('/user/queue/teleconsultation', (message) => {
        const body = JSON.parse(message.body);
        onSignalingMessage(body);
      });

      // Suscripción a eventos de sala generales (Opcional, si mantenemos el topic para START/FINISH)
      client.subscribe(`/topic/teleconsultation/${teleconsultationId}`, (message) => {
        const body = JSON.parse(message.body);
        onSignalingMessage(body);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

  }, [teleconsultationId, token, onSignalingMessage]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  }, []);

  const sendSignalingMessage = useCallback((message: any) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/teleconsultation/${teleconsultationId}/signal`,
        body: JSON.stringify(message)
      });
    } else {
      console.warn("STOMP not connected, cannot send message");
    }
  }, [teleconsultationId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, sendSignalingMessage };
};
