// src/types/reviews.ts

export interface ReviewContext {
    appointmentId?: number; // Opcional, para legacy SERVICE
    consumerId: number;
    providerId: number;
    entityType?: 'SERVICE' | 'PRODUCT' | 'PACKAGE' | 'ORDER';
    entityId?: number;
    transactionId?: number; // orderItemId o appointmentId
}

export interface CreateReviewPayload {
    providerId: number;
    appointmentId?: number;
    orderItemId?: number;
    serviceId?: number;
    productId?: number;
    packageId?: number;
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