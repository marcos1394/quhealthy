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
          ? "bg-store-600 border-store-600 text-white shadow-sm font-bold"
          : isDisabled
            ? "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700 opacity-60 cursor-not-allowed"
            : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-store-500/50 hover:bg-store-50/40 dark:hover:bg-store-950/20 hover:text-store-600 dark:hover:text-store-400"
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