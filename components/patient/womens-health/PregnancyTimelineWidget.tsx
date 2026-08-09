"use client";

import React from "react";
import { PregnancyProfileDto } from "@/services/womensHealth.service";
import { Baby, CalendarDays } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface PregnancyTimelineWidgetProps {
  pregnancy: PregnancyProfileDto;
}

export function PregnancyTimelineWidget({ pregnancy }: PregnancyTimelineWidgetProps) {
  const { currentGestationalWeek, currentGestationalDay, estimatedDueDate } = pregnancy;
  
  const totalWeeks = 40;
  const progressPercent = Math.min((currentGestationalWeek / totalWeeks) * 100, 100);

  const formatLMP = () => {
    if (!pregnancy.lastMenstrualPeriod) return "N/A";
    return format(parseISO(pregnancy.lastMenstrualPeriod), "dd 'de' MMMM, yyyy", { locale: es });
  };

  const formatEDD = () => {
    if (!estimatedDueDate) return "N/A";
    return format(parseISO(estimatedDueDate), "dd 'de' MMMM, yyyy", { locale: es });
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-pink-100 dark:border-pink-900/30 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-bl-full -z-10 opacity-50" />
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center">
            <Baby className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Semana {currentGestationalWeek}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              y {currentGestationalDay} días
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:items-end">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Fecha probable de parto
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {formatEDD()}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span>FUR: {formatLMP()}</span>
          <span>40 Semanas</span>
        </div>
        <Progress value={progressPercent} className="h-3 bg-gray-100 dark:bg-gray-800" indicatorClassName="bg-gradient-to-r from-pink-400 to-rose-500" />
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-6 text-sm">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Desarrollo actual</p>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            Tu bebé tiene aproximadamente el tamaño de {
              currentGestationalWeek < 12 ? "una fresa" :
              currentGestationalWeek < 20 ? "un aguacate" :
              currentGestationalWeek < 30 ? "un coco" :
              "una sandía pequeña"
            }.
          </p>
        </div>
      </div>
    </div>
  );
}
