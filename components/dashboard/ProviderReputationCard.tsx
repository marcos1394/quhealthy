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

  // Neo-brutalism Progress Bar Colors
  const getProgressColorClass = (status: string) => {
    if (status === 'OPTIMAL') return 'bg-black dark:bg-white';
    if (status === 'IMPROVABLE') return 'bg-gray-400 dark:bg-gray-500';
    return 'bg-gray-200 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] min-h-[350px] flex flex-col items-center justify-center gap-4 transition-colors">
        <QhSpinner size="md" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          {t('loading', { defaultValue: 'AUDITANDO REPUTACIÓN...' })}
        </p>
      </div>
    );
  }

  // Estado: Proveedor Nuevo (Blueprint Style)
  if (!myActionableScore || myActionableScore.isNewProvider || myActionableScore.band === 'NUEVO') {
    return (
      <div className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] min-h-[350px] flex flex-col items-center justify-center p-8 text-center transition-colors">
        <div className="w-16 h-16 border-2 border-white dark:border-black flex items-center justify-center mb-6 shrink-0 bg-transparent">
          <Sparkles className="w-8 h-8 text-white dark:text-black" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold uppercase tracking-widest mb-4">
          {t('unlock_title', { defaultValue: 'EXPEDIENTE EN DESARROLLO' })}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 max-w-sm leading-relaxed">
          {t('unlock_desc', { defaultValue: 'EL ALGORITMO QUSCORE REQUIERE UN VOLUMEN TRANSACCIONAL MÍNIMO PARA GENERAR UNA AUDITORÍA REPRESENTATIVA.' })}
        </p>
      </div>
    );
  }

  // Estado: Proveedor con Score (Technical Style)
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col min-h-[350px] transition-colors">
      
      {/* Header */}
      <div className="border-b border-black dark:border-white p-6 bg-gray-50 dark:bg-[#050505]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> 
            AUDITORÍA QUSCORE
          </h2>
          <ProviderScoreBadge scoreData={myActionableScore} />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          {t('updated_at', { defaultValue: `CORTE AL: ${new Date(myActionableScore.lastCalculatedAt).toLocaleDateString()}` })}
        </p>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col gap-6">
        <TooltipProvider>
          {myActionableScore.breakdown && Object.entries(myActionableScore.breakdown).map(([key, pillar]) => {
            const hasActions = pillar.actions && pillar.actions.length > 0;
            const isExpanded = expandedPillar === key;

            return (
            <div key={key} className="space-y-3">
              <div 
                className={cn(
                  "flex items-center justify-between", 
                  hasActions && "cursor-pointer hover:opacity-70 transition-opacity"
                )}
                onClick={() => hasActions && setExpandedPillar(isExpanded ? null : key)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-black dark:text-white">
                    {pillarIcons[key]}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                    {pillar.name}
                  </span>
                  
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black dark:hover:text-white cursor-help transition-colors" strokeWidth={2} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-3 rounded-none max-w-xs">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                        {pillar.tooltip}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black tracking-tighter text-black dark:text-white tabular-nums">
                    {pillar.percentage}%
                  </span>
                  {hasActions && (
                    <div className="w-5 h-5 flex items-center justify-center border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111]">
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-black dark:text-white" strokeWidth={2} /> : <ChevronDown className="w-3 h-3 text-black dark:text-white" strokeWidth={2} />}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Barra de Progreso Arquitectónica */}
              <div className="h-2.5 w-full border border-black dark:border-white bg-gray-100 dark:bg-[#111]">
                <div 
                  className={cn("h-full transition-all duration-500", getProgressColorClass(pillar.status))}
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>

              {/* Panel de Acciones Expandible */}
              {hasActions && isExpanded && (
                <div className="mt-4 p-4 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] space-y-4">
                  {pillar.potentialPoints && pillar.potentialPoints > 0 && (
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-white dark:bg-black border border-black dark:border-white px-2 py-1 w-fit">
                      <TrendingUp className="w-3 h-3" strokeWidth={2} />
                      DELTA POSITIVA: +{pillar.potentialPoints} PTS
                    </div>
                  )}
                  <ul className="space-y-3">
                    {pillar.actions?.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-3 h-3 border border-black dark:border-white bg-black dark:bg-white shrink-0 mt-0.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t.rich('top_percentile', {
                percent: 100 - myActionableScore.percentile,
                highlight: (chunks) => <span className="text-black dark:text-white font-black bg-gray-100 dark:bg-[#111] px-1">{chunks}</span>,
                defaultValue: `POSICIONADO EN EL TOP <highlight>${100 - myActionableScore.percentile}%</highlight> NACIONAL`
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}