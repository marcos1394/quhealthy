"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppointmentTimeCard({
  dateFormatted,
  timeFormatted,
  durationMinutes,
}: {
  dateFormatted: string;
  timeFormatted: string;
  durationMinutes: number;
}) {
  const t = useTranslations("AppointmentDetails.time");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <Calendar className="w-5 h-5" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
        {/* Fecha */}
        <div className="p-6 sm:p-8 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
            <Calendar className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t("date_label")}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {dateFormatted}
            </p>
          </div>
        </div>

        {/* Horario y Duración */}
        <div className="p-6 sm:p-8 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
            <Clock className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t("time_label")}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{timeFormatted} {t("hrs")}</span>
              <span className="text-xs font-semibold text-gray-400">
                ({durationMinutes} {t("min")})
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}