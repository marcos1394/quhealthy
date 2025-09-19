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
  ChevronLeft,
  ChevronRight,
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

  // Inyectar CSS de contingencia para forzar que el DayPicker use table/table-row/table-cell
  // (esto sólo actúa si alguna regla externa sobreescribe los estilos)
  useEffect(() => {
    const css = `
      /* Forzar estructura de tabla si algo externo la rompe */
      .rdp-month_grid { display: table !important; width: 100% !important; border-collapse: collapse !important; }
      .rdp-weekdays, .rdp-weeks { display: table-row-group !important; }
      .rdp-weekday { display: table-cell !important; text-align: center !important; vertical-align: middle !important; }
      .rdp-week { display: table-row !important; }
      .rdp-day, .rdp-day_cell, .rdp-day_button, .rdp-cell { /* asegurar elementos como celdas/botones centrados */
        vertical-align: middle !important;
      }
      .rdp-day_button { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 2.5rem !important; height: 2.5rem !important; border-radius: .375rem !important; }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-rdp-fix", "true");
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className="relative max-w-md mx-auto" aria-live="polite">
      {/* Fondo ligero */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/6 via-transparent to-blue-500/6 rounded-2xl -z-10"></div>

      <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border border-gray-700/40 rounded-2xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-700/10">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Reserva tu cita</h3>
              <p className="text-sm text-gray-400">Selecciona un día disponible</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Calendario */}
            <div className="mx-auto w-full">
              <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={(d) => setSelectedDay(d ?? undefined)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={es}
                  modifiers={{ available: availableDays }}
                  disabled={{ before: new Date() }}
                  showOutsideDays
                  classNames={{
                    root: "text-white",
                    month: "space-y-2",
                    caption: "flex items-center justify-center gap-2 mb-3 relative",
                    caption_label: "text-base font-semibold text-white capitalize",
                    nav: "relative",
                    nav_button:
                      "inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-purple-600/40 hover:text-white transition-all",
                    nav_button_previous: "absolute left-3 top-1/2 -translate-y-1/2",
                    nav_button_next: "absolute right-3 top-1/2 -translate-y-1/2",
                    table: "w-full table-fixed border-collapse",
                    head_row: "table-row",
                    head_cell: "table-cell text-center align-middle text-gray-400 py-1 font-medium text-xs",
                    row: "table-row",
                    cell: "table-cell align-middle p-0",
                    // 'day' applies to the button inside the td; safe to use inline-flex here
                    day: "inline-flex items-center justify-center w-10 h-10 rounded-md font-normal text-gray-300 hover:bg-purple-500/20 hover:text-white transition-colors",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 font-semibold",
                    day_today: "ring-2 ring-purple-400 font-semibold",
                    day_outside: "text-gray-600 opacity-50",
                    day_disabled: "text-gray-600 opacity-30 cursor-not-allowed",
                  }}
                  components={{
                    Chevron: ({ orientation }) =>
                      orientation === "left" ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ),
                  }}
                  modifiersClassNames={{
                    available:
                      "bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 font-semibold relative after:content-[''] after:absolute after:bottom-1 after:right-1 after:w-2 after:h-2 after:bg-emerald-400 after:rounded-full",
                  }}
                />
              </div>

              {/* Leyenda */}
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-purple-400"></div>
                  <span className="text-gray-300">Hoy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/10 border-2 border-emerald-500/30 relative">
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-300">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-600"></div>
                  <span className="text-gray-300">Seleccionado</span>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div>
              {selectedDay ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <h4 className="text-white font-semibold">
                    {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                        Cargando horarios...
                      </span>
                    ) : (
                      `${selectedDaySlots.length} ${selectedDaySlots.length === 1 ? "horario disponible" : "horarios disponibles"}`
                    )}
                  </p>

                  {!isLoading && selectedDaySlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-700/20 scrollbar-thumb-purple-500/40">
                      {selectedDaySlots.map((slot, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}>
                          <Button
                            variant="outline"
                            className="group w-full h-11 border-gray-600/50 bg-gray-700/30 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-transform transform-gpu hover:scale-105"
                            onClick={() => onSlotSelect(slot)}
                          >
                            <span className="font-medium">{format(slot, "HH:mm")}</span>
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    !isLoading && (
                      <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-700/20">
                        <div className="p-2 rounded-full bg-gray-700/40 w-fit mx-auto mb-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-400">No hay horarios disponibles este día</p>
                        <p className="text-gray-500 text-sm mt-1">Selecciona otra fecha</p>
                      </div>
                    )
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-fit mx-auto p-3 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 mb-3">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-white font-medium">Selecciona un día</p>
                  <p className="text-sm text-gray-400">Elige una fecha para ver horarios</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/40 bg-gray-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-300 text-sm font-medium">Reserva instantánea</p>
              <p className="text-xs text-gray-400">Tu cita se confirma inmediatamente al elegir un horario.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
