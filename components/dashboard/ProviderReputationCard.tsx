"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Star, CalendarX, Activity, UserCheck, Info, Sparkles, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProviderScore } from '@/hooks/useProviderScore';
import { useSessionStore } from '@/stores/SessionStore';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function ProviderReputationCard() {
  const t = useTranslations('ProviderReputation');
  const { user } = useSessionStore();
  const { myActionableScore, isLoading, fetchMyActionableScore } = useProviderScore();
  const [expandedPillar, setExpandedPillar] = React.useState<string | null>(null);

  useEffect(() => {
    fetchMyActionableScore();
  }, [fetchMyActionableScore]);

  const pillarIcons: Record<string, React.ReactNode> = {
    P1: <Shield className="w-4 h-4" strokeWidth={1.5} />,
    P2: <Star className="w-4 h-4" strokeWidth={1.5} />,
    P3: <CalendarX className="w-4 h-4" strokeWidth={1.5} />,
    P4: <Activity className="w-4 h-4" strokeWidth={1.5} />,
    P5: <UserCheck className="w-4 h-4" strokeWidth={1.5} />
  };

  // 🔥 Colores semánticos brutales (Añadimos ámbar para "Mejorable")
  const getProgressColorClass = (status: string) => {
    if (status === 'OPTIMAL') return 'bg-black dark:bg-white';
    if (status === 'IMPROVABLE') return 'bg-amber-500 dark:bg-amber-400'; 
    return 'bg-gray-200 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      // 🔥 Sombra reducida a 4px para estados de carga
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] min-h-[350px] flex flex-col items-center justify-center gap-4 transition-colors">
        <QhSpinner size="md" className="text-black dark:text-white" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 animate-pulse">
          {t('loading', { defaultValue: 'Auditando reputación...' })}
        </p>
      </div>
    );
  }

  // Estado: Proveedor Nuevo
  if (!myActionableScore || myActionableScore.isNewProvider || myActionableScore.band === 'NUEVO') {
    return (
      // 🔥 Inversión de colores mejorada: borde doble para contraste en dark/light
      <div className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white min-h-[350px] flex flex-col items-center justify-center p-8 text-center transition-colors">
        <div className="w-16 h-16 border-2 border-current flex items-center justify-center mb-6 shrink-0">
          <Sparkles className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-black uppercase tracking-wider mb-4">
          {t('unlock_title', { defaultValue: 'Expediente en desarrollo' })}
        </h3>
        {/* 🔥 Texto legible (xs) sin mayúsculas sostenidas en párrafos */}
        <p className="text-xs font-bold uppercase tracking-wider opacity-70 max-w-sm leading-relaxed">
          {t('unlock_desc', { defaultValue: 'El algoritmo Quscore requiere un volumen transaccional mínimo para generar una auditoría representativa.' })}
        </p>
      </div>
    );
  }

  // Estado: Proveedor con Score
  return (
    // 🔥 Sombra principal a 4px (Reservar 8px solo para alertas críticas en el dashboard)
    <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex flex-col min-h-[350px] transition-colors">
      
      {/* Header */}
      <div className="border-b border-black dark:border-white p-5 bg-gray-50 dark:bg-[#050505]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-3">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} /> 
            Auditoría Quscore
          </h2>
          <ProviderScoreBadge scoreData={myActionableScore} />
        </div>
        <p className="text-[11px] font-semibold text-gray-500">
          {t('updated_at', { defaultValue: `Corte al: ${new Date(myActionableScore.lastCalculatedAt).toLocaleDateString()}` })}
        </p>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-6">
        <TooltipProvider delayDuration={200}>
          {myActionableScore.breakdown && Object.entries(myActionableScore.breakdown).map(([key, pillar]) => {
            const hasActions = pillar.actions && pillar.actions.length > 0;
            const isExpanded = expandedPillar === key;

            return (
            <div key={key} className="space-y-2">
              <div 
                className={cn(
                  "flex items-center justify-between py-1", 
                  hasActions && "cursor-pointer hover:opacity-70 transition-opacity"
                )}
                onClick={() => hasActions && setExpandedPillar(isExpanded ? null : key)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-black dark:text-white">
                    {pillarIcons[key]}
                  </div>
                  {/* 🔥 Títulos legibles pero técnicos */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
                    {pillar.name}
                  </span>
                  
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black dark:hover:text-white cursor-help transition-colors" strokeWidth={2} />
                    </TooltipTrigger>
                    {/* 🔥 Tooltip mejorado: Texto normal (Sentence case) y 12px para lectura rápida */}
                    <TooltipContent className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-3 rounded-none max-w-xs">
                      <p className="text-xs font-semibold text-black dark:text-white leading-relaxed">
                        {pillar.tooltip}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black tracking-tight text-black dark:text-white tabular-nums">
                    {pillar.percentage}%
                  </span>
                  {hasActions && (
                    <div className="w-5 h-5 flex items-center justify-center border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111]">
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-black dark:text-white" strokeWidth={2} /> : <ChevronDown className="w-3 h-3 text-black dark:text-white" strokeWidth={2} />}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🔥 Barra de Progreso "Viga Estructural" (h-4 en vez de h-2.5) */}
              <div className="h-4 w-full border border-black dark:border-white bg-gray-100 dark:bg-[#111]">
                <div 
                  className={cn("h-full transition-all duration-500", getProgressColorClass(pillar.status))}
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>

              {/* Panel de Acciones Expandible */}
              {hasActions && isExpanded && (
                <div className="mt-3 p-4 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] space-y-4">
                  {pillar.potentialPoints && pillar.potentialPoints > 0 && (
                    // 🔥 Semántica visual para el Delta (Ámbar en lugar de solo gris)
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-500 dark:border-amber-500/50 px-2 py-1 w-fit">
                      <TrendingUp className="w-3 h-3" strokeWidth={2} />
                      Delta positiva: +{pillar.potentialPoints} pts
                    </div>
                  )}
                  <ul className="space-y-3">
                    {pillar.actions?.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {/* 🔥 Viñeta minimalista cuadrada rellena */}
                        <div className="w-2 h-2 bg-black dark:bg-white shrink-0 mt-1.5" />
                        {/* 🔥 Acciones legibles: 11px, negrita, sin mayúsculas sostenidas */}
                        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">
                          {action}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            );
          })}
        </TooltipProvider>

        {myActionableScore.percentile != null && (
          <div className="mt-auto pt-6 border-t border-black dark:border-white text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {t.rich('top_percentile', {
                percent: 100 - myActionableScore.percentile,
                // 🔥 Highlight visual más fuerte
                highlight: (chunks) => <span className="text-black dark:text-white font-black bg-gray-100 dark:bg-[#111] px-1.5 py-0.5 border border-black dark:border-white">{chunks}</span>,
                defaultValue: `Posicionado en el top ${100 - myActionableScore.percentile}% nacional`
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}