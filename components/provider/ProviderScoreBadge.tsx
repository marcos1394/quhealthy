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

  // Base estricta Blueprint: Borde 1px, tipografía de telemetría (9px), sin redondeos
  const baseClasses = "inline-flex items-center justify-center border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors gap-2 rounded-none";

  // Estado de Carga: Bloque geométrico técnico
  if (!scoreData) {
    return (
      <span className={cn(baseClasses, "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] animate-pulse w-24 h-8", className)}>
      </span>
    );
  }

  // Proveedor Nuevo: Etiqueta de sistema
  if (scoreData.isNewProvider || scoreData.band === 'NUEVO') {
    return (
      <span className={cn(baseClasses, "border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-gray-500", className)}>
        <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
        {t('band_nuevo')}
      </span>
    );
  }

  // Lógica de Bandas: Estilo "Etiqueta de Inspección" (Blueprint)
  const getBandConfig = (band: ProviderScoreBand) => {
    switch (band) {
      case 'ELITE':
        return { 
          color: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black', 
          icon: <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />,
          label: t('band_elite')
        };
      case 'PREMIUM':
        return { 
          color: 'border-black bg-emerald-500 text-white dark:border-white dark:bg-emerald-500 dark:text-black', 
          icon: <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />,
          label: t('band_premium')
        };
      case 'ADVANCED':
        return { 
          color: 'border-black bg-amber-400 text-black dark:border-white dark:bg-amber-400 dark:text-black', 
          icon: <Award className="w-3.5 h-3.5" strokeWidth={1.5} />,
          label: t('band_advanced')
        };
      case 'IN_PROGRESS':
        return { 
          color: 'border-black bg-orange-500 text-white dark:border-white dark:bg-orange-500 dark:text-black', 
          icon: <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />,
          label: t('band_in_progress')
        };
      case 'LOW_QUALITY':
      default:
        return { 
          color: 'border-black bg-red-600 text-white dark:border-white dark:bg-red-600', 
          icon: <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />,
          label: t('band_low')
        };
    }
  };

  const config = getBandConfig(scoreData.band);

  return (
    <span className={cn(baseClasses, config.color, className)}>
      {config.icon}
      <span className="flex items-center gap-2">
        <span className="font-semibold">{scoreData.score}</span> 
        <span className="w-px h-3 bg-current opacity-40"></span> 
        <span>{config.label}</span>
      </span>
    </span>
  );
}