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
// 2. CONTENIDO E IA (Scheduler)
// =================================================================
export interface GeneratePostRequest {
  topic: string;
  tone: string;
  targetAudience: string;
  platform: SocialPlatform;
  modelType: AiModelType;
}

export interface GeneratePostResponse {
  generatedContent: string;
  mediaUrls?: string[];
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