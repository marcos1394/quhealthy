"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format, addDays } from "date-fns";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { scheduleService } from "@/services/schedule.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface QuickAvailabilityProps {
  providerId: number;
}

export const QuickAvailability: React.FC<QuickAvailabilityProps> = ({
  providerId,
}) => {
  const t = useTranslations("QuickAvailability");
  const [nextSlots, setNextSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const tomorrow = addDays(today, 1);

        const slotsToday = await scheduleService.getAvailableSlots(
          providerId,
          undefined,
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
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 mt-6 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shadow-2xs font-sans">
        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("next_slots_title")}...
        </span>
      </div>
    );
  }

  if (nextSlots.length === 0) {
    return (
      <div className="flex items-center gap-3 mt-6 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-500 dark:text-gray-400 shadow-2xs font-sans select-none">
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
        <span>{t("subject_to_confirmation")}</span>
      </div>
    );
  }

  return (
    <div className="mt-6 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs hover:border-emerald-500/30 transition-all cursor-pointer group font-sans select-none space-y-3">
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
            <div
              key={i}
              className="px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] text-xs font-mono font-bold text-gray-700 dark:text-gray-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-50/20 dark:group-hover:bg-emerald-950/20 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors shadow-2xs"
            >
              {isToday ? t("today") : t("tomorrow")} {time}
            </div>
          );
        })}
      </div>
    </div>
  );
};