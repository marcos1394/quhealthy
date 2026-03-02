"use client";

import React, { useEffect } from 'react';
import { Shield, Star, CalendarX, Activity, UserCheck, Info, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProviderScore } from '@/hooks/useProviderScore';
import { useSessionStore } from '@/stores/SessionStore';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';

export function ProviderReputationCard() {
  const { user } = useSessionStore();
  const { singleScore, isLoading, fetchSingleScore } = useProviderScore();

  useEffect(() => {
    if (user?.id) {
      fetchSingleScore(Number(user.id));
    }
  }, [user?.id, fetchSingleScore]);

  const pillarIcons: Record<string, React.ReactNode> = {
    P1: <Shield className="w-4 h-4 text-blue-500" />,
    P2: <Star className="w-4 h-4 text-amber-500" />,
    P3: <CalendarX className="w-4 h-4 text-rose-500" />,
    P4: <Activity className="w-4 h-4 text-emerald-500" />,
    P5: <UserCheck className="w-4 h-4 text-indigo-500" />
  };

  const getProgressColor = (status: string) => {
    if (status === 'OPTIMAL') return 'bg-emerald-500';
    if (status === 'IMPROVABLE') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-500 animate-spin" />
      </Card>
    );
  }

  if (!singleScore || singleScore.isNewProvider || singleScore.band === 'NUEVO') {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white border-0 shadow-xl overflow-hidden relative min-h-[350px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-medical-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <CardContent className="p-6 relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/10">
            <Sparkles className="w-8 h-8 text-medical-300" />
          </div>
          <h3 className="text-xl font-bold">Desbloquea tu QuScore</h3>
          <p className="text-slate-300 font-light text-sm">
            Completa al menos 5 consultas a través de QuHealthy para desbloquear tu Índice de Reputación y destacar en las búsquedas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[350px]">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-medical-600 dark:text-medical-400" /> Mi Reputación
          </CardTitle>
          <ProviderScoreBadge scoreData={singleScore} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
          Actualizado: {new Date(singleScore.lastCalculatedAt).toLocaleDateString()}
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
                      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      <p>{pillar.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{pillar.percentage}%</span>
              </div>
              {/* 🚀 CORRECCIÓN DEL ERROR AQUÍ: Usamos indicatorColor */}
              <Progress 
                value={pillar.percentage} 
                className="h-2"
                indicatorColor={getProgressColor(pillar.status)}
              />
            </div>
          ))}
        </TooltipProvider>

        {singleScore.percentile && (
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Estás en el <span className="text-medical-600 font-bold">Top {100 - singleScore.percentile}%</span> de tu zona.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}