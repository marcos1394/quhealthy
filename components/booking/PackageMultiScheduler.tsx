"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarX2,
  Package,
  Layers,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

import { CalendarDay } from "@/components/booking/CalendarDay";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { useAvailability } from "@/hooks/useAvailability";
import { StorefrontItem } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface PackageServiceSchedulerItemProps {
  service: StorefrontItem;
  providerId: number;
  providerColor?: string;
  onSchedule: (
    serviceId: number,
    date: Date | null,
    time: string | null
  ) => void;
  index: number;
  scheduledPackageServices: Record<number, { date: Date; time: string }>;
}

const PackageServiceSchedulerItem = ({
  service,
  providerId,
  providerColor,
  onSchedule,
  index,
  scheduledPackageServices,
}: PackageServiceSchedulerItemProps) => {
  const t = useTranslations("PackageScheduler");
  const [saveAsCredit, setSaveAsCredit] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { availableSlots, isLoadingSlots, fetchAvailableSlots } =
    useAvailability();

  const safeColor = providerColor || "#059669";

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
    if (providerId) {
      fetchAvailableSlots(
        providerId,
        undefined,
        date,
        service.durationMinutes || 30
      );
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSchedule(service.id, selectedDate, time);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const isTimeDisabled = (time: string) => {
    if (!selectedDate) return false;
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    for (const [idStr, slot] of Object.entries(scheduledPackageServices)) {
      if (Number(idStr) !== service.id && slot.date && slot.time === time) {
        if (format(new Date(slot.date), "yyyy-MM-dd") === selectedDateStr) {
          return true;
        }
      }
    }
    return false;
  };

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
    <div className="mb-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden font-sans transition-colors">
      {/* ── HEADER DE LA SESIÓN ────────────────────────────────────────── */}
      <div className="bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            {t("session_prefix", { number: index + 1 })}
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {service.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("duration_min", { minutes: service.durationMinutes || 30 })}</span>
          </div>
        </div>

        {/* Selector de Modo para la Sesión */}
        <div className="flex items-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-1 rounded-2xl shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSaveAsCredit(false)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              !saveAsCredit
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
            style={
              !saveAsCredit && providerColor
                ? { backgroundColor: safeColor }
                : undefined
            }
          >
            {t("btn_schedule_now")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSaveAsCredit(true);
              onSchedule(service.id, null, null);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              saveAsCredit
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {t("btn_save_credit")}
          </button>
        </div>
      </div>

      {/* ── CONTENIDO: GUARDAR COMO CRÉDITO O CALENDARIO ────────────────── */}
      {saveAsCredit ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#0a0a0a] flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
            <Package className="w-7 h-7" strokeWidth={2} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
            {t("credit_title")}
          </h4>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {t("credit_desc")}
          </p>
        </div>
      ) : (
        <div className="p-6 sm:p-8 flex flex-col xl:flex-row gap-8">
          {/* Calendario de la Sesión */}
          <div className="flex-1 xl:max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <CalendarIcon className="w-4 h-4" strokeWidth={2} />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white capitalize tracking-tight">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Días de la Semana */}
            <div className="grid grid-cols-7 mb-2">
              {weekdays.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid Días */}
            <div className="grid grid-cols-7 gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
              {calendarDays.map((date, i) => (
                <div key={i} className="p-0.5">
                  <CalendarDay
                    date={date}
                    isCurrentMonth={isSameMonth(date, monthStart)}
                    isPast={isBefore(date, startOfDay(new Date()))}
                    selectedDate={selectedDate}
                    providerColor={providerColor}
                    onSelect={handleDateSelect}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Horarios de la Sesión */}
          <div className="flex-1 xl:border-l xl:border-gray-100 xl:dark:border-gray-800 xl:pl-8">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white capitalize mb-6">
              {selectedDate
                ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                : t("select_date_prompt")}
            </h4>

            {selectedDate ? (
              isLoadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2.5">
                  {availableSlots.map((time) => (
                    <TimeSlot
                      key={time}
                      time={time}
                      isSelected={selectedTime === time}
                      isDisabled={isTimeDisabled(time)}
                      providerColor={providerColor}
                      onSelect={handleTimeSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505]">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400 mb-3">
                    <CalendarX2 className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                    {t("no_slots_title")}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400">
                    {t("no_slots_desc")}
                  </p>
                </div>
              )
            ) : (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/30 dark:bg-[#050505]">
                <CalendarIcon className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" strokeWidth={1.5} />
                <p className="text-xs font-medium text-gray-400">
                  {t("select_date_prompt")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface PackageMultiSchedulerProps {
  cart: StorefrontItem[];
  providerId: number;
  providerColor?: string;
  onSchedulePackageService: (
    serviceId: number,
    date: Date | null,
    time: string | null
  ) => void;
  stepCounterStart: number;
  scheduledPackageServices: Record<number, { date: Date; time: string }>;
}

export function PackageMultiScheduler({
  cart,
  providerId,
  providerColor,
  onSchedulePackageService,
  stepCounterStart,
  scheduledPackageServices,
}: PackageMultiSchedulerProps) {
  const t = useTranslations("PackageScheduler");

  // Extraemos todos los servicios que vienen dentro de los paquetes del carrito
  const packageServices = cart
    .filter((item) => item.type === "PACKAGE")
    .flatMap((pkg) =>
      (pkg.packageContents || []).filter((sub) => sub.type === "SERVICE")
    );

  if (packageServices.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden font-sans space-y-6 mt-8"
      >
        {/* Header del Paso */}
        <div className="flex items-center gap-3.5 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div
            className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
            style={providerColor ? { backgroundColor: providerColor } : undefined}
          >
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("step_title")}
            </h2>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              {t("step_desc")}
            </p>
          </div>
        </div>

        {/* Lista de Sesiones a Agendar */}
        <div>
          {packageServices.map((service, index) => (
            <PackageServiceSchedulerItem
              key={`${service.id}-${index}`}
              index={index}
              service={service}
              providerId={providerId}
              providerColor={providerColor}
              onSchedule={onSchedulePackageService}
              scheduledPackageServices={scheduledPackageServices}
            />
          ))}
        </div>
      </motion.section>
    </AnimatePresence>
  );
}