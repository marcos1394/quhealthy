"use client";

import React from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, Heart, AlertCircle } from "lucide-react";
import { CyclePredictionDto } from "@/services/womensHealth.service";

interface Props {
  prediction: CyclePredictionDto | null;
}

export function RemindersWidget({ prediction }: Props) {
  if (!prediction) return null;

  const today = new Date();
  
  // Calculate days until next period
  const nextPeriodDate = parseISO(prediction.nextPeriodStart);
  const daysToPeriod = differenceInDays(nextPeriodDate, today);
  
  // Calculate days until fertile window
  const fertileDate = parseISO(prediction.fertileWindowStart);
  const daysToFertile = differenceInDays(fertileDate, today);

  const isPeriodApproaching = daysToPeriod >= 0 && daysToPeriod <= 3;
  const isPeriodNow = daysToPeriod < 0 && daysToPeriod > -7; // Assuming period lasts ~7 days

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-indigo-500" />
        Recordatorios
      </h3>

      <div className="space-y-3">
        {/* Period Reminder */}
        <div className={`p-4 rounded-2xl flex gap-3 ${
          isPeriodApproaching || isPeriodNow 
            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50" 
            : "bg-gray-50 text-gray-700 dark:bg-[#121212] dark:text-gray-300 border border-gray-100 dark:border-gray-800"
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isPeriodApproaching || isPeriodNow ? "text-rose-500" : "text-gray-400"}`} />
          <div>
            <h4 className="font-semibold text-sm">
              {isPeriodNow ? "Tu periodo está activo o retrasado" : "Próximo Periodo"}
            </h4>
            <p className="text-xs mt-1 opacity-90">
              {isPeriodNow 
                ? "Recuerda registrar tus síntomas diariamente."
                : `Faltan ${daysToPeriod} días. Estimado para el ${format(nextPeriodDate, "d 'de' MMMM", { locale: es })}.`}
            </p>
          </div>
        </div>

        {/* Fertile Window Reminder */}
        {daysToFertile >= 0 && (
          <div className="p-4 rounded-2xl flex gap-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
            <Heart className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Ventana Fértil</h4>
              <p className="text-xs mt-1 opacity-90">
                Inicia en {daysToFertile} días. El {format(fertileDate, "d 'de' MMMM", { locale: es })}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
