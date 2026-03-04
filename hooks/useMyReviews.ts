// src/hooks/useMyReviews.ts
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useSessionStore } from '@/stores/SessionStore';
import { reviewService } from '@/services/review.service';
import { Review } from '@/types/reviews';

export const useMyReviews = () => {
    const { token, user } = useSessionStore();
    const t = useTranslations('PatientReviewsDashboard');
    
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyReviews = useCallback(async () => {
        if (!token || !user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Traemos la primera página con las 20 reseñas más recientes
            const data = await reviewService.getMyReviews(0, 20);
            setReviews(data.content);
        } catch (err: any) {
            console.error("❌ Error cargando historial de reseñas:", err);
            const errorMessage = err.response?.data?.message || t('toast_error', { defaultValue: 'No pudimos cargar tu historial.' });
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token, user, t]);

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    return {
        reviews,
        isLoading,
        error,
        refetch: fetchMyReviews
    };
};