"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es } from "date-fns/locale";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2 as LoaderIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Tipos
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

  // Traer disponibilidad desde API
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

        const { data } = await axios.get(`/api/calendar/availability/${providerId}`, {
          params: { startDate, endDate },
        });

        const slotsAsDates = data.map((slot: string) => parseISO(slot));
        setAvailableSlots(slotsAsDates);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [providerId, currentMonth]);

  // Agrupar slots por día
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
    <div className="relative max-w-6xl mx-auto" aria-live="polite">
      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl"></div>

      <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/20">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Reserva tu Cita
              </h3>
              <p className="text-gray-400 mt-1">
                Selecciona el día y horario que mejor se adapte a ti
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Contenedor del Calendario */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm bg-gray-800/50 rounded-2xl p-4 border border-gray-700/30 overflow-hidden">
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={es}
                  modifiers={{ 
                    available: availableDays 
                  }}
                  disabled={{ before: new Date() }}
                  showOutsideDays
                  classNames={{
                    root: "rdp text-white",
                    months: "rdp-months",
                    month: "rdp-month",
                    caption: "rdp-caption flex justify-between items-center py-4 px-2 mb-4",
                    caption_label: "rdp-caption_label text-lg font-semibold text-white capitalize order-2",
                    nav: "rdp-nav flex items-center gap-2",
                    nav_button: "rdp-nav_button w-8 h-8 rounded-full border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-purple-600/40 hover:text-white hover:border-purple-500/50 transition-all flex items-center justify-center z-10",
                    nav_button_previous: "rdp-nav_button_previous order-1",
                    nav_button_next: "rdp-nav_button_next order-3",
                    table: "rdp-table w-full border-collapse mt-2",
                    head_row: "rdp-head_row",
                    head_cell: "rdp-head_cell text-gray-400 font-medium text-xs p-2 text-center border-b border-gray-700/50 pb-3",
                    row: "rdp-row",
                    cell: "rdp-cell text-center p-1 relative",
                    day: "rdp-day inline-flex items-center justify-center w-10 h-10 rounded-lg font-normal text-gray-300 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer relative z-0",
                    day_range_end: "rdp-day_range_end",
                    day_selected: "rdp-day_selected bg-purple-600 text-white hover:bg-purple-700 font-semibold z-10",
                    day_today: "rdp-day_today ring-2 ring-purple-400 font-semibold z-10",
                    day_outside: "rdp-day_outside text-gray-600 opacity-50",
                    day_disabled: "rdp-day_disabled text-gray-600 opacity-30 cursor-not-allowed hover:bg-transparent hover:text-gray-600",
                    day_range_middle: "rdp-day_range_middle",
                    day_hidden: "rdp-day_hidden invisible",
                  }}
                  modifiersClassNames={{
                    available: "!bg-emerald-500/20 !text-emerald-300 !border-2 !border-emerald-500/40 font-semibold relative z-20 after:content-[''] after:absolute after:bottom-0.5 after:right-0.5 after:w-1.5 after:h-1.5 after:bg-emerald-400 after:rounded-full after:z-30"
                  }}
                />
              </div>
              
              {/* Leyenda */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm bg-gray-900/30 rounded-xl p-3 border border-gray-700/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-purple-400 flex-shrink-0"></div>
                  <span className="text-gray-300 text-xs">Hoy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 border-2 border-emerald-500/40 relative flex-shrink-0">
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-300 text-xs">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-600 flex-shrink-0"></div>
                  <span className="text-gray-300 text-xs">Seleccionado</span>
                </div>
              </div>
            </div>
            
            {/* Contenedor de los Horarios */}
            <div className="flex flex-col min-h-[400px]">
              <div className="mb-6">
                {selectedDay ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center lg:text-left"
                  >
                    <h4 className="font-bold text-xl text-white mb-2">
                      {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}
                    </h4>
                    <p className="text-gray-400">
                      {isLoading ? (
                        <span className="flex items-center gap-2 justify-center lg:justify-start">
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                          Cargando horarios...
                        </span>
                      ) : (
                        `${selectedDaySlots.length} ${selectedDaySlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}`
                      )}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full w-fit mx-auto mb-4">
                      <Clock className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-white text-lg mb-2">Selecciona un día</h4>
                    <p className="text-gray-400">Elige una fecha disponible para ver los horarios</p>
                  </div>
                )}
              </div>

              {/* Grid de horarios */}
              {!isLoading && selectedDay && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1"
                >
                  {selectedDaySlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-purple-500/50 scrollbar-thumb-rounded-full hover:scrollbar-thumb-purple-500/70 pr-2">
                      {selectedDaySlots.map((slot, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Button 
                            variant="outline" 
                            className="group w-full h-12 border-gray-600/50 bg-gray-700/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:border-transparent text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                            onClick={() => onSlotSelect(slot)}
                          >
                            <span className="font-medium">{format(slot, 'HH:mm')}</span>
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/30">
                      <div className="p-3 bg-gray-700/50 rounded-full w-fit mx-auto mb-4">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-400">No hay horarios disponibles este día</p>
                      <p className="text-gray-500 text-sm mt-1">Selecciona otra fecha</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-300 font-medium text-sm">Reserva Instantánea</p>
              <p className="text-gray-400 text-xs">Tu cita se confirmará inmediatamente al seleccionar un horario</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};