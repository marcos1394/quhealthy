"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
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

  // 🔄 ESTADO 1: Cargando (Skeletal Blueprint)
  if (isLoading) {
    return (
      <div className="relative h-full min-h-[320px] w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#0a0a0a] mb-6">
            <QhSpinner size="sm" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
            {t('loading', { defaultValue: 'Sincronizando Telemetría...' })}
          </p>
        </div>
      </div>
    );
  }

  // ✨ ESTADO 2: Sin datos (Radar de Calibración Gamificado + Brutalismo)
  if (!scoreData) {
    return (
      <div 
        onClick={onOpenOnboarding}
        className="group relative h-full min-h-[320px] w-full border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] hover:bg-black dark:hover:bg-white overflow-hidden z-0 hover:z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 transition-opacity duration-300 group-hover:opacity-10"></div>

        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-gray-400 dark:border-gray-500 scale-[1.5] opacity-0 transition-all duration-700 group-hover:animate-ping group-hover:opacity-30" style={{ animationDuration: '2s' }} />
          
          <div className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors duration-300 group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white group-hover:border-white dark:group-hover:border-black relative z-10 shrink-0">
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>

        <div className="relative z-10 space-y-4 mb-10">
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black dark:text-white transition-colors duration-300 group-hover:text-white dark:group-hover:text-black">
            {t('cta_title', { defaultValue: 'Algoritmo en Pausa' })}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-[280px] mx-auto leading-relaxed transition-colors duration-300 group-hover:text-gray-300 dark:group-hover:text-gray-600">
            {t('cta_desc', { defaultValue: 'Calibra tu expediente base para encender el motor de predicción y revelar tu QuScore.' })}
          </p>
        </div>

        <div className="mt-auto relative z-10">
          <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-transparent group-hover:border-white dark:group-hover:border-black pb-1 transition-all duration-300 group-hover:text-white dark:group-hover:text-black">
            {t('cta_button', { defaultValue: 'Iniciar Diagnóstico' })} 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:text-white dark:group-hover:text-black" strokeWidth={2} />
          </span>
        </div>
      </div>
    );
  }

  // 📊 ESTADO 3: Con Datos (Mandamos la info real, y el nombre de marca fijo)
  // NOTA: Asumo que en el futuro agregarás un prop como `percentile={scoreData.percentile}`
  return (
    <HealthScoreCard 
      score={scoreData.quscore} 
      title="QuHealthScore™" 
      subtitle={t('level', { band: scoreData.band })}
      // percentile={scoreData.percentile} <-- Aquí mandaríamos el dato real
    />
  );
}