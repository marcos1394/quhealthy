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

  // 🔥 Base mejorada: Borde grueso (2px), tipografía legible (11px), peso negro
  const baseClasses = "inline-flex items-center justify-center border-2 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-colors gap-1.5";

  // Estado de Carga: Bloque geométrico limpio (sin texto oculto)
  if (!scoreData) {
    return (
      <span className={cn(baseClasses, "border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse w-20 h-6", className)}>
      </span>
    );
  }

  // Proveedor Nuevo: Etiqueta apagada pero con borde fuerte
  if (scoreData.isNewProvider || scoreData.band === 'NUEVO') {
    return (
      <span className={cn(baseClasses, "border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-gray-500", className)}>
        <Info className="w-3.5 h-3.5" strokeWidth={2} />
        {t('band_nuevo')}
      </span>
    );
  }

  // 🔥 Lógica de Bandas: Estilo "Sello / Parche Industrial"
  // La clave aquí es el border-black / dark:border-white en TODAS las opciones
  const getBandConfig = (band: ProviderScoreBand) => {
    switch (band) {
      case 'ELITE':
        return { 
          color: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black', 
          icon: <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />,
          label: t('band_elite')
        };
      case 'PREMIUM':
        return { 
          // Verde esmeralda con borde negro = Sello de aprobación
          color: 'border-black bg-emerald-500 text-white dark:border-white dark:bg-emerald-400 dark:text-black', 
          icon: <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />,
          label: t('band_premium')
        };
      case 'ADVANCED':
        return { 
          // Ámbar con borde negro = Etiqueta de advertencia/cuidado
          color: 'border-black bg-amber-400 text-black dark:border-white dark:bg-amber-500 dark:text-black', 
          icon: <Award className="w-3.5 h-3.5" strokeWidth={2} />,
          label: t('band_advanced')
        };
      case 'IN_PROGRESS':
        return { 
          // Naranja con borde negro = Etiqueta de construcción
          color: 'border-black bg-orange-500 text-white dark:border-white dark:bg-orange-400 dark:text-black', 
          icon: <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />,
          label: t('band_in_progress')
        };
      case 'LOW_QUALITY':
      default:
        return { 
          // Rojo con borde negro = Sello de alerta/rechazo
          color: 'border-black bg-red-600 text-white dark:border-white dark:bg-red-500', 
          icon: <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />,
          label: t('band_low')
        };
    }
  };

  const config = getBandConfig(scoreData.band);

  return (
    <span className={cn(baseClasses, config.color, className)}>
      {config.icon}
      {/* 🔥 El número de score separado visualmente con un pipe rectangular */}
      <span className="flex items-center gap-1.5">
        <span className="font-mono">{scoreData.score}</span> 
        <span className="w-px h-3 bg-current opacity-30"></span> 
        <span>{config.label}</span>
      </span>
    </span>
  );
}