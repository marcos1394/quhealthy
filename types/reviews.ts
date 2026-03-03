// src/types/reviews.ts

export interface ReviewContext {
    appointmentId: number;
    consumerId: number;
    providerId: number;
}

export interface CreateReviewPayload {
    providerId: number;
    appointmentId: number;
    serviceId?: number;
    rating: number;
    comment: string;
}

export interface ReplyReviewPayload {
    responseText: string;
}

export interface Review {
    id: number;
    consumerId: number;
    providerId: number;
    serviceId?: number;
    rating: number;
    comment: string;
    appointmentId?: number;
    isVerified: boolean;
    moderationStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
    providerResponse?: string;
    responseAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProviderReviewStats {
    averageRating: number;
    totalReviews: number;
}