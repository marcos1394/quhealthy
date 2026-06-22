import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export function AppointmentTimeCard({
  dateFormatted,
  timeFormatted,
  durationMinutes
}: {
  dateFormatted: string;
  timeFormatted: string;
  durationMinutes: number;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4" strokeWidth={1.5} />
          Programación Temporal
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800">
        <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
            <Calendar className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Fecha Acordada</p>
            <p className="text-xl font-semibold text-black dark:text-white tracking-tight uppercase">{dateFormatted}</p>
          </div>
        </div>
        <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
            <Clock className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Bloque Horario</p>
            <p className="text-xl font-semibold text-black dark:text-white tracking-tight">
              {timeFormatted} HRS <span className="text-xs font-light text-gray-500 ml-2">[{durationMinutes} MIN]</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
