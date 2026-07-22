"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const statCards = [
    { id: 'total', label: t('stat_total', { defaultValue: 'Total' }), value: stats.total, icon: Calendar, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { id: 'upcoming', label: t('stat_upcoming', { defaultValue: 'Próximas' }), value: stats.upcoming, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'completed', label: t('stat_completed', { defaultValue: 'Completadas' }), value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'cancelled', label: t('stat_cancelled', { defaultValue: 'Canceladas' }), value: stats.cancelled, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((card) => (
        <div 
          key={card.id}
          className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", card.bg, card.color)}>
              <card.icon className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}