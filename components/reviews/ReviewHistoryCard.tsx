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
  color: 'border-emerald-100 text-emerald-600 bg-emerald-50 dark:border-emerald-800/50 dark:text-emerald-400 dark:bg-emerald-900/30',
  icon: <CheckCircle2 className="w-4 h-4 mr-1.5" strokeWidth={2} />,
  label: t('status_approved', { defaultValue: 'Publicada' })
  },
  PENDING: {
  color: 'border-gray-200 text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
  icon: <Clock className="w-4 h-4 mr-1.5" strokeWidth={2} />,
  label: t('status_pending', { defaultValue: 'En revisión' })
  },
  REJECTED: {
  color: 'border-rose-100 text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
  icon: <AlertCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />,
  label: t('status_rejected', { defaultValue: 'Anulada' })
  }
 };

 const currentStatus = statusConfig[review.moderationStatus] || statusConfig.PENDING;

  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: '2-digit'
  });

  return (
  <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 transition-all rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1">
 
 {/* Header de la Tarjeta */}
  <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-3xl">
  <div className="flex items-center gap-4">
  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-800/50">
  {[1, 2, 3, 4, 5].map((star) => (
  <Star
  key={star}
  className={cn(
  "w-4 h-4",
  star <= review.rating 
  ? "text-amber-400 fill-amber-400" 
  : "text-gray-300 dark:text-gray-700 fill-transparent"
  )}
  strokeWidth={1.5}
  />
  ))}
  </div>
  <span className="text-xs font-medium text-gray-500">
  {formattedDate}
  </span>
  </div>
  <span className={cn(
  "px-3 py-1 text-xs font-bold flex items-center w-fit rounded-full",
  currentStatus.color
  )}>
  {currentStatus.icon}
  {currentStatus.label}
  </span>
  </div>

 {/* Comentario del Paciente */}
  <div className="p-6 md:p-8">
  <p className="text-base font-medium leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap">
  {review.comment || <span className="text-sm font-medium text-gray-400 italic">{t('no_comment', { defaultValue: 'Sin observaciones de texto.' })}</span>}
  </p>

  {/* Respuesta del Especialista */}
  {review.providerResponse && (
  <div className="mt-8 border-l-4 border-quhealthy-green pl-4 py-3 bg-gray-50/50 dark:bg-[#0a0a0a] rounded-r-2xl">
  <div className="flex items-center gap-2 mb-2 text-gray-500">
  <MessageCircleReply className="w-4 h-4 text-quhealthy-green" strokeWidth={2} />
  <span className="text-xs font-bold text-gray-900 dark:text-white">
  {t('provider_reply', { defaultValue: 'Respuesta del Especialista' })}
  </span>
  </div>
  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
  {review.providerResponse}
  </p>
  </div>
  )}
 
 {/* Disclaimer si fue rechazada */}
 {review.moderationStatus === 'REJECTED' && (
 <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
  <p className="text-xs font-bold text-rose-500">
  {t('rejected_notice', { defaultValue: 'Nota: Este registro infringió las políticas de contenido y fue oculto.' })}
  </p>
 </div>
 )}
 </div>
 </div>
 );
}