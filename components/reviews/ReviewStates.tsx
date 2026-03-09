import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function ReviewLoader() {
    const t = useTranslations('PatientReviews');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <QhSpinner size="lg" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                {t('loading_validation', { defaultValue: 'Verificando tu cita de forma segura...' })}
            </p>
        </div>
    );
}

export function ReviewError({ message }: { message: string }) {
    const t = useTranslations('PatientReviews');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-rose-500/30">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 shadow-sm text-center">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {t('error_title', { defaultValue: 'Enlace no válido' })}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-light leading-relaxed">
                    {message}
                </p>
                <Button 
                    onClick={() => router.push('/dashboard')}
                    variant="outline" 
                    className="w-full rounded-xl h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('btn_back_home', { defaultValue: 'Volver al Inicio' })}
                </Button>
            </div>
        </div>
    );
}