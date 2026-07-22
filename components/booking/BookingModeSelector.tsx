"use client";

import React from "react";
import { m } from "framer-motion";
import { Calendar as CalendarIcon, Package } from "lucide-react";
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
  return (
    <m.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
          <span className="font-bold text-sm">{stepNumber}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">
            ¿Qué deseas hacer?
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-300 dark:border-gray-700 ml-0 md:ml-16">
        <button
          type="button"
          className={cn(
            "p-6 flex items-center gap-4 transition-colors",
            scheduleNow
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-white text-gray-500 dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111]",
          )}
          onClick={() => onSetScheduleNow(true)}
        >
          <CalendarIcon className="w-5 h-5" strokeWidth={1.5} />
          <div className="text-left">
            <h4 className="font-bold text-[10px] uppercase tracking-widest">
              Agendar Cita
            </h4>
            <p className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">
              Elegir fecha y pagar
            </p>
          </div>
        </button>
        <button
          type="button"
          className={cn(
            "p-6 flex items-center gap-4 transition-colors border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-700",
            !scheduleNow
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-white text-gray-500 dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111]",
          )}
          onClick={() => onSetScheduleNow(false)}
        >
          <Package className="w-5 h-5" strokeWidth={1.5} />
          <div className="text-left">
            <h4 className="font-bold text-[10px] uppercase tracking-widest">
              Comprar para después
            </h4>
            <p className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">
              Paga ahora, agenda cuando quieras
            </p>
          </div>
        </button>
      </div>
    </m.section>
  );
}
