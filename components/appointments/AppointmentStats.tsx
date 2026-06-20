"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
      <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('stat_total', { defaultValue: 'Total' })}</p>
          <p className="text-3xl font-semibold text-black dark:text-white tracking-tight">{stats.total}</p>
        </div>
      </div>

      <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('stat_upcoming', { defaultValue: 'Próximas' })}</p>
          <p className="text-3xl font-semibold text-black dark:text-white tracking-tight">{stats.upcoming}</p>
        </div>
      </div>

      <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('stat_completed', { defaultValue: 'Completadas' })}</p>
          <p className="text-3xl font-semibold text-black dark:text-white tracking-tight">{stats.completed}</p>
        </div>
      </div>

      <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
            <XCircle className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('stat_cancelled', { defaultValue: 'Canceladas' })}</p>
          <p className="text-3xl font-semibold text-black dark:text-white tracking-tight">{stats.cancelled}</p>
        </div>
      </div>
    </div>
  );
}