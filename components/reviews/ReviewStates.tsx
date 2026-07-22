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
 <p className="text-sm font-bold text-gray-500 mt-4 animate-pulse">
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
 <div className="max-w-md w-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center rounded-3xl shadow-sm">
 <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 flex items-center justify-center mx-auto mb-6 shadow-sm">
 <AlertCircle className="w-8 h-8" strokeWidth={2} />
 </div>
 <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
 {t('error_title', { defaultValue: 'Enlace Clínico Inválido' })}
 </h2>
 <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
 {message}
 </p>
 <Button 
 onClick={() => router.push('/dashboard')}
 className="w-full rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white h-12 text-sm font-bold border-0 transition-all shadow-sm"
 >
 <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={2} />
 {t('btn_back_home', { defaultValue: 'Volver al Sistema' })}
 </Button>
 </div>
 </div>
 );
}