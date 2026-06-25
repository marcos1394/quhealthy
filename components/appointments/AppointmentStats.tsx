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

  // Consolidamos la configuración en un arreglo para mantener el código DRY (Don't Repeat Yourself)
  const statCards = [
    { id: 'total', label: t('stat_total', { defaultValue: 'Total' }), value: stats.total, icon: Calendar },
    { id: 'upcoming', label: t('stat_upcoming', { defaultValue: 'Próximas' }), value: stats.upcoming, icon: TrendingUp },
    { id: 'completed', label: t('stat_completed', { defaultValue: 'Completadas' }), value: stats.completed, icon: CheckCircle2 },
    { id: 'cancelled', label: t('stat_cancelled', { defaultValue: 'Canceladas' }), value: stats.cancelled, icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
      {statCards.map((card) => (
        <div 
          key={card.id}
          // HOVER DEL CONTENEDOR: Fondo invertido, salto hacia arriba, sombra brutalista y elevación de Z-index
          className="group relative z-0 hover:z-10 border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]"
        >
          <div className="flex items-center justify-between mb-6">
            {/* ÍCONO: Inversión de bordes y fondos en sincronía con la tarjeta */}
            <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors duration-300 shrink-0 group-hover:border-white dark:group-hover:border-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white">
              <card.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            {/* ETIQUETA: Transición sutil de grises para no perderse en el fondo invertido */}
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 transition-colors duration-300 group-hover:text-gray-300 dark:group-hover:text-gray-600">
              {card.label}
            </p>
            {/* VALOR NUMÉRICO: Invierte su contraste absoluto (Negro <-> Blanco) */}
            <p className="text-3xl font-semibold text-black dark:text-white tracking-tight transition-colors duration-300 group-hover:text-white dark:group-hover:text-black">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}