import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, Clock, CheckCircle2, AlertCircle, MessageCircleReply } from 'lucide-react';
import { Review } from '@/types/reviews';
import { Badge } from '@/components/ui/badge';

interface ReviewHistoryCardProps {
    review: Review;
}

export function ReviewHistoryCard({ review }: ReviewHistoryCardProps) {
    const t = useTranslations('PatientReviewsDashboard');

    // Configuración visual según el estado de moderación (Gemini)
    const statusConfig = {
        APPROVED: {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
            icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
            label: t('status_approved', { defaultValue: 'Publicada' })
        },
        PENDING: {
            color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
            icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
            label: t('status_pending', { defaultValue: 'En revisión' })
        },
        REJECTED: {
            color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
            icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
            label: t('status_rejected', { defaultValue: 'Rechazada' })
        }
    };

    const currentStatus = statusConfig[review.moderationStatus] || statusConfig.PENDING;

    // Formateo de fecha
    const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header de la Tarjeta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                    ))}
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {formattedDate}
                    </span>
                </div>
                <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center w-fit ${currentStatus.color}`}>
                    {currentStatus.icon}
                    {currentStatus.label}
                </Badge>
            </div>

            {/* Comentario del Paciente */}
            <p className="text-slate-700 dark:text-slate-300 font-light leading-relaxed mb-6">
                {review.comment || <span className="italic text-slate-400">{t('no_comment', { defaultValue: 'Calificación sin comentario.' })}</span>}
            </p>

            {/* Respuesta del Doctor (Si existe) */}
            {review.providerResponse && (
                <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border-l-4 border-medical-500">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircleReply className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {t('provider_reply', { defaultValue: 'Respuesta del Especialista' })}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        {review.providerResponse}
                    </p>
                </div>
            )}
            
            {/* Disclaimer si fue rechazada */}
            {review.moderationStatus === 'REJECTED' && (
                <p className="mt-4 text-xs text-rose-500/80 dark:text-rose-400/80 italic">
                    {t('rejected_notice', { defaultValue: 'Esta reseña no cumple con nuestras normas comunitarias y no es visible al público.' })}
                </p>
            )}
        </div>
    );
}