export interface Conversation {
    id: string;
    patientId: number;
    providerId: number;
    status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
    lastMessageAt: string;
    createdAt: string;
    
    // UI Helpers (En el futuro, el backend los poblará o los cruzaremos con los datos del provider)
    otherParticipantName?: string;
    lastMessagePreview?: string;
    unreadCount?: number;
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
    
    // Estado local de UI para mostrar los "palomitas" (checks) antes de que el server confirme
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