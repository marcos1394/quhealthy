"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, MessageSquareHeart, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
 entityType?: 'SERVICE' | 'PRODUCT' | 'PACKAGE' | 'ORDER';
 rating: number;
 setRating: (rating: number) => void;
 comment: string;
 setComment: (comment: string) => void;
 onSubmit: () => void;
 isSubmitting: boolean;
}

export function ReviewForm({ entityType = 'SERVICE', rating, setRating, comment, setComment, onSubmit, isSubmitting }: ReviewFormProps) {
 const t = useTranslations('PatientReviews');
 const [hoverRating, setHoverRating] = useState(0);

 const getTitle = () => {
   switch(entityType) {
     case 'PRODUCT': return t('title_product', { defaultValue: 'Evaluación de Producto' });
     case 'PACKAGE': return t('title_package', { defaultValue: 'Evaluación de Paquete' });
     case 'ORDER': return t('title_order', { defaultValue: 'Evaluación de Orden' });
     default: return t('title', { defaultValue: 'Evaluación de Servicio' });
   }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onSubmit();
 };

 return (
  <form onSubmit={handleSubmit} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm">
  {/* Header del Formulario */}
  <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 rounded-t-3xl">
  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 shadow-sm flex items-center justify-center shrink-0">
  <MessageSquareHeart className="w-8 h-8" strokeWidth={1.5} />
  </div>
  <div>
  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
  {getTitle()}
  </h1>
  <p className="text-sm font-medium text-gray-500 max-w-sm">
  {t('subtitle', { defaultValue: 'Suministre datos cualitativos sobre la atención recibida.' })}
  </p>
  </div>
  </div>

 {/* Formulario Principal */}
 <div className="p-8 space-y-12">
  <div className="flex flex-col">
  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 block">
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
  "w-12 h-12 cursor-pointer transition-colors p-1",
  (hoverRating || rating) >= star
  ? 'text-amber-400 fill-amber-400'
  : 'text-gray-200 dark:text-gray-700 fill-transparent hover:text-amber-200 dark:hover:text-amber-900/50'
  )}
  strokeWidth={1.5}
  />
  ))}
  </div>
  </div>

 {/* Comentario */}
 <div>
  <label className="flex items-baseline gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
  {t('label_comment', { defaultValue: 'Observaciones Textuales' })}
  <span className="text-gray-400 font-normal">({t('optional', { defaultValue: 'Opcional'})})</span>
  </label>
  <Textarea
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl min-h-[160px] p-4 text-sm focus-visible:ring-2 focus-visible:ring-quhealthy-green/20 focus-visible:border-quhealthy-green transition-all shadow-sm placeholder:text-gray-400"
  placeholder={t('comment_placeholder', { defaultValue: 'Ej. Procedimientos cumplidos, tiempos de espera, estado de instalaciones...' })}
  />
 </div>
 </div>

  {/* Footer de Comandos */}
  <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0a0a] flex flex-col items-center gap-6 rounded-b-3xl">
  <Button
  type="submit"
  disabled={isSubmitting || rating === 0}
  className="w-full rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white h-14 px-8 text-sm font-bold border-0 transition-all shadow-sm disabled:opacity-50"
  >
  {isSubmitting ? (
  <><Loader2 className="w-4 h-4 mr-3 animate-spin" /> {t('btn_submitting', { defaultValue: 'Procesando...' })}</>
  ) : (
  t('btn_submit', { defaultValue: 'Registrar Evaluación' })
  )}
  </Button>
  
  <p className="text-xs font-medium text-gray-500 text-center max-w-sm">
  {t('privacy_notice', { defaultValue: 'Nota: Las evaluaciones son moderadas antes de ser públicas.' })}
  </p>
  </div>
  </form>
 );
}