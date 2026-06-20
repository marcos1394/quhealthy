"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Sparkles, Award, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { ProviderScoreResponse, ProviderScoreBand } from '@/types/providerScore';
import { cn } from '@/lib/utils';

interface ProviderScoreBadgeProps {
  scoreData?: ProviderScoreResponse;
  className?: string;
}

export function ProviderScoreBadge({ scoreData, className }: ProviderScoreBadgeProps) {
  const t = useTranslations('ProviderScore');

  // Clases base arquitectónicas para la etiqueta
  const baseClasses = "inline-flex items-center justify-center border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors";

  // Si no hay datos aún (está cargando o falló), mostramos un skeleton discreto y rectangular
  if (!scoreData) {
    return (
      <span className={cn(baseClasses, "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-transparent animate-pulse", className)}>
        CARGANDO
      </span>
    );
  }

  // CA-01: Si es nuevo (< 5 consultas)
  if (scoreData.isNewProvider || scoreData.band === 'NUEVO') {
    return (
      <span className={cn(baseClasses, "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-500", className)}>
        <Info className="w-3 h-3 mr-1.5" strokeWidth={2} />
        {t('band_nuevo')}
      </span>
    );
  }

  // Lógica de Bandas y Colores de Alto Contraste (CA-01)
  const getBandConfig = (band: ProviderScoreBand) => {
    switch (band) {
      case 'ELITE':
        return { 
          color: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black', 
          icon: <ShieldCheck className="w-3 h-3 mr-1.5" strokeWidth={2} />,
          label: t('band_elite')
        };
      case 'PREMIUM':
        return { 
          color: 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500', 
          icon: <Sparkles className="w-3 h-3 mr-1.5" strokeWidth={2} />,
          label: t('band_premium')
        };
      case 'ADVANCED':
        return { 
          color: 'border-amber-500 bg-amber-500 text-black', 
          icon: <Award className="w-3 h-3 mr-1.5" strokeWidth={2} />,
          label: t('band_advanced')
        };
      case 'IN_PROGRESS':
        return { 
          color: 'border-orange-500 bg-orange-500 text-white', 
          icon: <TrendingUp className="w-3 h-3 mr-1.5" strokeWidth={2} />,
          label: t('band_in_progress')
        };
      case 'LOW_QUALITY':
      default:
        return { 
          color: 'border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500', 
          icon: <AlertCircle className="w-3 h-3 mr-1.5" strokeWidth={2} />,
          label: t('band_low')
        };
    }
  };

  const config = getBandConfig(scoreData.band);

  return (
    <span className={cn(baseClasses, config.color, className)}>
      {config.icon}
      {scoreData.score} • {config.label}
    </span>
  );
}