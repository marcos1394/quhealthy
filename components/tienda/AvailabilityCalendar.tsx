"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es } from "date-fns/locale";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import axios from "axios";
import { Calendar,  Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz'; // 1. Importamos la función clave

interface AvailabilityCalendarProps {
  providerId: number;
  onSlotSelect: (slot: Date) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  providerId,
  onSlotSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

        const { data } = await axios.get(`/api/calendar/availability/${providerId}`, {
          params: { startDate, endDate },
        });
        
        setAvailableSlots(data.map((slot: string) => parseISO(slot)));
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [providerId, currentMonth]);

  const slotsByDay = useMemo(() => {
    return availableSlots.reduce((acc, slot) => {
      // --- CORRECCIÓN DE ZONA HORARIA ---
      // Agrupamos por día usando el string ISO (que está en UTC) para evitar desfases
      const day = slot.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {} as Record<string, Date[]>);
  }, [availableSlots]);

   const availableDays = Object.keys(slotsByDay).map((d) => parseISO(d)); // Usamos parseISO para interpretar la fecha UTC
  const selectedDaySlots = selectedDay ? slotsByDay[formatInTimeZone(selectedDay, 'UTC', "yyyy-MM-dd")] || [] : [];

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Agenda una Cita</h3>
      </div>
      
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        locale={es}
        modifiers={{ available: availableDays }}
        disabled={{ before: new Date() }}
        showOutsideDays
        classNames={{
            root: "bg-gray-800/50 p-4 rounded-xl border border-gray-700 w-full",
            caption: "flex justify-center text-center relative items-center mb-4",
            caption_label: "text-lg font-bold text-white",
            nav_button_previous: "absolute left-0 h-8 w-8 bg-gray-700/50 hover:bg-purple-500/20 p-1 rounded-lg",
            nav_button_next: "absolute right-0 h-8 w-8 bg-gray-700/50 hover:bg-purple-500/20 p-1 rounded-lg",
            table: "w-full border-collapse",
            head_row: "flex justify-around",
            head_cell: "text-gray-400 w-10 font-normal text-sm",
            row: "flex w-full mt-2 justify-around",
            cell: "p-0",
            day: "h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-purple-500/20",
            day_selected: "bg-purple-600 text-white hover:bg-purple-700",
            day_today: "ring-2 ring-purple-400",
            day_disabled: "text-gray-600 opacity-50",
            day_outside: "text-gray-600 opacity-50",
        }}
        modifiersClassNames={{ available: "font-bold border-2 border-green-500/30" }}
      />
      
      <div className="border-t-2 border-gray-700/50 pt-6 min-h-[150px]">
        <h4 className="font-bold text-lg text-white mb-2">
          {selectedDay ? format(selectedDay, "eeee, d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
        </h4>
        
        {isLoading && selectedDay ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400"/></div>
        ) : selectedDay && (
          selectedDaySlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selectedDaySlots.map((slot, i) => (
                <Button key={i} variant="outline" className="border-gray-600 hover:bg-purple-500/20 hover:text-purple-300" onClick={() => onSlotSelect(slot)}>
                  {/* Mostramos la hora en UTC para que coincida con el backend */}
                  {formatInTimeZone(slot, 'UTC', 'HH:mm')}

                </Button>
              ))}
            </div>
          ) : ( <p className="text-gray-500 text-sm">No hay horarios disponibles.</p> )
        )}
      </div>
    </div>
  );
};