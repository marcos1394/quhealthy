"use client";

import React, { use } from 'react';
import { useLeaveReview } from '@/hooks/useLeaveReview';

import { ReviewLoader, ReviewError } from '@/components/reviews/ReviewStates';
import { ReviewForm } from '@/components/reviews/ReviewForm';

export default function LeaveReviewPage({ params }: { params: Promise<{ token: string }> }) {
    
    // 1. Extraemos el token de la URL desencapsulando la promesa (Estándar App Router)
    const resolvedParams = use(params);
    const token = resolvedParams.token;

    // 2. Inyectamos nuestro Hook de Lógica
    const {
        isValidating,
        validationError,
        rating,
        setRating,
        comment,
        setComment,
        isSubmitting,
        submitReview
    } = useLeaveReview(token);

    // 3. Renderizado Condicional de Estados (Utiliza los componentes ya refactorizados)
    if (isValidating) {
        return <ReviewLoader />;
    }

    if (validationError) {
        return <ReviewError message={validationError} />;
    }

    // 4. Renderizado del Contenedor Principal
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex justify-center items-center py-12 px-4 sm:px-6 md:px-8 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
            <div className="max-w-2xl w-full">
                {/* 
                    Al inyectar el ReviewForm refactorizado, este ya posee sus propios 
                    bordes rígidos, padding y estructura monocromática (Blueprint).
                */}
                <ReviewForm 
                    rating={rating}
                    setRating={setRating}
                    comment={comment}
                    setComment={setComment}
                    onSubmit={submitReview}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}