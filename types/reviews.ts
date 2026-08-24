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
    staffMemberId?: number;
    rating: number;
    ratingPunctuality?: number;
    ratingCommunication?: number;
    ratingKnowledge?: number;
    ratingFacilities?: number;
    comment: string;
    isAnonymous?: boolean;
}

export interface ReplyReviewPayload {
    responseText: string;
}

export interface Review {
    id: number;
    consumerId: number;
    consumerName?: string;
    consumerAvatarUrl?: string;
    providerId: number;
    serviceId?: number;
    serviceName?: string;
    productId?: number;
    packageId?: number;
    staffMemberId?: number;
    rating: number;
    ratingPunctuality?: number;
    ratingCommunication?: number;
    ratingKnowledge?: number;
    ratingFacilities?: number;
    comment: string;
    appointmentId?: number;
    isVerified: boolean;
    moderationStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
    providerResponse?: string;
    responseAt?: string;
    createdAt: string;
    updatedAt: string;
    isEdited?: boolean;
}

export interface ProviderReviewStats {
    averageRating: number;
    totalReviews: number;
    verifiedReviewCount?: number;
    avgPunctuality?: number;
    avgCommunication?: number;
    avgKnowledge?: number;
    avgFacilities?: number;
    distribution?: Record<number, number>;
}