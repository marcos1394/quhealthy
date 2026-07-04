"use client"
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Star, CalendarX, Activity, UserCheck, Info, Sparkles, TrendingUp, ChevronDown, ChevronUp, Heart, Globe } from 'lucide-react';
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
 P5: <UserCheck className="w-4 h-4" strokeWidth={1.5} />,
 P6: <Heart className="w-4 h-4" strokeWidth={1.5} />,
 P7: <Globe className="w-4 h-4" strokeWidth={1.5} />
 };

 const getProgressColorClass = (status: string) => {
 if (status === 'OPTIMAL') return 'bg-black dark:bg-white';
 if (status === 'IMPROVABLE') return 'bg-amber-500 dark:bg-amber-400'; 
 return 'bg-gray-300 dark:bg-gray-700';
 };

 if (isLoading) {
 return (
 <div className="bg-gray-50 dark:bg-[#050505] border border-black dark:border-white min-h-[350px] flex flex-col items-center justify-center gap-6 transition-colors rounded-none">
 <QhSpinner size="md" className="text-black dark:text-white" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
 {t('loading', { defaultValue: 'EXTRAYENDO AUDITORÍA DE REPUTACIÓN...' })}
 </p>
 </div>
 );
 }

 // Estado: Proveedor Nuevo (Bloque Técnico)
 if (!myActionableScore || myActionableScore.isNewProvider || myActionableScore.band === 'NUEVO') {
 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white min-h-[350px] flex flex-col items-center justify-center p-8 text-center transition-colors rounded-none">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6 shrink-0">
 <Sparkles className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h3 className="text-lg font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
 {t('unlock_title', { defaultValue: 'EXPEDIENTE EN DESARROLLO' })}
 </h3>
 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mt-2">
 {t('unlock_desc', { defaultValue: 'El algoritmo requiere un volumen transaccional mínimo para generar una métrica representativa.' })}
 </p>
 </div>
 );
 }

 // Estado: Proveedor con Score
 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col min-h-[350px] transition-colors rounded-none">
 
 {/* Header Arquitectónico */}
 <div className="border-b border-black dark:border-white p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Métricas de Calidad
 </p>
 <h2 className="text-lg md:text-xl font-semibold uppercase tracking-tight text-black dark:text-white flex items-center gap-3 leading-none">
 <Sparkles className="w-5 h-5" strokeWidth={1.5} /> 
 Auditoría Quscore
 </h2>
 </div>
 <div className="flex flex-col md:items-end">
 <ProviderScoreBadge scoreData={myActionableScore} />
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-2">
 {t('updated_at', { 
 date: new Date(myActionableScore.lastCalculatedAt).toLocaleDateString(),
 defaultValue: `CORTE: ${new Date(myActionableScore.lastCalculatedAt).toLocaleDateString()}` 
 })}
 </p>
 </div>
 </div>

 {/* Body: Grid Blueprint de Pilares */}
 <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#050505]">
 <TooltipProvider delayDuration={200}>
 {myActionableScore.breakdown && Object.entries(myActionableScore.breakdown).map(([key, pillar]) => {
 const hasActions = pillar.actions && pillar.actions.length > 0;
 const isExpanded = expandedPillar === key;

 return (
 <div key={key} className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors">
 <div 
 className={cn(
 "p-6 flex flex-col gap-4 group", 
 hasActions && "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505]"
 )}
 onClick={() => hasActions && setExpandedPillar(isExpanded ? null : key)}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
 {pillarIcons[key]}
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {pillar.name}
 </span>
 <Tooltip>
 <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black dark:hover:text-white cursor-help transition-colors" strokeWidth={1.5} />
 </TooltipTrigger>
 <TooltipContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-4 rounded-none max-w-xs shadow-xl">
 <p className="text-xs font-medium text-black dark:text-white leading-relaxed">
 {pillar.tooltip}
 </p>
 </TooltipContent>
 </Tooltip>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <span className="text-sm font-semibold tracking-widest text-black dark:text-white tabular-nums">
 {pillar.percentage}%
 </span>
 {hasActions && (
 <div className="w-6 h-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 {isExpanded ? <ChevronUp className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5} /> : <ChevronDown className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5} />}
 </div>
 )}
 </div>
 </div>

 {/* Barra de Progreso Milimétrica */}
 <div className="h-2 w-full border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-[#111] overflow-hidden">
 <div 
 className={cn("h-full transition-all duration-500", getProgressColorClass(pillar.status))}
 style={{ width: `${pillar.percentage}%` }}
 />
 </div>
 </div>

 {/* Panel de Acciones Expandible Técnico */}
 {hasActions && isExpanded && (
 <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] space-y-5">
 {pillar.potentialPoints && pillar.potentialPoints > 0 && (
 <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-500/30 px-3 py-1.5 w-fit">
 <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
 DELTA PROYECTADA: +{pillar.potentialPoints} PTS
 </div>
 )}
 <ul className="space-y-4">
 {pillar.actions?.map((action, idx) => (
 <li key={idx} className="flex items-start gap-4">
 <div className="w-4 h-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 mt-0.5">
 <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
 </div>
 <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
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

 {/* Footer Percentil */}
 {myActionableScore.percentile != null && (
 <div className="p-6 border-t border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-center mt-auto">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t.rich('top_percentile', {
 percent: 100 - myActionableScore.percentile,
 highlight: (chunks) => <span className="text-black dark:text-white font-black bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black/20 dark:border-white/20 mx-1">{chunks}</span>,
 defaultValue: `POSICIONADO EN EL TOP ${100 - myActionableScore.percentile}% NACIONAL`
 })}
 </p>
 </div>
 )}
 </div>
 </div>
 );
}