"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Package, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type BookingModeSelectorProps = {
  scheduleNow: boolean;
  stepNumber: number;
  onSetScheduleNow: (value: boolean) => void;
};

export function BookingModeSelector({
  scheduleNow,
  stepNumber,
  onSetScheduleNow,
}: BookingModeSelectorProps) {
  const t = useTranslations("BookingFlow");

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 font-sans"
    >
      {/* Header del Paso */}
      <div className="flex items-center gap-3.5 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 shadow-xs">
          {stepNumber}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("step_mode_title")}
          </h2>
        </div>
      </div>

      {/* Grid de Modos de Reserva */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opción 1: Agendar Cita Ahora */}
        <button
          type="button"
          onClick={() => onSetScheduleNow(true)}
          className={cn(
            "p-6 rounded-3xl border text-left transition-all duration-300 flex items-start gap-4 relative group cursor-pointer shadow-xs",
            scheduleNow
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/80 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-colors shadow-xs",
              scheduleNow
                ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <CalendarIcon className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-1 flex-1 min-w-0 pr-6">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
              {t("mode_schedule_title")}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("mode_schedule_desc")}
            </p>
          </div>

          {scheduleNow && (
            <CheckCircle2
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute top-6 right-6"
              strokeWidth={2}
            />
          )}
        </button>

        {/* Opción 2: Comprar para después */}
        <button
          type="button"
          onClick={() => onSetScheduleNow(false)}
          className={cn(
            "p-6 rounded-3xl border text-left transition-all duration-300 flex items-start gap-4 relative group cursor-pointer shadow-xs",
            !scheduleNow
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/80 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-colors shadow-xs",
              !scheduleNow
                ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <Package className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-1 flex-1 min-w-0 pr-6">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
              {t("mode_later_title")}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("mode_later_desc")}
            </p>
          </div>

          {!scheduleNow && (
            <CheckCircle2
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute top-6 right-6"
              strokeWidth={2}
            />
          )}
        </button>
      </div>
    </motion.section>
  );
}