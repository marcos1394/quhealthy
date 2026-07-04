"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, Clock, CheckCircle2, AlertCircle, MessageCircleReply } from 'lucide-react';
import { Review } from '@/types/reviews';
import { cn } from '@/lib/utils';

interface ReviewHistoryCardProps {
 review: Review;
}

export function ReviewHistoryCard({ review }: ReviewHistoryCardProps) {
 const t = useTranslations('PatientReviewsDashboard');

 // Configuración visual arquitectónica
 const statusConfig = {
 APPROVED: {
 color: 'border-black text-black bg-black/5 dark:border-white dark:text-white dark:bg-white/10',
 icon: <CheckCircle2 className="w-3 h-3 mr-2" strokeWidth={2} />,
 label: t('status_approved', { defaultValue: 'Publicada' })
 },
 PENDING: {
 color: 'border-gray-500 text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
 icon: <Clock className="w-3 h-3 mr-2" strokeWidth={2} />,
 label: t('status_pending', { defaultValue: 'En revisión' })
 },
 REJECTED: {
 color: 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-500',
 icon: <AlertCircle className="w-3 h-3 mr-2" strokeWidth={2} />,
 label: t('status_rejected', { defaultValue: 'Anulada' })
 }
 };

 const currentStatus = statusConfig[review.moderationStatus] || statusConfig.PENDING;

 const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
 year: 'numeric', month: 'short', day: '2-digit'
 }).toUpperCase();

 return (
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group hover:border-black dark:hover:border-white transition-colors">
 
 {/* Header de la Tarjeta */}
 <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={cn(
 "w-3.5 h-3.5",
 star <= review.rating 
 ? "text-black fill-black dark:text-white dark:fill-white" 
 : "text-gray-300 dark:text-gray-700 fill-transparent"
 )}
 strokeWidth={1}
 />
 ))}
 </div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {formattedDate}
 </span>
 </div>
 <span className={cn(
 "px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center w-fit border",
 currentStatus.color
 )}>
 {currentStatus.icon}
 {currentStatus.label}
 </span>
 </div>

 {/* Comentario del Paciente */}
 <div className="p-6 md:p-8">
 <p className="text-sm font-light leading-relaxed text-black dark:text-white whitespace-pre-wrap">
 {review.comment || <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('no_comment', { defaultValue: '[REGISTRO SIN OBSERVACIONES TEXTUALES]' })}</span>}
 </p>

 {/* Respuesta del Especialista */}
 {review.providerResponse && (
 <div className="mt-8 border-l-2 border-black dark:border-white pl-4 py-1 bg-gray-50 dark:bg-[#050505]">
 <div className="flex items-center gap-2 mb-2 text-gray-500">
 <MessageCircleReply className="w-3.5 h-3.5" strokeWidth={1.5} />
 <span className="text-[9px] font-bold uppercase tracking-widest">
 {t('provider_reply', { defaultValue: 'Anotación del Especialista' })}
 </span>
 </div>
 <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
 {review.providerResponse}
 </p>
 </div>
 )}
 
 {/* Disclaimer si fue rechazada */}
 {review.moderationStatus === 'REJECTED' && (
 <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
 <p className="text-[9px] font-bold uppercase tracking-widest text-red-500">
 {t('rejected_notice', { defaultValue: 'NOTA: EL PRESENTE REGISTRO INFRINGIÓ LAS POLÍTICAS DE CONTENIDO Y FUE OCULTO AL PÚBLICO.' })}
 </p>
 </div>
 )}
 </div>
 </div>
 );
}