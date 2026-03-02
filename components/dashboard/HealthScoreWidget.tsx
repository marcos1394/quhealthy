"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { HealthScoreResponse } from '@/types/healthscore';

interface HealthScoreWidgetProps {
  scoreData: HealthScoreResponse | null;
  isLoading: boolean;
  onOpenOnboarding: () => void;
}

export function HealthScoreWidget({ scoreData, isLoading, onOpenOnboarding }: HealthScoreWidgetProps) {
  const t = useTranslations('PatientDashboard.Widget');

  // 🔄 ESTADO 1: Cargando
  if (isLoading) {
    return (
      <Card className="h-full min-h-[300px] flex flex-col justify-center items-center p-6 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
         <Loader2 className="w-8 h-8 animate-spin text-medical-500 mb-4" />
         <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('loading')}</p>
      </Card>
    );
  }

  // ✨ ESTADO 2: Sin datos (CTA Gamificado)
  if (!scoreData) {
    return (
      <Card className="h-full relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white border-0 shadow-xl group">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-medical-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-medical-500/30 transition-all duration-700"></div>
        
        <CardContent className="p-6 md:p-8 flex flex-col h-full justify-center relative z-10">
          <div className="p-3 bg-white/10 w-fit rounded-2xl mb-5 backdrop-blur-md border border-white/10 shadow-sm">
            <Sparkles className="w-6 h-6 text-medical-300" />
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight tracking-tight text-white">
            {t('cta_title')}
          </h3>
          
          <p className="text-sm text-slate-300 font-light mb-8 flex-1 leading-relaxed">
            {t('cta_desc')}
          </p>
          
          <Button
            onClick={onOpenOnboarding}
            className="w-full bg-medical-500 hover:bg-medical-600 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            {t('cta_button')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 📊 ESTADO 3: Con Datos (Muestra la tarjeta real)
  return (
    <HealthScoreCard 
      score={scoreData.quscore} 
      title="QuHealthScore™" 
      subtitle={t('level', { band: scoreData.band })} 
    />
  );
}