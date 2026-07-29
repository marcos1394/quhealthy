"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CalendarX2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

import { TimeSlot } from "@/components/booking/TimeSlot";

type BookingTimeStepProps = {
  scheduleNow: boolean;
  selectedDate: Date | null;
  stepNumber: number;
  duration: number;
  isLoadingSlots: boolean;
  availableSlots: string[];
  selectedTime: string | null;
  safeColor?: string;
  t?: (key: string) => string;
  onTimeSelect: (time: string) => void;
};

export function BookingTimeStep({
  scheduleNow,
  selectedDate,
  stepNumber,
  duration,
  isLoadingSlots,
  availableSlots,
  selectedTime,
  safeColor,
  onTimeSelect,
}: BookingTimeStepProps) {
  const t = useTranslations("BookingTimeStep");

  return (
    <AnimatePresence>
      {scheduleNow && selectedDate && (
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

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("step_time")}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("duration_badge", { duration })}</span>
            </span>
          </div>

          {/* Tarjeta del Selector de Horarios */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
            {isLoadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse"
                  />
                ))}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableSlots.map((time) => (
                  <TimeSlot
                    key={time}
                    time={time}
                    isSelected={selectedTime === time}
                    providerColor={safeColor}
                    onSelect={(t) => onTimeSelect(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] p-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400">
                  <CalendarX2 className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("no_slots_title")}
                </h3>
                <p className="text-xs font-medium text-gray-500 max-w-sm leading-relaxed">
                  {t("no_slots_desc")}
                </p>
              </div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}