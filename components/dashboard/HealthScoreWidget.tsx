"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HealthScoreResponse } from '@/types/healthscore';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Card, CardContent } from '../ui/card';

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
      <div className="h-full min-h-[300px] flex flex-col justify-center items-center p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
         <QhSpinner size="md" />
         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4">
           {t('loading')}
         </p>
      </div>
    );
  }

  // ✨ ESTADO 2: Sin datos (CTA Gamificado)
  if (!scoreData) {
    return (
      <Card className="h-full rounded-none bg-black dark:bg-white text-white dark:text-black border-0 shadow-none relative overflow-hidden group">
        <CardContent className="p-8 md:p-10 flex flex-col h-full justify-center relative z-10">
          <div className="w-12 h-12 border border-white dark:border-black flex items-center justify-center mb-6 bg-transparent">
            <Sparkles className="w-5 h-5 text-white dark:text-black" strokeWidth={1.5} />
          </div>
          
          <h3 className="text-2xl font-bold mb-4 tracking-tight">
            {t('cta_title')}
          </h3>
          
          <p className="text-xs font-light mb-10 flex-1 leading-relaxed opacity-80">
            {t('cta_desc')}
          </p>
          
          <Button
            onClick={onOpenOnboarding}
            className="w-full rounded-none bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors"
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