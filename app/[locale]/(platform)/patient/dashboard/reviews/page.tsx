"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquareHeart, StarHalf } from 'lucide-react';

import { useMyReviews } from '@/hooks/useMyReviews';
import { ReviewHistoryCard } from '@/components/reviews/ReviewHistoryCard';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function PatientReviewsDashboard() {
    const t = useTranslations('PatientReviewsDashboard');
    const { reviews, isLoading } = useMyReviews();
    
    // Pestañas (Historial / Pendientes)
    const [activeTab, setActiveTab] = useState<'HISTORY' | 'PENDING'>('HISTORY');

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
                    Cargando Auditorías...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-24">
            <div className="max-w-5xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12">
                
                {/* --- HEADER EDITORIAL --- */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                            <MessageSquareHeart className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                                {t('title', { defaultValue: 'Auditoría de Servicios' })}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                {t('subtitle', { defaultValue: 'Evaluación y registro cualitativo de atenciones médicas.' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- NAVEGACIÓN (TABS ARCHITECTURALES) --- */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-r border-gray-200 dark:border-gray-800 ${
                            activeTab === 'HISTORY' 
                            ? 'bg-black text-white dark:bg-white dark:text-black border-t-2 border-t-black dark:border-t-white' 
                            : 'bg-gray-50 text-gray-500 hover:text-black dark:bg-[#050505] dark:hover:text-white border-t-2 border-t-transparent'
                        }`}
                    >
                        {t('tab_history', { defaultValue: 'Historial Emitido' })}
                    </button>
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-r border-gray-200 dark:border-gray-800 ${
                            activeTab === 'PENDING' 
                            ? 'bg-black text-white dark:bg-white dark:text-black border-t-2 border-t-black dark:border-t-white' 
                            : 'bg-gray-50 text-gray-500 hover:text-black dark:bg-[#050505] dark:hover:text-white border-t-2 border-t-transparent'
                        }`}
                    >
                        {t('tab_pending', { defaultValue: 'Pendientes por Evaluar' })}
                    </button>
                </div>

                {/* --- CONTENIDO --- */}
                {activeTab === 'HISTORY' && (
                    <div className="space-y-6">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <ReviewHistoryCard key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] text-center px-4">
                                <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center mb-6">
                                    <StarHalf className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                                    {t('empty_history_title', { defaultValue: 'Directorio Vacío' })}
                                </h3>
                                <p className="text-xs text-gray-500 font-light max-w-sm leading-relaxed">
                                    {t('empty_history_desc', { defaultValue: 'No se han registrado evaluaciones en el sistema. Las reseñas aparecerán tras concluir y calificar consultas médicas.' })}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'PENDING' && (
                    <div className="flex items-center justify-center py-24 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-center px-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md">
                            {t('pending_integration', { defaultValue: 'PROCESO DE INTEGRACIÓN CON CITAS RECIENTES EN CURSO. LAS EVALUACIONES PENDIENTES ESTARÁN DISPONIBLES PRÓXIMAMENTE.' })}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}