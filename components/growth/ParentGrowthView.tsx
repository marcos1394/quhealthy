"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

import { GrowthMeasurementResponse } from "@/types/growth";
import { cn } from "@/lib/utils";

interface ParentGrowthViewProps {
  latestMeasurement: GrowthMeasurementResponse | null;
}

export default function ParentGrowthView({
  latestMeasurement,
}: ParentGrowthViewProps) {
  const t = useTranslations("Growth.ParentView");

  if (!latestMeasurement) {
    return (
      <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 text-center shadow-2xs font-sans transition-colors">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("no_measurements")}
        </p>
      </div>
    );
  }

  const { clinicalStatus, parentMessage } = latestMeasurement;

  const isNormal = clinicalStatus === "NORMAL";
  const isVigilance = clinicalStatus === "VIGILANCIA";

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs font-sans transition-colors select-none">
      {/* ── MENSAJE DE ESTADO Y BADGE ─────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-1">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs transition-colors",
            isNormal
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : isVigilance
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
          )}
        >
          {isNormal && <ShieldCheck className="w-6 h-6" strokeWidth={2} />}
          {isVigilance && <AlertTriangle className="w-6 h-6" strokeWidth={2} />}
          {!isNormal && !isVigilance && (
            <ShieldAlert className="w-6 h-6" strokeWidth={2} />
          )}
        </div>

        <div className="space-y-0.5 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {isNormal
              ? t("status_stable")
              : isVigilance
              ? t("status_vigilance")
              : t("status_alert")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {parentMessage || t("default_message")}
          </p>
        </div>
      </div>

      {/* ── LECTURAS RÁPIDAS (DATOS) ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8 shrink-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-end">
        <div className="flex flex-col space-y-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("last_measurement")}
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 dark:text-white">
            {format(new Date(latestMeasurement.measurementDate), "dd MMM yyyy", {
              locale: es,
            })}
          </span>
        </div>

        <div className="flex flex-col space-y-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("age")}
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 dark:text-white">
            {t("age_months", { months: latestMeasurement.ageInMonths })}
          </span>
        </div>

        <div className="flex flex-col space-y-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("weight")}
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 dark:text-white">
            {latestMeasurement.weightKg
              ? `${latestMeasurement.weightKg} kg`
              : "—"}
          </span>
        </div>

        <div className="flex flex-col space-y-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("height")}
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 dark:text-white">
            {latestMeasurement.heightCm
              ? `${latestMeasurement.heightCm} cm`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}