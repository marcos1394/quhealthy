"use client";

import React from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Droplet, Activity, Thermometer, FlaskConical, Smile, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/SessionStore";
import { CyclePredictionDto, MenstrualCycleLog } from "@/services/womensHealth.service";

interface TodayCheckInWidgetProps {
  cycles: MenstrualCycleLog[];
  prediction: CyclePredictionDto | null;
  onOpenSymptomModal: () => void;
  onOpenFertilityModal: () => void;
  onOpenCycleModal: () => void;
}

export function TodayCheckInWidget({ 
  cycles, 
  prediction, 
  onOpenSymptomModal, 
  onOpenFertilityModal,
  onOpenCycleModal 
}: TodayCheckInWidgetProps) {
  const { user } = useSessionStore();
  const today = new Date();
  
  // Calcular el día del ciclo actual
  let currentCycleDay = 0;
  if (cycles && cycles.length > 0) {
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const latestCycle = sortedCycles[0];
    const startDate = parseISO(latestCycle.startDate);
    
    if (today >= startDate) {
      currentCycleDay = differenceInDays(today, startDate) + 1;
    }
  }

  // Determinar el estado actual usando predicciones
  let currentStatus = "Calculando tu estado...";
  let statusColor = "text-gray-500";
  let statusIcon = null;

  if (prediction) {
    const nextPeriodStart = parseISO(prediction.nextPeriodStart);
    const fertileStart = parseISO(prediction.fertileWindowStart);
    const fertileEnd = parseISO(prediction.fertileWindowEnd);
    const ovulation = parseISO(prediction.ovulationDate);

    const daysToPeriod = differenceInDays(nextPeriodStart, today);
    const daysToOvulation = differenceInDays(ovulation, today);

    if (daysToPeriod >= 0 && daysToPeriod <= 3) {
      currentStatus = `Tu periodo se estima en ${daysToPeriod === 0 ? 'hoy' : daysToPeriod + ' días'}`;
      statusColor = "text-rose-500";
      statusIcon = "🩸";
    } else if (today >= fertileStart && today <= fertileEnd) {
      currentStatus = "Ventana fértil";
      statusColor = "text-emerald-500";
      statusIcon = "🟢";
      
      if (daysToOvulation === 1) {
        currentStatus += " · Ovulación estimada mañana";
        statusIcon = "⭐";
        statusColor = "text-purple-500";
      } else if (daysToOvulation === 0) {
        currentStatus += " · Ovulación estimada hoy";
        statusIcon = "⭐";
        statusColor = "text-purple-500";
      }
    } else {
      currentStatus = "Fase folicular o lútea";
      statusColor = "text-indigo-500";
    }
  }

  const firstName = user?.name?.split(" ")[0] || "María";

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 blur-3xl -z-10 rounded-full" />
      
      {/* Header section */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Buenos días, <span className="font-bold text-gray-900 dark:text-white">{firstName}</span>
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
            Hoy · {format(today, "d 'de' MMMM", { locale: es })}
          </span>
          {currentCycleDay > 0 && (
            <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-medium">
              Día {currentCycleDay} del ciclo
            </span>
          )}
        </div>
      </div>

      {/* Status section */}
      <div className={`flex items-center gap-2 text-lg font-semibold ${statusColor} mb-8`}>
        {statusIcon && <span>{statusIcon}</span>}
        {currentStatus}
      </div>

      {/* Check-in Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">¿Cómo te sientes hoy?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <Button 
            variant="outline" 
            onClick={onOpenCycleModal}
            className="flex flex-col h-auto py-3 gap-2 border-rose-100 bg-rose-50/50 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl"
          >
            <Droplet className="w-5 h-5" />
            <span className="text-xs font-semibold">Sangrado</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onOpenSymptomModal}
            className="flex flex-col h-auto py-3 gap-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"
          >
            <Smile className="w-5 h-5" />
            <span className="text-xs font-semibold">Humor</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={onOpenSymptomModal}
            className="flex flex-col h-auto py-3 gap-2 border-orange-100 bg-orange-50/50 hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-900/10 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl"
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs font-semibold">Síntomas</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onOpenSymptomModal}
            className="flex flex-col h-auto py-3 gap-2 border-cyan-100 bg-cyan-50/50 hover:bg-cyan-100 dark:border-cyan-900/30 dark:bg-cyan-900/10 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-2xl"
          >
            <Wind className="w-5 h-5" />
            <span className="text-xs font-semibold">Flujo</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={onOpenFertilityModal}
            className="flex flex-col h-auto py-3 gap-2 border-purple-100 bg-purple-50/50 hover:bg-purple-100 dark:border-purple-900/30 dark:bg-purple-900/10 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl"
          >
            <Thermometer className="w-5 h-5" />
            <span className="text-xs font-semibold">Temp.</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={onOpenFertilityModal}
            className="flex flex-col h-auto py-3 gap-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl"
          >
            <FlaskConical className="w-5 h-5" />
            <span className="text-xs font-semibold">Test</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
