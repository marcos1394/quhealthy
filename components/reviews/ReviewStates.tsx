"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function ReviewLoader() {
 const t = useTranslations('PatientReviews');

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-4 animate-pulse">
 {t('loading_validation', { defaultValue: 'Verificando Integridad de la Cita...' })}
 </p>
 </div>
 );
}

export function ReviewError({ message }: { message: string }) {
 const t = useTranslations('PatientReviews');
 const router = useRouter();

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="max-w-md w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 text-center">
 <div className="w-16 h-16 border border-red-500 bg-white dark:bg-black flex items-center justify-center mx-auto mb-6">
 <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
 </div>
 <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
 {t('error_title', { defaultValue: 'Enlace Clínico Inválido' })}
 </h2>
 <p className="text-xs text-gray-500 font-light leading-relaxed mb-8">
 {message}
 </p>
 <Button 
 onClick={() => router.push('/dashboard')}
 className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
 >
 <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} />
 {t('btn_back_home', { defaultValue: 'Retornar al Sistema' })}
 </Button>
 </div>
 </div>
 );
}