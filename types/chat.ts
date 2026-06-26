export interface Conversation {
    id: string;
    patientId: number;
    providerId: number;
    status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
    lastMessageAt: string;
    createdAt: string;
    otherParticipantName?: string;
    otherParticipantImage?: string;
    otherParticipantSpecialty?: string;
    lastMessagePreview?: string;
    unreadCount?: number;
    // 🟢 NUEVO: Presencia en tiempo real
    otherParticipantOnline?: boolean;
    otherParticipantLastSeenAt?: string;
    provider?: {
        name: string;
        specialty?: string;
        image?: string;
        online?: boolean;
    };
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: number;
    senderRole: 'PATIENT' | 'PROVIDER' | 'SYSTEM';
    messageType: 'TEXT' | 'VAULT_DOCUMENT' | 'SYSTEM';
    content: string;
    vaultDocumentId?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatMessageRequest {
    content: string;
    vaultDocumentId?: string;
}

export interface ChatTypingEvent {
    senderId: number;
    isTyping: boolean;
}

// 🟢 NUEVO
export interface PresenceEvent {
    userId: number;
    online: boolean;
    lastSeenAt?: string;
}

// 🟢 NUEVO: evento del canal de inbox por usuario
export interface InboxUpdateEvent {
    conversationId: string;
    senderId: number;
    lastMessagePreview: string;
    lastMessageAt: string;
}