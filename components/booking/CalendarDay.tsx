"use client";

import { format, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  selectedDate: Date | null;
  providerColor: string;
  onSelect: (date: Date) => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isPast,
  selectedDate,
  providerColor,
  onSelect
}: CalendarDayProps) {
  const selected = selectedDate ? isSameDay(date, selectedDate) : false;
  const today = isToday(date);

  return (
    <button
      onClick={() => onSelect(date)}
      disabled={isPast || !isCurrentMonth}
      className={cn(
        "relative flex flex-col items-center justify-center h-14 rounded-none transition-colors border",
        !isCurrentMonth || isPast
          ? "opacity-20 cursor-not-allowed border-transparent"
          : "hover:border-black dark:hover:border-white cursor-pointer",
        selected
          ? "z-10"
          : "bg-gray-50 dark:bg-[#050505] border-transparent"
      )}
      style={selected ? {
        backgroundColor: providerColor,
        borderColor: providerColor,
        color: '#ffffff'
      } : {}}
    >
      {today && !selected && (
        <span className="absolute top-2 left-2 w-1.5 h-1.5 bg-black dark:bg-white" />
      )}

      <span className={cn(
        "text-xs font-bold uppercase tracking-widest",
        selected
          ? "text-white"
          : isCurrentMonth && !isPast
            ? "text-black dark:text-white"
            : "text-gray-400 dark:text-gray-600"
      )}>
        {format(date, 'd')}
      </span>
    </button>
  );
}