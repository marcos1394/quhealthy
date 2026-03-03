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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header del Formulario */}
            <div className="flex flex-col items-center text-center space-y-4 mb-2">
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-full border border-amber-100 dark:border-amber-500/20">
                    <MessageSquareHeart className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('title', { defaultValue: 'Califica tu experiencia' })}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base font-light max-w-sm mx-auto">
                        {t('subtitle', { defaultValue: 'Tu opinión ayuda a otros pacientes a encontrar al especialista ideal.' })}
                    </p>
                </div>
            </div>

            {/* Estrellas Interactivas */}
            <div className="flex flex-col items-center space-y-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    {t('label_rating', { defaultValue: 'Puntuación General' })}
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={cn(
                                "w-10 h-10 md:w-12 md:h-12 cursor-pointer transition-all duration-300",
                                (hoverRating || rating) >= star
                                    ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-sm'
                                    : 'text-slate-200 dark:text-slate-700 hover:text-slate-300 dark:hover:text-slate-600'
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Comentario (Opcional pero recomendado) */}
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {t('label_comment', { defaultValue: 'Cuéntanos más detalles' })} <span className="text-slate-400 font-normal ml-1">({t('optional', { defaultValue: 'Opcional'})})</span>
                </label>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl min-h-[140px] p-4 resize-none focus-visible:ring-medical-500 text-base"
                    placeholder={t('comment_placeholder', { defaultValue: '¿Cómo fue el trato del doctor? ¿Las instalaciones estaban limpias?' })}
                />
            </div>

            {/* Botón de Envío */}
            <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white h-14 text-lg rounded-2xl font-bold shadow-lg shadow-medical-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('btn_submitting', { defaultValue: 'Enviando...' })}</>
                ) : (
                    t('btn_submit', { defaultValue: 'Publicar Reseña' })
                )}
            </Button>
            
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                {t('privacy_notice', { defaultValue: 'Tu reseña será revisada por nuestro sistema antes de ser pública.' })}
            </p>
        </form>
    );
}