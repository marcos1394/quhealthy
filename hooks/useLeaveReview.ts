// src/hooks/useLeaveReview.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

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

    const [prevToken, setPrevToken] = useState<string | undefined>(token);
    if (token !== prevToken) {
        setPrevToken(token);
        if (!token) {
            setValidationError(t('error_missing_token', { defaultValue: 'Enlace inválido o incompleto.' }));
            setIsValidating(false);
        } else {
            setValidationError(null);
            setIsValidating(true);
        }
    }

    // 1. Validar el token automáticamente al montar el hook
    useEffect(() => {
        if (!token) return;

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
            toast.error(t('error_rating', { defaultValue: 'Por favor, seleccione una calificación.' }));
            return;
        }

        setIsSubmitting(true);
        
        try {
            const payload: CreateReviewPayload = {
                providerId: context.providerId,
                rating,
                comment: comment.trim()
            };

            if (context.entityType === 'ORDER') {
                payload.orderItemId = context.transactionId; // Transaction is orderId or orderItemId
            } else if (context.entityType === 'PRODUCT') {
                payload.productId = context.entityId;
                payload.orderItemId = context.transactionId;
            } else if (context.entityType === 'PACKAGE') {
                payload.packageId = context.entityId;
                payload.orderItemId = context.transactionId;
            } else {
                // Default to legacy appointment
                payload.appointmentId = context.appointmentId || context.transactionId;
                if (context.entityId) {
                    payload.serviceId = context.entityId;
                }
            }

            await reviewService.createReview(payload);
            
            toast.success(t('toast_success', { defaultValue: '¡Gracias! Tu reseña ha sido enviada con éxito.' }));
            
            // Redirigimos al paciente al dashboard de reseñas
            router.push(`/patient/dashboard/reviews`);
            
        } catch (err: any) {
            console.error("❌ Error enviando reseña:", err);
            handleApiError(err);
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