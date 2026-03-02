"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AppointmentStatsProps {
  stats: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export function AppointmentStats({ stats }: AppointmentStatsProps) {
  const t = useTranslations('PatientAppointments');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_total', { defaultValue: 'Total' })}</p>
              <p className="text-2xl font-bold text-medical-600 dark:text-medical-400">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-medical-300 dark:text-medical-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_upcoming', { defaultValue: 'Próximas' })}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.upcoming}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-300 dark:text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_completed', { defaultValue: 'Completadas' })}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-300 dark:text-emerald-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_cancelled', { defaultValue: 'Canceladas' })}</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-red-400">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-rose-300 dark:text-red-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}