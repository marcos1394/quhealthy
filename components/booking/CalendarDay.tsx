"use client"
/* eslint-disable react-doctor/button-has-type */;

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
  const safeColor = providerColor || '#000000';

  return (
    <button
      onClick={() => onSelect(date)}
      disabled={isPast || !isCurrentMonth}
      className={cn(
        "relative flex flex-col items-center justify-center h-14 rounded-none border transition-all duration-300",
        !isCurrentMonth || isPast
          ? "opacity-20 cursor-not-allowed border-transparent"
          : "cursor-pointer",
        selected
          ? "z-10"
          : "bg-gray-50 dark:bg-[#050505] border-transparent",
        !selected && isCurrentMonth && !isPast && "hover:-translate-y-1 hover:shadow-[0_4px_20px_rgb(0,0,0,0.12)] hover:z-20 hover:[border-color:var(--provider-color)] hover:[color:var(--provider-color)]"
      )}
      style={{
        ...(selected ? { backgroundColor: safeColor, borderColor: safeColor, color: '#ffffff' } : {}),
        '--provider-color': safeColor
      } as React.CSSProperties}
    >
      {today && !selected && (
        <span 
          className="absolute top-2 left-2 w-1.5 h-1.5 bg-black dark:bg-white transition-colors"
          style={(!selected && isCurrentMonth && !isPast) ? { backgroundColor: safeColor } : {}}
        />
      )}

      <span className={cn(
        "text-xs font-bold uppercase tracking-widest transition-colors",
        selected
          ? "text-white"
          : isCurrentMonth && !isPast
            ? "text-black dark:text-white group-hover:[color:var(--provider-color)]"
            : "text-gray-400 dark:text-gray-600"
      )}>
        {format(date, 'd')}
      </span>
    </button>
  );
}