"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Star, CalendarX, Activity, UserCheck, Info, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProviderScore } from '@/hooks/useProviderScore';
import { useSessionStore } from '@/stores/SessionStore';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function ProviderReputationCard() {
  const t = useTranslations('ProviderReputation');
  const { user } = useSessionStore();
  const { singleScore, isLoading, fetchSingleScore } = useProviderScore();

  useEffect(() => {
    if (user?.id) {
      fetchSingleScore(Number(user.id));
    }
  }, [user?.id, fetchSingleScore]);

  const pillarIcons: Record<string, React.ReactNode> = {
    P1: <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
    P2: <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
    P3: <CalendarX className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
    P4: <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    P5: <UserCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
  };

  // 🚀 TRUCO TAILWIND: Usamos [&>div] para pintar el indicador interno de Shadcn 
  // sin provocar errores de TypeScript, soportando modo claro y oscuro.
  const getProgressColorClass = (status: string) => {
    if (status === 'OPTIMAL') return '[&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400';
    if (status === 'IMPROVABLE') return '[&>div]:bg-amber-500 dark:[&>div]:bg-amber-400';
    return '[&>div]:bg-rose-500 dark:[&>div]:bg-rose-400';
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px] flex flex-col items-center justify-center gap-3">
        <QhSpinner size="md" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </Card>
    );
  }

  // Estado: Proveedor Nuevo
  if (!singleScore || singleScore.isNewProvider || singleScore.band === 'NUEVO') {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white border-0 shadow-xl overflow-hidden relative min-h-[350px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-medical-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <CardContent className="p-6 relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
            <Sparkles className="w-8 h-8 text-medical-300" />
          </div>
          <h3 className="text-xl font-bold text-white">{t('unlock_title')}</h3>
          <p className="text-slate-300 font-light text-sm max-w-sm mx-auto leading-relaxed">
            {t('unlock_desc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Estado: Proveedor con Score
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[350px] transition-colors">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-medical-600 dark:text-medical-400" /> {t('title')}
          </CardTitle>
          <ProviderScoreBadge scoreData={singleScore} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
          {t('updated_at', { date: new Date(singleScore.lastCalculatedAt).toLocaleDateString() })}
        </p>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col gap-5">
        <TooltipProvider>
          {singleScore.breakdown && Object.entries(singleScore.breakdown).map(([key, pillar]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  {pillarIcons[key]} {pillar.name}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs bg-slate-900 dark:bg-slate-800 text-white border-slate-700">
                      <p>{pillar.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{pillar.percentage}%</span>
              </div>
              {/* 🚀 EL PROGRESS BAR CORREGIDO */}
              <Progress 
                value={pillar.percentage} 
                className={cn(
                  "h-2 bg-slate-100 dark:bg-slate-800", // Fondo de la barra
                  getProgressColorClass(pillar.status) // Color del indicador dinámico
                )}
              />
            </div>
          ))}
        </TooltipProvider>

        {singleScore.percentile != null && (
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.rich('top_percentile', {
                percent: 100 - singleScore.percentile,
                highlight: (chunks) => <span className="text-medical-600 dark:text-medical-400 font-bold">{chunks}</span>
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}