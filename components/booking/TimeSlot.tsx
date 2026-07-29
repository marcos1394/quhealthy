"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isSelected: boolean;
  isDisabled?: boolean;
  providerColor?: string;
  onSelect: (time: string) => void;
}

export function TimeSlot({
  time,
  isSelected,
  isDisabled = false,
  providerColor,
  onSelect,
}: TimeSlotProps) {
  const safeColor = providerColor || "#059669"; // Emerald 600 fallback

  return (
    <button
      type="button"
      onClick={() => onSelect(time)}
      disabled={isDisabled}
      className={cn(
        "h-11 px-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs",
        isSelected
          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
          : isDisabled
            ? "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700 opacity-60 cursor-not-allowed"
            : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400"
      )}
      style={
        isSelected && providerColor
          ? { backgroundColor: safeColor, borderColor: safeColor }
          : undefined
      }
    >
      {isSelected && <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
      <span>{time}</span>
    </button>
  );
}