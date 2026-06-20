"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, MessageSquareHeart, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
    rating: number;
    setRating: (rating: number) => void;
    comment: string;
    setComment: (comment: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function ReviewForm({ rating, setRating, comment, setComment, onSubmit, isSubmitting }: ReviewFormProps) {
    const t = useTranslations('PatientReviews');
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            {/* Header del Formulario */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                <div className="w-16 h-16 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center shrink-0">
                    <MessageSquareHeart className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-2">
                        {t('title', { defaultValue: 'Evaluación de Servicio' })}
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm">
                        {t('subtitle', { defaultValue: 'Suministre datos cualitativos sobre la atención recibida.' })}
                    </p>
                </div>
            </div>

            {/* Formulario Principal */}
            <div className="p-8 space-y-12">
                {/* Estrellas Rígidas (Monocromáticas) */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 block">
                        {t('label_rating', { defaultValue: 'Puntuación Paramétrica' })}
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className={cn(
                                    "w-12 h-12 cursor-pointer transition-colors border",
                                    (hoverRating || rating) >= star
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white fill-current p-2'
                                        : 'bg-gray-50 text-gray-300 border-gray-200 dark:bg-[#050505] dark:text-gray-700 dark:border-gray-800 hover:border-black dark:hover:border-white fill-transparent p-2'
                                )}
                                strokeWidth={1}
                            />
                        ))}
                    </div>
                </div>

                {/* Comentario */}
                <div>
                    <label className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                        {t('label_comment', { defaultValue: 'Observaciones Textuales' })}
                        <span className="text-gray-400 font-light">[{t('optional', { defaultValue: 'OPCIONAL'})}]</span>
                    </label>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-none min-h-[160px] p-4 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                        placeholder={t('comment_placeholder', { defaultValue: 'EJ. PROCEDIMIENTOS CUMPLIDOS, TIEMPOS DE ESPERA, ESTADO DE INSTALACIONES...' })}
                    />
                </div>
            </div>

            {/* Footer de Comandos */}
            <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col items-center gap-6">
                <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-3 animate-spin" /> {t('btn_submitting', { defaultValue: 'Procesando...' })}</>
                    ) : (
                        t('btn_submit', { defaultValue: 'Registrar Evaluación' })
                    )}
                </Button>
                
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center max-w-sm">
                    {t('privacy_notice', { defaultValue: 'AVISO: LAS EVALUACIONES SON SOMETIDAS A PROCESOS DE MODERACIÓN PREVIO A SU INCORPORACIÓN PÚBLICA.' })}
                </p>
            </div>
        </form>
    );
}