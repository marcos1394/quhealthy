// types/social.ts
// =================================================================
// ENUMS & TIPOS LITERALES
// =================================================================

export type SocialPlatform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'WHATSAPP'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'GOOGLE_BUSINESS';

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'UNKNOWN';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'RECEIVED';
export type PostStatus = 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type AiTone = 'professional' | 'friendly' | 'educational' | 'promotional';
export type AiSuggestionTone = 'friendly' | 'professional' | 'promotional';

// =================================================================
// PAGINACIÓN GENÉRICA (Spring Page)
// =================================================================

export interface SpringPage<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
}

// =================================================================
// 1. CONEXIONES OAuth
// =================================================================

/** Alineado con SocialConnectionResponse.java del backend */
export interface SocialConnectionDTO {
  id: string;                    // UUID
  platform: SocialPlatform;
  platformUserName: string;
  profileImageUrl?: string;
  connected: boolean;          // ✅ era 'connected' — el backend devuelve 'isConnected'
  connectedAt?: string;          // ISO-8601
}

export interface AuthUrlResponse {
  url: string;
}

// =================================================================
// 2. GENERACIÓN CON IA
// =================================================================

// ── Texto ──────────────────────────────────────────────────────────

export interface AiTextRequest {
  topic: string;
  tone: AiTone;
  targetAudience: string;
  platform: SocialPlatform;
  sessionId?: string;            // Para conversaciones multi-turn con historial
}

export interface AiTextResponse {
  generatedText: string;
  sessionId?: string;
  usedModel?: string;
}

// ── Imagen ─────────────────────────────────────────────────────────

export interface AiImageRequest {
  topic: string;
  tone?: AiTone;
  targetAudience?: string;
  platform?: SocialPlatform;
  additionalPrompt?: string;
}

export interface AiImageResponse {
  imageUrl: string;
  generatedText?: string;
  sessionId?: string;
  usedModel?: string;
}

// ── Video ──────────────────────────────────────────────────────────

export interface AiVideoRequest {
  topic: string;
  sessionId?: string;
  platform?: SocialPlatform;
  targetAudience?: string;
  tone?: AiTone;
  imageUrl?: string;             // Para image-to-video
  aspectRatio?: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';
  resolution?: string;
}

/** Backend devuelve 202 ACCEPTED — no hay videoUrl todavía */
export interface AiVideoResponse {
  status: 'PROCESSING';
  sessionId: string;
  message: string;
}

// ── SSE Video Ready (llega por el stream, no por HTTP) ─────────────

export interface SseVideoReadyPayload {
  videoUrl: string;
  sessionId: string;
  status: 'SUCCESS';
  message?: string;
}

export interface SseVideoErrorPayload {
  sessionId: string;
  status: 'ERROR';
  message: string;
}

// =================================================================
// 3. SCHEDULER DE POSTS
// =================================================================

/**
 * Alineado con SchedulePostRequest.java del backend.
 * El backend necesita el UUID de la conexión, no la plataforma.
 */
export interface SchedulePostRequest {
  socialConnectionId: string;    // ✅ UUID — era 'platform: SocialPlatform'
  content: string;
  mediaUrls?: string[];
  scheduledAt: string;           // ISO-8601
  generatedByAi?: boolean;
}

/** Alineado con ScheduledPost.java (entidad) */
export interface ScheduledPostDTO {
  id: string;                    // UUID
  socialConnectionId?: string;   // UUID de la conexión usada
  platform?: SocialPlatform;     // Puede venir desnormalizado desde el backend
  content: string;
  mediaUrls?: string[];
  scheduledAt: string;           // ISO-8601
  status: PostStatus;
  generatedByAi?: boolean;
  errorMessage?: string;
  createdAt?: string;
}

// =================================================================
// 4. CRM OMNICANAL
// =================================================================

/** Alineado con ConversationResponse.java del backend */
export interface ConversationDTO {
  id: string;                    // UUID
  platform: SocialPlatform;
  contactName: string;
  externalContactId: string;
  lastMessageAt: string;         // ISO-8601
  isRead: boolean;
  lastMessage?: string;          // ✅ era 'lastMessagePreview'
  unreadCount?: number;          // ✅ nuevo — viene del backend
}

/** Alineado con MessageResponse.java del backend */
export interface MessageDTO {
  id: string;                    // UUID
  direction: MessageDirection;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: string;             // ISO-8601
}

export interface SendMessageRequest {
  type: MessageType;
  content?: string;
  mediaUrl?: string;
}

// ── Sugerencias IA para el CRM ─────────────────────────────────────

/** Alineado con AiSuggestRequest.java */
export interface AiSuggestRequest {
  conversationId: string;        // UUID
  preferredTone?: AiSuggestionTone;
}

/** Alineado con AiSuggestResponse.java */
export interface AiSuggestResponse {
  suggestions: AiSuggestion[];
}

export interface AiSuggestion {
  tone: AiSuggestionTone;
  text: string;
}

// =================================================================
// 5. ANALÍTICAS (Dashboard)
// =================================================================

/** Alineado con AnalyticsDashboardResponse.DailyMetric del backend */
export interface DailyMetricDTO {
  date: string;                  // formato 'yyyy-MM-dd'
  views: number;
  engagement: number;
}

/** Alineado con AnalyticsDashboardResponse.java del backend */
export interface AnalyticsDashboardDTO {
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  chartData: DailyMetricDTO[];
}