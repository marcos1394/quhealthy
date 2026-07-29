"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { format, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  selectedDate: Date | null;
  providerColor?: string;
  onSelect: (date: Date) => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isPast,
  selectedDate,
  providerColor,
  onSelect,
}: CalendarDayProps) {
  const selected = selectedDate ? isSameDay(date, selectedDate) : false;
  const today = isToday(date);
  const safeColor = providerColor || "#059669";

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      disabled={isPast || !isCurrentMonth}
      className={cn(
        "relative flex flex-col items-center justify-center h-11 w-full rounded-xl border font-sans text-xs font-bold transition-all duration-200 shadow-xs",
        !isCurrentMonth || isPast
          ? "opacity-25 border-transparent cursor-not-allowed bg-transparent text-gray-400"
          : "cursor-pointer",
        selected
          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm z-10 font-bold"
          : isCurrentMonth && !isPast
            ? "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400"
            : ""
      )}
      style={
        selected && providerColor
          ? { backgroundColor: safeColor, borderColor: safeColor }
          : undefined
      }
    >
      {/* Indicador de "Hoy" */}
      {today && !selected && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
      )}

      <span>{format(date, "d")}</span>
    </button>
  );
}