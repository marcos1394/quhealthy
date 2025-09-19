"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es } from "date-fns/locale";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import axios from "axios";
import { Calendar,   Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      const day = format(slot, "yyyy-MM-dd");
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {} as Record<string, Date[]>);
  }, [availableSlots]);

  const availableDays = Object.keys(slotsByDay).map((d) => new Date(d));
  const selectedDaySlots = selectedDay ? slotsByDay[format(selectedDay, "yyyy-MM-dd")] || [] : [];

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Agenda una Cita</h3>
      </div>
      
      {/* El calendario ahora ocupa todo el ancho disponible */}
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
        // Las clases de DayPicker V8
        classNames={{
            root: "w-full",
            caption: "flex justify-between items-center mb-4",
            caption_label: "text-lg font-bold text-white",
            nav_button: "h-8 w-8 bg-gray-700/50 hover:bg-purple-500/20 p-1 rounded-lg",
            head_cell: "text-gray-400 font-normal text-sm w-[14.28%]",
            cell: "w-[14.28%]",
            day: "h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-purple-500/20",
            day_selected: "bg-purple-600 text-white hover:bg-purple-700",
            day_today: "ring-2 ring-purple-400",
            day_disabled: "text-gray-600 opacity-50",
            day_outside: "text-gray-600 opacity-50",
        }}
        modifiersClassNames={{
            available: "font-bold border-2 border-green-500/50"
        }}
      />
      
      {/* --- INICIO DE LA CORRECCIÓN DE LAYOUT --- */}
      {/* La sección de horarios ahora está DEBAJO del calendario, no al lado */}
      <div className="border-t-2 border-gray-700/50 pt-6">
        <div className="mb-4">
          {selectedDay ? (
            <div>
              <h4 className="font-bold text-lg text-white">
                {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}
              </h4>
              <p className="text-gray-400 text-sm">
                {isLoading ? 'Cargando...' : `${selectedDaySlots.length} ${selectedDaySlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}`}
              </p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-white">Selecciona un día</h4>
              <p className="text-gray-400 text-sm">Elige una fecha para ver los horarios.</p>
            </div>
          )}
        </div>

        {isLoading && selectedDay ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400"/></div>
        ) : selectedDay && (
          selectedDaySlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selectedDaySlots.map((slot, i) => (
                <Button key={i} variant="outline" className="border-gray-600 hover:bg-purple-500/20 hover:text-purple-300" onClick={() => onSlotSelect(slot)}>
                   {format(parseISO(slot.toISOString()), 'HH:mm')}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay horarios disponibles este día.</p>
          )
        )}
      </div>
      {/* --- FIN DE LA CORRECCIÓN DE LAYOUT --- */}
    </div>
  );
};