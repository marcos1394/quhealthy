"use client";

import React, { useState, useMemo } from "react";
import { format, parseISO, eachDayOfInterval, isBefore, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { CyclePredictionDto, MenstrualCycleLog } from "@/services/womensHealth.service";
import { Button } from "@/components/ui/button";
import { Droplet, Info, Plus } from "lucide-react";

interface WomensHealthCalendarProps {
  cycles: MenstrualCycleLog[];
  prediction: CyclePredictionDto | null;
  onQuickLogCycle: (startDate: string, endDate?: string) => void;
  onOpenDayDetails: (date: Date) => void;
  isLoading?: boolean;
}

export function WomensHealthCalendar({ 
  cycles, 
  prediction, 
  onQuickLogCycle,
  onOpenDayDetails,
  isLoading
}: WomensHealthCalendarProps) {
  // Estado para la selección del rango
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // Generar modifiers basados en los ciclos históricos y las predicciones
  const { modifiers, modifiersStyles } = useMemo(() => {
    let menstruationDates: Date[] = [];
    let fertileDates: Date[] = [];
    let ovulationDates: Date[] = [];
    let estimatedPeriodDates: Date[] = [];

    // 1. Días de menstruación registrados
    cycles.forEach((cycle) => {
      if (cycle.startDate) {
        const start = parseISO(cycle.startDate);
        const end = cycle.endDate ? parseISO(cycle.endDate) : new Date(); // Si no hay fin, hasta hoy o usar solo inicio
        
        try {
           const days = eachDayOfInterval({ start, end });
           menstruationDates = [...menstruationDates, ...days];
        } catch(e) {
           menstruationDates.push(start);
        }
      }
    });

    // 2. Predicciones
    if (prediction) {
      if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
        try {
          const days = eachDayOfInterval({ 
            start: parseISO(prediction.fertileWindowStart), 
            end: parseISO(prediction.fertileWindowEnd) 
          });
          fertileDates = [...fertileDates, ...days];
        } catch (e) {}
      }

      if (prediction.ovulationDate) {
        ovulationDates.push(parseISO(prediction.ovulationDate));
      }

      if (prediction.nextPeriodStart && prediction.nextPeriodEnd) {
        try {
          const days = eachDayOfInterval({ 
            start: parseISO(prediction.nextPeriodStart), 
            end: parseISO(prediction.nextPeriodEnd) 
          });
          estimatedPeriodDates = [...estimatedPeriodDates, ...days];
        } catch(e) {}
      }
    }

    return {
      modifiers: {
        menstruation: menstruationDates,
        fertile: fertileDates,
        ovulation: ovulationDates,
        estimated_period: estimatedPeriodDates,
      },
      modifiersStyles: {
        menstruation: { 
          backgroundColor: "#fce7f3", 
          color: "#be185d", 
          fontWeight: "bold",
          borderRadius: "0" 
        },
        fertile: { 
          backgroundColor: "#dcfce3", 
          color: "#166534" 
        },
        ovulation: { 
          backgroundColor: "#f3e8ff", 
          color: "#7e22ce", 
          fontWeight: "bold",
          border: "2px solid #a855f7"
        },
        estimated_period: { 
          background: "repeating-linear-gradient(45deg, #fce7f3, #fce7f3 5px, #fbcfe8 5px, #fbcfe8 10px)",
          color: "#be185d"
        }
      }
    };
  }, [cycles, prediction]);

  const handleDayClick = (day: Date, modifiers: any) => {
    if (!selectedRange?.from && !selectedRange?.to) {
      onOpenDayDetails(day);
    }
  };

  const handleSaveRange = () => {
    if (selectedRange?.from) {
      const startStr = format(selectedRange.from, "yyyy-MM-dd");
      const endStr = selectedRange.to ? format(selectedRange.to, "yyyy-MM-dd") : undefined;
      onQuickLogCycle(startStr, endStr);
      setSelectedRange(undefined); // Resetear selección
    }
  };

  const hasRangeSelected = selectedRange?.from != null;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tu Calendario</h3>
        <Button variant="ghost" size="sm" className="text-gray-500 rounded-xl" onClick={() => onOpenDayDetails(new Date())}>
          <Plus className="w-4 h-4 mr-2" /> Agregar Detalles
        </Button>
      </div>

      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={setSelectedRange}
          onDayClick={handleDayClick}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          locale={es}
          className="scale-105 sm:scale-110 md:scale-125 transform-gpu mt-4 mb-8"
        />
      </div>

      {/* Quick Action Bar for selected range */}
      {hasRangeSelected && (
        <div className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div>
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
              {selectedRange.to && selectedRange.to !== selectedRange.from 
                ? `Del ${format(selectedRange.from!, "d 'de' MMM")} al ${format(selectedRange.to, "d 'de' MMM")}`
                : `Día ${format(selectedRange.from!, "d 'de' MMMM")}`}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">¿Tuviste menstruación estos días?</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none border-rose-200 text-rose-600 rounded-xl" onClick={() => setSelectedRange(undefined)}>
              Cancelar
            </Button>
            <Button className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white rounded-xl" onClick={handleSaveRange} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Sí, Registrar"}
            </Button>
          </div>
        </div>
      )}

      {/* Visual Legend */}
      {!hasRangeSelected && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-[#fce7f3]" /> Menstruación
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-[#dcfce3]" /> Ventana Fértil
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-purple-100" /> Ovulación
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full" style={{ background: "repeating-linear-gradient(45deg, #fce7f3, #fce7f3 2px, #fbcfe8 2px, #fbcfe8 4px)" }} /> Estimado
          </div>
        </div>
      )}
    </div>
  );
}
