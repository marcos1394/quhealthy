"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HealthScoreResponse } from '@/types/healthscore';
import { QhSpinner } from '@/components/ui/QhSpinner';

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

  // ✨ ESTADO 2: Sin datos (CTA Técnico y Estricto)
  if (!scoreData) {
    return (
      <div className="h-full min-h-[300px] border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black p-8 flex flex-col justify-between">
        
        <div>
          <div className="w-12 h-12 border border-white/30 dark:border-black/30 flex items-center justify-center mb-6 bg-white/5 dark:bg-black/5">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          
          <h3 className="text-2xl font-semibold mb-3 tracking-tight">
            {t('cta_title')}
          </h3>
          
          <p className="text-xs text-gray-400 dark:text-gray-600 font-light leading-relaxed max-w-sm mb-8">
            {t('cta_desc')}
          </p>
        </div>
        
        <Button
          onClick={onOpenOnboarding}
          className="w-full bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-none h-14 text-[10px] font-bold uppercase tracking-widest border-0 flex items-center justify-between px-6 transition-colors"
        >
          {t('cta_button')} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
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