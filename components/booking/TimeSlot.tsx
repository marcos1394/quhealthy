"use client"
/* eslint-disable react-doctor/button-has-type */;

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isSelected: boolean;
  isDisabled?: boolean;
  providerColor: string;
  onSelect: (time: string) => void;
}

export function TimeSlot({ time, isSelected, isDisabled = false, providerColor, onSelect }: TimeSlotProps) {
  const safeColor = providerColor || '#000000';
  return (
    <button
      onClick={() => onSelect(time)}
      disabled={isDisabled}
      className={cn(
        "h-12 rounded-none border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300",
        isSelected
          ? "text-white border-transparent"
          : isDisabled
          ? "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 opacity-50 cursor-not-allowed"
          : "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:-translate-y-1 hover:shadow-lg hover:[border-color:var(--provider-color)] hover:[color:var(--provider-color)] hover:bg-white dark:hover:bg-[#0a0a0a]"
      )}
      style={{
        ...(isSelected ? { backgroundColor: safeColor, borderColor: safeColor } : {}),
        '--provider-color': safeColor
      } as React.CSSProperties}
    >
      {isSelected && <Clock className="w-3.5 h-3.5" strokeWidth={2} />}
      {time}
    </button>
  );
}