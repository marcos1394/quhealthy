// src/hooks/useChat.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { toast } from 'react-toastify';

import { useSessionStore } from '@/stores/SessionStore';
import { chatService } from '@/services/chat.service';
import { Conversation, ChatMessage, ChatMessageRequest } from '@/types/chat';

export const useChat = () => {
    const { user, token } = useSessionStore();
    
    // ==========================================================
    // 🗂️ ESTADOS DE UI Y DATOS
    // ==========================================================
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // ==========================================================
    // ⚡ ESTADOS Y REFERENCIAS DE WEBSOCKET
    // ==========================================================
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    // ==========================================================
    // 1. INICIALIZACIÓN (REST) Y CONEXIÓN WSS (TIEMPO REAL)
    // ==========================================================
    useEffect(() => {
        if (!token || !user) return;

        // 1. Cargar el Inbox inicial vía API REST
        setIsLoading(true);
        chatService.getInbox()
            .then(data => {
                setConversations(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("❌ Error cargando inbox:", err);
                toast.error("No se pudo cargar la bandeja de mensajes.");
                setIsLoading(false);
            });

        // 2. Configurar túnel STOMP Seguro para Producción
        // Utilizamos wss:// en producción por defecto
        const wsUrl =  'wss://quhealthy.org/api/appointments/ws/chat';
        
        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}` // 🔒 JWT Inyectado para interceptor Spring Boot
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            
            onConnect: () => {
                console.log("🟢 Conectado al Hub de Mensajería Clínica QuHealthy");
                setIsConnected(true);
            },
            
            onDisconnect: () => {
                console.log("🔴 Desconectado del Hub de Mensajería");
                setIsConnected(false);
            },
            
            onStompError: (frame) => {
                console.error("❌ Error STOMP de Producción:", frame.headers['message']);
                // Si el token expira, el backend cerrará la conexión aquí
                if (frame.headers['message']?.includes('No autorizado')) {
                    toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                }
            }
        });

        client.activate();
        stompClientRef.current = client;

        // Limpieza: Cerrar túnel si el componente se desmonta o el usuario cierra sesión
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [token, user]);

    // ==========================================================
    // 2. CAMBIO DE CHAT (Suscripción y Carga de Historial)
    // ==========================================================
    useEffect(() => {
        if (!selectedConversation || !stompClientRef.current || !isConnected || !user) return;

        const conversationId = selectedConversation.id;

        // 1. Cargar el historial previo vía REST
        chatService.getMessageHistory(conversationId)
            .then(pageResponse => {
                // Invertimos el array porque vienen DESC (más recientes primero)
                // y en UI queremos los viejos arriba y los nuevos abajo
                setMessages(pageResponse.content.reverse()); 
            })
            .catch(err => console.error("Error cargando historial", err));

        // 2. Suscribirse al canal STOMP de esta conversación específica
        const messageSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}`,
            (message: IMessage) => {
                const newMsg: ChatMessage = JSON.parse(message.body);
                
                setMessages(prev => {
                    // Evitar duplicados (si nosotros lo enviamos, actualizamos su estado local)
                    const exists = prev.some(m => m.id === newMsg.id || m.content === newMsg.content && m.status === 'sending');
                    if (exists) {
                        return prev.map(m => (m.id === newMsg.id || (m.content === newMsg.content && m.status === 'sending')) ? { ...newMsg, status: 'sent' } : m);
                    }
                    return [...prev, newMsg];
                });
            }
        );

        // 3. Suscribirse al canal de eventos de escritura (Typing)
        const typingSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}.typing`,
            (message: IMessage) => {
                const event = JSON.parse(message.body);
                if (event.senderId !== user.id) {
                    setIsTyping(event.isTyping);
                }
            }
        );

        // 4. Suscribirse al canal de recibos de lectura (Doble check azul)
        const readReceiptSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}.read`,
            (message: IMessage) => {
                // Si la otra persona leyó, actualizamos nuestros mensajes enviados
                setMessages(prev => prev.map(m => 
                    (m.senderId === user.id && !m.isRead) ? { ...m, isRead: true, status: 'read' } : m
                ));
            }
        );

        // 5. Notificar automáticamente al backend que hemos abierto el chat (marcar leídos)
        stompClientRef.current.publish({
            destination: `/app/chat/${conversationId}/read`
        });

        // Limpieza: Al cambiar de chat, nos desuscribimos de estos canales
        return () => {
            messageSubscription.unsubscribe();
            typingSubscription.unsubscribe();
            readReceiptSubscription.unsubscribe();
        };
    }, [selectedConversation, isConnected, user]);

    // ==========================================================
    // 3. ACCIONES DEL USUARIO (Enviar Mensajes y Eventos)
    // ==========================================================
    
    const sendMessage = useCallback((content: string, vaultDocumentId?: string) => {
        if (!selectedConversation || !stompClientRef.current || !isConnected || !user) {
            toast.warn("Esperando conexión segura...");
            return;
        }

        const request: ChatMessageRequest = { content, vaultDocumentId };

        // 1. UX Optimista: Mostrar el mensaje en UI instantáneamente (status 'sending')
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: user.id,
            senderRole: 'PATIENT', // Asumido desde el portal de pacientes
            messageType: vaultDocumentId ? 'VAULT_DOCUMENT' : 'TEXT',
            content,
            isRead: false,
            createdAt: new Date().toISOString(),
            status: 'sending'
        };
        
        setMessages(prev => [...prev, optimisticMsg]);

        // 2. Disparar el mensaje a través del túnel seguro de Spring Boot
        stompClientRef.current.publish({
            destination: `/app/chat/${selectedConversation.id}/send`,
            body: JSON.stringify(request)
        });

    }, [selectedConversation, isConnected, user]);

    const sendTypingEvent = useCallback((isTypingEvent: boolean) => {
        if (!selectedConversation || !stompClientRef.current || !isConnected || !user) return;

        stompClientRef.current.publish({
            destination: `/app/chat/${selectedConversation.id}/typing`,
            body: JSON.stringify({ senderId: user.id, isTyping: isTypingEvent })
        });
    }, [selectedConversation, isConnected, user]);

    return {
        conversations,
        messages,
        selectedConversation,
        setSelectedConversation,
        isLoading,
        isConnected,
        isTyping,
        sendMessage,
        sendTypingEvent
    };
};