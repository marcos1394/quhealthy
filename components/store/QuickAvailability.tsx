"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format, addDays } from "date-fns";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { scheduleService } from "@/services/schedule.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

import { StorefrontLocation } from "@/types/storefront";

interface QuickAvailabilityProps {
  providerId: number;
  locations?: StorefrontLocation[];
  selectedLocationId?: number | null;
  onSelectSlot?: (slot: string, locationId?: number) => void;
  className?: string;
}

export const QuickAvailability: React.FC<QuickAvailabilityProps> = ({
  providerId,
  locations = [],
  selectedLocationId,
  onSelectSlot,
  className,
}) => {
  const t = useTranslations("QuickAvailability");
  const [nextSlots, setNextSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveLocationId =
    selectedLocationId ||
    locations.find((loc) => loc.isMain)?.id ||
    (locations.length > 0 ? locations[0].id : undefined);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const tomorrow = addDays(today, 1);

        const slotsToday = await scheduleService.getAvailableSlots(
          providerId,
          effectiveLocationId,
          format(today, "yyyy-MM-dd"),
          format(tomorrow, "yyyy-MM-dd"),
          30
        );

        setNextSlots(slotsToday.slice(0, 3));
      } catch (error) {
        console.error("Error al obtener disponibilidad rápida:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [providerId, effectiveLocationId]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shadow-2xs font-sans", className)}>
        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("next_slots_title")}...
        </span>
      </div>
    );
  }

  if (nextSlots.length === 0) {
    return null;
  }

  return (
    <div
      onClick={() => onSelectSlot ? onSelectSlot(nextSlots[0], effectiveLocationId) : undefined}
      className={cn(
        "p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs hover:border-emerald-500/30 transition-all cursor-pointer group font-sans select-none space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
          <span className="text-xs font-bold tracking-tight">
            {t("next_slots_title")}
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" strokeWidth={2} />
      </div>

      <div className="flex flex-wrap gap-2">
        {nextSlots.map((slot, i) => {
          let dateObj: Date;
          let time = "";
          let isToday = false;

          try {
            if (Array.isArray(slot)) {
              dateObj = new Date(
                slot[0],
                slot[1] - 1,
                slot[2],
                slot[3] || 0,
                slot[4] || 0
              );
            } else if (
              typeof slot === "string" &&
              slot.includes(":") &&
              !slot.includes("T")
            ) {
              const [h, m] = slot.split(":");
              dateObj = new Date();
              dateObj.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            } else {
              dateObj = new Date(slot);
            }

            if (isNaN(dateObj.getTime())) throw new Error("Invalid");

            time = format(dateObj, "HH:mm");
            isToday =
              format(dateObj, "yyyy-MM-dd") ===
              format(new Date(), "yyyy-MM-dd");
          } catch {
            return null;
          }

          return (
            <button
              type="button"
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectSlot) onSelectSlot(slot, effectiveLocationId);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#0f0f0f] text-xs font-mono font-bold text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              {isToday ? t("today") : t("tomorrow")} {time}
            </button>
          );
        })}
      </div>
    </div>
  );
};