"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface DashboardHeaderProps {
 firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
 const t = useTranslations('PatientDashboard');

 return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('greeting', { name: firstName, defaultValue: `¡Hola, ${firstName}!` })}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
          {t('subtitle', { defaultValue: 'Resumen de actividad y expediente médico' })}
        </p>
      </div>
    </div>
 );
}