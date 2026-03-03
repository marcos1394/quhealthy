// src/services/review.service.ts
import axiosInstance from '@/lib/axios';
import { 
    ReviewContext, 
    CreateReviewPayload, 
    Review, 
    ProviderReviewStats,
    ReplyReviewPayload
} from '@/types/reviews';

const BASE_URL = '/api/reviews';

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

/**
 * Servicio encargado de la gestión de Reseñas y Reputación.
 */
export const reviewService = {
    
    /**
     * 🔐 Desencripta el token del correo para obtener el contexto de la cita.
     */
    verifyToken: async (token: string): Promise<ReviewContext> => {
        const response = await axiosInstance.get<ReviewContext>(`${BASE_URL}/verify-token/${token}`);
        return response.data;
    },

    /**
     * ⭐ Crea una nueva reseña (Paciente)
     * Requiere que el interceptor de Axios inyecte el JWT del paciente.
     */
    createReview: async (payload: CreateReviewPayload): Promise<Review> => {
        const response = await axiosInstance.post<Review>(`${BASE_URL}`, payload);
        return response.data;
    },

    /**
     * 📊 Obtiene las reseñas aprobadas de un doctor (Público)
     */
    getProviderReviews: async (providerId: number | string, page = 0, size = 10): Promise<PageResponse<Review>> => {
        const response = await axiosInstance.get<PageResponse<Review>>(`${BASE_URL}/provider/${providerId}`, {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return response.data;
    },

    /**
     * 📈 Obtiene el promedio de estrellas y total de reseñas (Público)
     */
    getProviderStats: async (providerId: number | string): Promise<ProviderReviewStats> => {
        const response = await axiosInstance.get<ProviderReviewStats>(`${BASE_URL}/provider/${providerId}/stats`);
        return response.data;
    },

    /**
     * 💬 Responde a una reseña existente (Solo Doctores)
     */
    replyToReview: async (reviewId: number, payload: ReplyReviewPayload): Promise<Review> => {
        const response = await axiosInstance.post<Review>(`${BASE_URL}/${reviewId}/reply`, payload);
        return response.data;
    }
};