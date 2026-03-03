"use client";

import React, { use } from 'react';
import { useLeaveReview } from '@/hooks/useLeaveReview';

import { ReviewLoader, ReviewError } from '@/components/reviews/ReviewStates';
import { ReviewForm } from '@/components/reviews/ReviewForm';

// En Next.js App Router, los params en componentes cliente deben desenvolverse usando React.use()
export default function LeaveReviewPage({ params }: { params: Promise<{ token: string }> }) {
    
    // 1. Extraemos el token de la URL
    const resolvedParams = use(params);
    const token = resolvedParams.token;

    // 2. Inyectamos nuestro Hook de Negocio
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

    // 3. Renderizado Condicional de Estados
    if (isValidating) {
        return <ReviewLoader />;
    }

    if (validationError) {
        return <ReviewError message={validationError} />;
    }

    // 4. Renderizado del Formulario Principal
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-4 font-sans selection:bg-medical-500/30">
            <div className="max-w-xl w-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
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