import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

import { useSessionStore } from '@/stores/SessionStore';
import { chatService } from '@/services/chat.service';
import { Conversation, ChatMessage, ChatMessageRequest, PresenceEvent, InboxUpdateEvent } from '@/types/chat';

export const useChat = () => {
    const { user, token } = useSessionStore();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    // 🟢 NUEVO: ref sincronizado con selectedConversation. La suscripción de
    // inbox vive mientras dure la conexión (no se reabre por cada chat que
    // abres), así que necesita esta referencia para saber, en cualquier
    // momento, si la conversación que recibió el mensaje es la que tienes
    // abierta — sin volver a montar el listener cada vez.
    const selectedConversationRef = useRef<Conversation | null>(null);
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // ==========================================================
    // 1. INICIALIZACIÓN (REST) Y CONEXIÓN WSS (TIEMPO REAL)
    // ==========================================================
    useEffect(() => {
        if (!token || !user) return;

        setIsLoading(true);
        chatService.getInbox()
            .then(data => {
                setConversations(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("❌ Error cargando inbox:", err);
                handleApiError(err);
                setIsLoading(false);
            });

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

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
                if (frame.headers['message']?.includes('No autorizado')) {
                    toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.");
                }
            }
        });

        client.activate();
        stompClientRef.current = client;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log("💤 Usuario inactivo. Pausando conexión WebSocket para ahorrar recursos...");
                client.deactivate();
            } else if (document.visibilityState === 'visible') {
                console.log("👋 Usuario regresó. Reconectando WebSocket...");
                client.activate();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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

        chatService.getMessageHistory(conversationId)
            .then(pageResponse => {
                setMessages(pageResponse.content.reverse());
            })
            .catch(err => console.error("Error cargando historial", err));

        const messageSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}`,
            (message: IMessage) => {
                const newMsg: ChatMessage = JSON.parse(message.body);

                setMessages(prev => {
                    const exists = prev.some(m => m.id === newMsg.id || m.content === newMsg.content && m.status === 'sending');
                    if (exists) {
                        return prev.map(m => (m.id === newMsg.id || (m.content === newMsg.content && m.status === 'sending')) ? { ...newMsg, status: 'sent' } : m);
                    }
                    return [...prev, newMsg];
                });
            }
        );

        const typingSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}.typing`,
            (message: IMessage) => {
                const event = JSON.parse(message.body);
                if (event.senderId !== user.id) {
                    setIsTyping(event.isTyping);
                }
            }
        );

        const readReceiptSubscription = stompClientRef.current.subscribe(
            `/topic/conversation.${conversationId}.read`,
            (message: IMessage) => {
                const { readerId } = JSON.parse(message.body);
                if (readerId === user.id) return;

                setMessages(prev => prev.map(m =>
                    (m.senderId === user.id && !m.isRead) ? { ...m, isRead: true, status: 'read' } : m
                ));
            }
        );

        stompClientRef.current.publish({
            destination: `/app/chat/${conversationId}/read`
        });

        // 🟢 NUEVO: al abrir el chat, reflejamos de inmediato en el sidebar
        // que ya no hay mensajes sin leer (optimista — el publish de arriba
        // ya actualizó la base de datos del lado del backend).
        setConversations(prev => prev.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ));

        return () => {
            messageSubscription.unsubscribe();
            typingSubscription.unsubscribe();
            readReceiptSubscription.unsubscribe();
        };
    }, [selectedConversation, isConnected, user]);

    // ==========================================================
    // 3. PRESENCIA (Última conexión / Online en tiempo real)
    // ==========================================================
    useEffect(() => {
        if (!selectedConversation || !stompClientRef.current || !isConnected || !user) return;

        const otherParticipantId = user.role === 'PROVIDER'
            ? selectedConversation.patientId
            : selectedConversation.providerId;

        const presenceSubscription = stompClientRef.current.subscribe(
            `/topic/user.${otherParticipantId}.presence`,
            (message: IMessage) => {
                const event: PresenceEvent = JSON.parse(message.body);

                setSelectedConversation(prev => prev ? {
                    ...prev,
                    otherParticipantOnline: event.online,
                    otherParticipantLastSeenAt: event.lastSeenAt,
                } : prev);

                setConversations(prev => prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, otherParticipantOnline: event.online, otherParticipantLastSeenAt: event.lastSeenAt }
                        : c
                ));
            }
        );

        return () => {
            presenceSubscription.unsubscribe();
        };
    }, [selectedConversation?.id, isConnected, user]);

    // ==========================================================
    // 4. INBOX EN VIVO (Contador + vista previa estilo WhatsApp)
    // ==========================================================
    // 🟢 NUEVO: a diferencia de las suscripciones #2 y #3 (atadas a la
    // conversación abierta), esta vive mientras dure la conexión completa
    // y escucha actividad de CUALQUIER conversación del usuario.
    useEffect(() => {
        if (!stompClientRef.current || !isConnected || !user) return;

        const inboxSubscription = stompClientRef.current.subscribe(
            `/topic/user.${user.id}.inbox`,
            (message: IMessage) => {
                const event: InboxUpdateEvent = JSON.parse(message.body);

                setConversations(prev => {
                    const isCurrentlyOpen = selectedConversationRef.current?.id === event.conversationId;
                    const isOwnMessage = event.senderId === user.id;

                    const updated = prev.map(c => {
                        if (c.id !== event.conversationId) return c;
                        return {
                            ...c,
                            lastMessagePreview: event.lastMessagePreview,
                            lastMessageAt: event.lastMessageAt,
                            // Solo incrementa el badge si NO es tu propio mensaje
                            // y NO tienes ese chat abierto en este momento.
                            unreadCount: (!isOwnMessage && !isCurrentlyOpen)
                                ? (c.unreadCount || 0) + 1
                                : c.unreadCount,
                        };
                    });

                    // Estilo WhatsApp: la conversación con actividad más reciente sube al tope.
                    return [...updated].sort((a, b) =>
                        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                    );
                });
            }
        );

        return () => {
            inboxSubscription.unsubscribe();
        };
    }, [isConnected, user]);

    // ==========================================================
    // 5. ENVIAR MENSAJES (Vía WS STOMP)
    // ==========================================================
    const sendMessage = useCallback((content: string, vaultDocumentId?: string) => {
        if (!selectedConversation || !stompClientRef.current || !isConnected || !user) {
            console.error("No se puede enviar el mensaje: falta conexión o conversación");
            return;
        }

        const msgReq: ChatMessageRequest = { content, vaultDocumentId };

        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: user.id,
            senderRole: user.role === 'PROVIDER' ? 'PROVIDER' : 'PATIENT',
            messageType: vaultDocumentId ? 'VAULT_DOCUMENT' : 'TEXT',
            content,
            vaultDocumentId,
            isRead: false,
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMsg]);

        stompClientRef.current.publish({
            destination: `/app/chat/${selectedConversation.id}/send`,
            body: JSON.stringify(msgReq)
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