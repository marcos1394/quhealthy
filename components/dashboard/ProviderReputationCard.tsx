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
 if (status === 'OPTIMAL') return 'bg-emerald-500 dark:bg-emerald-400';
 if (status === 'IMPROVABLE') return 'bg-amber-500 dark:bg-amber-400'; 
 return 'bg-gray-300 dark:bg-gray-700';
 };

 if (isLoading) {
 return (
 <div className="bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 min-h-[350px] flex flex-col items-center justify-center gap-6 transition-colors rounded-3xl shadow-sm">
 <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 animate-pulse">
 CUALIFICANDO REPUTACIÓN...
 </p>
 </div>
 );
 }

 // Estado: Proveedor Nuevo (Bloque Técnico)
 if (!myActionableScore || myActionableScore.isNewProvider || myActionableScore.band === 'NUEVO') {
 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 min-h-[350px] flex flex-col items-center justify-center p-8 text-center transition-colors rounded-3xl shadow-sm">
 <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6 shrink-0 shadow-sm">
 <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-none">
 {t('unlock_title', { defaultValue: 'EXPEDIENTE EN DESARROLLO' })}
 </h3>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mt-2">
 {t('unlock_desc', { defaultValue: 'El algoritmo requiere un volumen transaccional mínimo para generar una métrica representativa.' })}
 </p>
 </div>
 );
 }

 // Estado: Proveedor con Score
 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col min-h-[350px] transition-colors rounded-3xl shadow-sm overflow-hidden">
 
 {/* Header Arquitectónico */}
 <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/50 dark:bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
 <div>
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
 Métricas de Calidad
 </p>
 <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 leading-none">
 <Sparkles className="w-6 h-6 text-emerald-600" strokeWidth={2} /> 
 Auditoría Quscore
 </h2>
 </div>
 <div className="flex flex-col md:items-end">
 <ProviderScoreBadge scoreData={myActionableScore} />
 <p className="text-xs font-semibold text-gray-500 mt-2">
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
 <div key={key} className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors">
 <div 
 className={cn(
 "p-6 flex flex-col gap-4 group", 
 hasActions && "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#050505]"
 )}
 onClick={() => hasActions && setExpandedPillar(isExpanded ? null : key)}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#050505] flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:bg-emerald-900/30 transition-colors">
 {pillarIcons[key]}
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-gray-900 dark:text-white">
 {pillar.name}
 </span>
 <Tooltip>
 <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Info className="w-4 h-4 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-help transition-colors" strokeWidth={2} />
 </TooltipTrigger>
 <TooltipContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xl max-w-xs">
 <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
 {pillar.tooltip}
 </p>
 </TooltipContent>
 </Tooltip>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
 {pillar.percentage}%
 </span>
 {hasActions && (
 <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
 {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-700 group-hover:text-emerald-600" strokeWidth={2} /> : <ChevronDown className="w-4 h-4 text-gray-700 group-hover:text-emerald-600" strokeWidth={2} />}
 </div>
 )}
 </div>
 </div>

 {/* Barra de Progreso Milimétrica */}
 <div className="h-3 rounded-full w-full bg-gray-100 dark:bg-[#111] overflow-hidden">
 <div 
 className={cn("h-full rounded-full transition-all duration-500", getProgressColorClass(pillar.status))}
 style={{ width: `${pillar.percentage}%` }}
 />
 </div>
 </div>

 {/* Panel de Acciones Expandible Técnico */}
 {hasActions && isExpanded && (
 <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-5">
 {pillar.potentialPoints && pillar.potentialPoints > 0 && (
 <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
 <TrendingUp className="w-4 h-4" strokeWidth={2} />
 DELTA PROYECTADA: +{pillar.potentialPoints} PTS
 </div>
 )}
 <ul className="space-y-4">
 {pillar.actions?.map((action, idx) => (
 <li key={idx} className="flex items-start gap-4">
 <div className="w-5 h-5 rounded-full border border-gray-200 bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
 <div className="w-2 h-2 rounded-full bg-emerald-500" />
 </div>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
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
 <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0a0a] text-center mt-auto rounded-b-3xl">
 <p className="text-sm font-semibold text-gray-500">
 {t.rich('top_percentile', {
 percent: 100 - myActionableScore.percentile,
 highlight: (chunks) => <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 mx-1">{chunks}</span>,
 defaultValue: `POSICIONADO EN EL TOP ${100 - myActionableScore.percentile}% NACIONAL`
 })}
 </p>
 </div>
 )}
 </div>
 </div>
 );
}