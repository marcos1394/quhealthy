"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isSelected: boolean;
  providerColor: string;
  onSelect: (time: string) => void;
}

export function TimeSlot({ time, isSelected, providerColor, onSelect }: TimeSlotProps) {
  return (
    <button
      onClick={() => onSelect(time)}
      className={cn(
        "h-12 rounded-none border text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3",
        isSelected
          ? "text-white border-transparent"
          : "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a]"
      )}
      style={isSelected ? {
        backgroundColor: providerColor,
        borderColor: providerColor,
      } : {}}
    >
      {isSelected && <Clock className="w-3.5 h-3.5" strokeWidth={2} />}
      {time}
    </button>
  );
}