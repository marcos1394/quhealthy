// types/social.ts

// =================================================================
// ENUMS & TIPOS LITERALES
// =================================================================
export type SocialPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'LINKEDIN' | 'YOUTUBE' | 'GOOGLE_BUSINESS';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'UNKNOWN';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'RECEIVED';
export type PostStatus = 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type AiModelType = 'TEXT' | 'IMAGE' | 'VIDEO';

// =================================================================
// PAGINACIÓN GENÉRICA
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
// 1. CONEXIONES (OAuth)
// =================================================================
export interface SocialConnectionDTO {
  id: string;
  platform: SocialPlatform;
  platformUserName: string;
  profileImageUrl?: string;
  connected: boolean;
  connectedAt?: string;
  tokenExpiresAt?: string;
}

export interface AuthUrlResponse {
  url: string;
}

// =================================================================
// 2. GENERACIÓN CON IA (Alineado con AiController)
// =================================================================
export interface AiTextRequest {
  topic: string;
  tone: string;
  targetAudience: string;
  platform: SocialPlatform;
}

export interface AiTextResponse {
  generatedText: string;
  sessionId?: string;
  usedModel?: string;
}

export interface AiImageRequest {
  topic: string;
  tone: string;
  targetAudience: string;
  platform: SocialPlatform;
}

export interface AiImageResponse {
  imageUrl: string;
  generatedText?: string;
  sessionId?: string;
  usedModel?: string;
}

export interface AiVideoRequest {
  topic: string;
  sessionId?: string;
  platform?: SocialPlatform;
  targetAudience?: string;
  tone?: string;
  imageUrl?: string;
  aspectRatio?: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';
  resolution?: string;
}

export interface AiVideoResponse {
  videoUrl?: string;
  status: string;
  message?: string;
  sessionId?: string;
}

export interface SchedulePostRequest {
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  scheduledAt: string; // ISO-8601
}

export interface ScheduledPostDTO {
  mediaUrls: string[];
  id: string;
  platform: SocialPlatform;
  content: string;
  scheduledAt: string;
  status: PostStatus;
  errorMessage?: string;
}

// =================================================================
// 3. CRM OMNICANAL
// =================================================================
export interface ConversationDTO {
  id: string;
  platform: SocialPlatform;
  contactName: string;
  externalContactId: string;
  lastMessageAt: string;
  isRead: boolean;
  lastMessagePreview?: string;
}

export interface MessageDTO {
  id: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface SendMessageRequest {
  type: MessageType;
  content?: string;
  mediaUrl?: string;
}

// =================================================================
// 4. ANALÍTICAS (Dashboard)
// =================================================================
export interface DailyMetricDTO {
  date: string;
  views: number;
  engagement: number;
}

export interface AnalyticsDashboardDTO {
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  chartData: DailyMetricDTO[];
}