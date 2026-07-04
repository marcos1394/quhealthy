"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface DashboardHeaderProps {
 firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
 const t = useTranslations('PatientDashboard');

 return (
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
 <div>
 <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
 {t('greeting', { name: firstName, defaultValue: `¡Hola, ${firstName}!` })}
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
 {t('subtitle', { defaultValue: 'Resumen de actividad y expediente médico' })}
 </p>
 </div>
 </div>
 );
}