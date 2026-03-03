// src/hooks/useLeaveReview.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { reviewService } from '@/services/review.service';
import { ReviewContext, CreateReviewPayload } from '@/types/reviews';

export const useLeaveReview = (token: string | undefined) => {
    const t = useTranslations('PatientReviews');
    const router = useRouter();

    // Estados de Contexto (Token)
    const [context, setContext] = useState<ReviewContext | null>(null);
    const [isValidating, setIsValidating] = useState<boolean>(true);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Estados del Formulario
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // 1. Validar el token automáticamente al montar el hook
    useEffect(() => {
        if (!token) {
            setValidationError(t('error_missing_token', { defaultValue: 'Enlace inválido o incompleto.' }));
            setIsValidating(false);
            return;
        }

        const validateInvitation = async () => {
            try {
                const data = await reviewService.verifyToken(token);
                setContext(data);
            } catch (err: any) {
                console.error("❌ Error verificando token de reseña:", err);
                // Si el backend lanza error (expirado, corrupto, o ya reseñado), lo atrapamos
                setValidationError(err.response?.data?.message || t('error_invalid', { defaultValue: 'El enlace de la reseña ha expirado o es inválido.' }));
            } finally {
                setIsValidating(false);
            }
        };

        validateInvitation();
    }, [token, t]);

    // 2. Función para enviar la reseña
    const submitReview = useCallback(async () => {
        if (!context) return;
        
        if (rating === 0) {
            toast.error(t('toast_rating_required', { defaultValue: 'Por favor selecciona una calificación en estrellas.' }));
            return;
        }

        setIsSubmitting(true);
        
        try {
            const payload: CreateReviewPayload = {
                providerId: context.providerId,
                appointmentId: context.appointmentId,
                rating,
                comment: comment.trim()
            };

            await reviewService.createReview(payload);
            
            toast.success(t('toast_success', { defaultValue: '¡Gracias! Tu reseña ha sido enviada con éxito.' }));
            
            // Redirigimos al paciente al perfil público del doctor para que vea su reseña (si fue auto-aprobada)
            // o simplemente al dashboard si prefieres.
            router.push(`/tienda/${context.providerId}`); 
            
        } catch (err: any) {
            console.error("❌ Error enviando reseña:", err);
            toast.error(err.response?.data?.message || t('toast_error', { defaultValue: 'Ocurrió un error al enviar tu reseña. Intenta nuevamente.' }));
        } finally {
            setIsSubmitting(false);
        }
    }, [context, rating, comment, router, t]);

    return {
        // Estados de carga y error iniciales
        isValidating,
        validationError,
        context,
        
        // Controladores del formulario
        rating,
        setRating,
        comment,
        setComment,
        
        // Acciones
        isSubmitting,
        submitReview
    };
};