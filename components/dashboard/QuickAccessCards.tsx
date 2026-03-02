"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickAccessCards() {
  const router = useRouter();
  const t = useTranslations('PatientDashboard');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Tarjeta de Historial Médico */}
      <Card
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-medical-400 dark:hover:border-medical-500/50 transition-all cursor-pointer group shadow-sm overflow-hidden"
        onClick={() => router.push('/patient/dashboard/appointments')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {t('card_history', { defaultValue: 'Historial Médico' })}
          </CardTitle>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10 transition-colors">
            <Clock className="w-5 h-5 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-light">
            {t('card_history_desc', { defaultValue: 'Accede a tus diagnósticos, recetas y resultados de laboratorio.' })}
          </p>
          <div className="text-xs font-bold text-medical-600 dark:text-medical-400 flex items-center tracking-tight">
            {t('card_history_link', { defaultValue: 'Explorar Documentos' })}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de Expediente/Perfil */}
      <Card
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-medical-400 dark:hover:border-medical-500/50 transition-all cursor-pointer group shadow-sm overflow-hidden"
        onClick={() => router.push('/patient/profile')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {t('card_profile', { defaultValue: 'Mi Expediente' })}
          </CardTitle>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10 transition-colors">
            <User className="w-5 h-5 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-light">
            {t('card_profile_desc', { defaultValue: 'Gestiona tu información de contacto, seguros y familiares.' })}
          </p>
          <div className="text-xs font-bold text-medical-600 dark:text-medical-400 flex items-center tracking-tight">
            {t('card_profile_link', { defaultValue: 'Actualizar Perfil' })}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}