"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquareHeart, Loader2, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';

import { useMyReviews } from '@/hooks/useMyReviews';
import { ReviewHistoryCard } from '@/components/reviews/ReviewHistoryCard';

export default function PatientReviewsDashboard() {
    const t = useTranslations('PatientReviewsDashboard');
    const { reviews, isLoading } = useMyReviews();
    
    // Preparando la estructura para "Pendientes" vs "Historial"
    const [activeTab, setActiveTab] = useState<'HISTORY' | 'PENDING'>('HISTORY');

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-medical-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30 pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
                
                {/* Header Editorial */}
                <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-gradient-to-br from-medical-500 to-medical-400 rounded-2xl shadow-lg shadow-medical-500/20 text-white">
                        <MessageSquareHeart className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('title', { defaultValue: 'Mis Reseñas' })}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-lg font-light">
                            {t('subtitle', { defaultValue: 'Gestiona tus opiniones y descubre las respuestas de tus especialistas.' })}
                        </p>
                    </div>
                </div>

                {/* Tabs / Navegación Interna */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'HISTORY' ? 'text-medical-600 dark:text-medical-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        {t('tab_history', { defaultValue: 'Historial de Opiniones' })}
                        {activeTab === 'HISTORY' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-600 dark:bg-medical-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`pb-4 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'PENDING' ? 'text-medical-600 dark:text-medical-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        {t('tab_pending', { defaultValue: 'Pendientes por Calificar' })}
                        {activeTab === 'PENDING' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-600 dark:bg-medical-400" />
                        )}
                    </button>
                </div>

                {/* Contenido: Historial */}
                {activeTab === 'HISTORY' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <ReviewHistoryCard key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <StarHalf className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('empty_history_title', { defaultValue: 'Aún no tienes reseñas publicadas' })}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {t('empty_history_desc', { defaultValue: 'Tus opiniones aparecerán aquí después de calificar tus citas.' })}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Contenido: Pendientes (Placeholder temporal para el siguiente Sprint) */}
                {activeTab === 'PENDING' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400">
                            {t('pending_integration', { defaultValue: 'Estamos cruzando datos con tus citas recientes. ¡Pronto verás aquí a quién te falta calificar!' })}
                        </p>
                    </motion.div>
                )}

            </div>
        </div>
    );
}