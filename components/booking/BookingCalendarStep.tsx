"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  isBefore,
  startOfMonth,
  isSameMonth,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

import { CalendarDay } from "@/components/booking/CalendarDay";

type BookingCalendarStepProps = {
  scheduleNow: boolean;
  stepNumber: number;
  currentMonth: Date;
  calendarDays: Date[];
  monthStart: Date;
  selectedDate: Date | null;
  safeColor: string;
  t?: (key: string) => string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: Date) => void;
};

export function BookingCalendarStep({
  scheduleNow,
  stepNumber,
  currentMonth,
  calendarDays,
  monthStart,
  selectedDate,
  safeColor,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
}: BookingCalendarStepProps) {
  const t = useTranslations("BookingFlow");

  const weekdays = [
    t("weekdays.mon"),
    t("weekdays.tue"),
    t("weekdays.wed"),
    t("weekdays.thu"),
    t("weekdays.fri"),
    t("weekdays.sat"),
    t("weekdays.sun"),
  ];

  return (
    <AnimatePresence>
      {scheduleNow && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden space-y-6 font-sans mt-8"
        >
          {/* Header del Paso */}
          <div className="flex items-center gap-3.5 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 shadow-xs">
              {stepNumber}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("step_date")}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                {t("step_date_desc")}
              </p>
            </div>
          </div>

          {/* Tarjeta del Calendario */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
            {/* Navegación de Mes */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <CalendarIcon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize tracking-tight">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onPrevMonth}
                  disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                  suppressHydrationWarning
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={onNextMonth}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Encabezados de Días de la Semana */}
            <div className="grid grid-cols-7 mb-3">
              {weekdays.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de Días */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
              {calendarDays.map((date) => (
                <div key={date.toISOString()} className="p-0.5">
                  <CalendarDay
                    date={date}
                    isCurrentMonth={isSameMonth(date, monthStart)}
                    isPast={isBefore(date, startOfDay(new Date()))}
                    selectedDate={selectedDate}
                    providerColor={safeColor}
                    onSelect={onDateSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}