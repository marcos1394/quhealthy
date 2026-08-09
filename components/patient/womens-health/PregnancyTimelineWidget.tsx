"use client";

import React from "react";
import { PregnancyProfileDto } from "@/services/womensHealth.service";
import { Baby, CalendarDays } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface PregnancyTimelineWidgetProps {
  pregnancy: PregnancyProfileDto;
  onStartPostpartum?: () => void;
}

export function PregnancyTimelineWidget({ pregnancy, onStartPostpartum }: PregnancyTimelineWidgetProps) {
  const { currentGestationalWeek, currentGestationalDay, estimatedDueDate } = pregnancy;
  
  const totalWeeks = 40;
  const progressPercent = Math.min((currentGestationalWeek / totalWeeks) * 100, 100);

  const trimester = currentGestationalWeek <= 13 ? 1 : currentGestationalWeek <= 26 ? 2 : 3;

  const babySize =
    currentGestationalWeek < 8 ? "un grano de café" :
    currentGestationalWeek < 12 ? "una frambuesa" :
    currentGestationalWeek < 16 ? "un limón" :
    currentGestationalWeek < 20 ? "un aguacate" :
    currentGestationalWeek < 24 ? "un mango" :
    currentGestationalWeek < 28 ? "una mazorca" :
    currentGestationalWeek < 32 ? "un coco" :
    currentGestationalWeek < 36 ? "una piña" :
    "una sandía pequeña";

  const formatLMP = () => {
    if (!pregnancy.lastMenstrualPeriod) return "N/A";
    return format(parseISO(pregnancy.lastMenstrualPeriod), "dd 'de' MMMM, yyyy", { locale: es });
  };

  const formatEDD = () => {
    if (!estimatedDueDate) return "N/A";
    return format(parseISO(estimatedDueDate), "dd 'de' MMMM, yyyy", { locale: es });
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
      {/* Decorative background blob — rosa sutil */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 dark:bg-pink-900/10 rounded-bl-full -z-0 opacity-60 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center shrink-0">
            <Baby className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
              Trimestre {trimester}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Semana {currentGestationalWeek} <span className="text-base font-medium text-gray-400">y {currentGestationalDay} días</span>
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-0.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Fecha probable de parto
          </p>
          <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
            {formatEDD()}
          </p>
        </div>
      </div>

      <div className="relative z-10 space-y-2 mb-6">
        <div className="flex justify-between text-xs font-medium text-gray-400 dark:text-gray-500">
          <span>FUR: {formatLMP()}</span>
          <span>{Math.round(progressPercent)}% completado</span>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-gray-100 dark:bg-gray-800" indicatorColor="bg-gradient-to-r from-pink-400 to-rose-500" />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Sem. 1</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sem. {currentGestationalWeek}</span>
          <span>Sem. 40</span>
        </div>
      </div>
      
      <div className="relative z-10 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👶</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tu bebé tiene aproximadamente el tamaño de <span className="font-semibold text-gray-800 dark:text-gray-200">{babySize}</span>.
          </p>
        </div>
        {onStartPostpartum && currentGestationalWeek >= 36 && (
          <button 
            onClick={onStartPostpartum}
            className="text-sm bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 py-2 rounded-xl transition-colors shrink-0 w-full sm:w-auto"
          >
            Registrar Nacimiento
          </button>
        )}
      </div>
    </div>
  );
}
