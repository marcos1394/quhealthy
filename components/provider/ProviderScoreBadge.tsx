"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Sparkles, Award, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProviderScoreResponse, ProviderScoreBand } from '@/types/providerScore';
import { cn } from '@/lib/utils';

interface ProviderScoreBadgeProps {
  scoreData?: ProviderScoreResponse;
  className?: string;
}

export function ProviderScoreBadge({ scoreData, className }: ProviderScoreBadgeProps) {
  const t = useTranslations('ProviderScore');

  // Si no hay datos aún (está cargando o falló), mostramos un skeleton discreto
  if (!scoreData) {
    return (
      <Badge className={cn("bg-slate-200/50 dark:bg-slate-800/50 text-transparent animate-pulse border-none shadow-none", className)}>
        Cargando
      </Badge>
    );
  }

  // CA-01: Si es nuevo (< 5 consultas)
  if (scoreData.isNewProvider || scoreData.band === 'NUEVO') {
    return (
      <Badge className={cn("bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-md", className)}>
        <Info className="w-3 h-3 mr-1 text-slate-400" />
        {t('band_nuevo')}
      </Badge>
    );
  }

  // Lógica de Bandas y Colores (CA-01)
  const getBandConfig = (band: ProviderScoreBand) => {
    switch (band) {
      case 'ELITE':
        return { 
          color: 'bg-blue-500/90 dark:bg-blue-600/90 text-white border-blue-400 dark:border-blue-500', 
          icon: <ShieldCheck className="w-3 h-3 mr-1 text-blue-100" />,
          label: t('band_elite')
        };
      case 'PREMIUM':
        return { 
          color: 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white border-emerald-400 dark:border-emerald-500', 
          icon: <Sparkles className="w-3 h-3 mr-1 text-emerald-100" />,
          label: t('band_premium')
        };
      case 'ADVANCED':
        return { 
          color: 'bg-amber-500/90 dark:bg-amber-600/90 text-white border-amber-400 dark:border-amber-500', 
          icon: <Award className="w-3 h-3 mr-1 text-amber-100" />,
          label: t('band_advanced')
        };
      case 'IN_PROGRESS':
        return { 
          color: 'bg-orange-500/90 dark:bg-orange-600/90 text-white border-orange-400 dark:border-orange-500', 
          icon: <TrendingUp className="w-3 h-3 mr-1 text-orange-100" />,
          label: t('band_in_progress')
        };
      case 'LOW_QUALITY':
      default:
        return { 
          color: 'bg-rose-500/90 dark:bg-rose-600/90 text-white border-rose-400 dark:border-rose-500', 
          icon: <AlertCircle className="w-3 h-3 mr-1 text-rose-100" />,
          label: t('band_low')
        };
    }
  };

  const config = getBandConfig(scoreData.band);

  return (
    <Badge className={cn("backdrop-blur-md border shadow-lg font-bold tracking-wide uppercase text-[10px]", config.color, className)}>
      {config.icon}
      {scoreData.score} • {config.label}
    </Badge>
  );
}