"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const t = useTranslations('PatientDashboard');

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('greeting', { name: firstName, defaultValue: `¡Hola, ${firstName}! 👋` })}
        </h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-2 font-light">
          {t('subtitle', { defaultValue: 'Aquí tienes un resumen de tu actividad médica.' })}
        </p>
      </div>
    </div>
  );
}