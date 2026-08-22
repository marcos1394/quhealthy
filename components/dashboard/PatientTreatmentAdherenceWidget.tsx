"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Pill,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TreatmentDto } from "@/services/treatment.service";

interface PatientTreatmentAdherenceWidgetProps {
  treatments?: TreatmentDto[];
  isLoading?: boolean;
}

export function PatientTreatmentAdherenceWidget({
  treatments = [],
  isLoading = false,
}: PatientTreatmentAdherenceWidgetProps) {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.Adherence");

  const activeTreatments = treatments.filter(
    (tr) => tr.status === "ACTIVE" || !tr.status
  );

  // Calcular adherencia real si existen tomas registradas
  let totalDosesCount = 0;
  let takenDosesCount = 0;
  treatments.forEach((tr) => {
    if (tr.totalDoses && tr.totalDoses > 0) {
      totalDosesCount += tr.totalDoses;
      takenDosesCount += tr.dosesTaken || 0;
    }
  });

  const adherenceRate =
    totalDosesCount > 0
      ? Math.round((takenDosesCount / totalDosesCount) * 100)
      : activeTreatments.length > 0
      ? 100
      : null;

  const nextTreatment = activeTreatments[0] || null;

  // Días de la semana
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
  const dayNames = ["L", "M", "M", "J", "V", "S", "D"];
  const now = new Date();

  const daysOfWeek = dayNames.map((name, index) => {
    const dayDiff = index - todayIndex;
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + dayDiff);

    return {
      day: name,
      date: targetDate.getDate().toString(),
      isToday: index === todayIndex,
      isPast: index < todayIndex,
    };
  });

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-7 shadow-xs font-sans select-none space-y-6 transition-all">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>{t("title")}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/treatments")}
          className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{t("view_all_treatments")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── METRICAS Y PROGRESO SEMANAL ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* KPI Score de Adherencia */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-mono font-black text-base shadow-md shadow-cyan-500/20">
            {adherenceRate !== null ? `${adherenceRate}%` : "—"}
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">
              {t("weekly_rate")}
            </span>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
              {adherenceRate !== null && adherenceRate >= 90
                ? "Cumplimiento al día"
                : activeTreatments.length > 0
                ? "Tratamientos en curso"
                : "Sin prescripciones"}
            </p>
          </div>
        </div>

        {/* Tracker de 7 Días */}
        <div className="md:col-span-8 flex items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50/80 dark:bg-[#121212] border border-gray-100 dark:border-gray-800">
          {daysOfWeek.map((d, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all text-center",
                d.isToday
                  ? "bg-white dark:bg-[#1e1e1e] shadow-2xs ring-1 ring-cyan-500/30 font-bold"
                  : ""
              )}
            >
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">
                {d.day}
              </span>
              <span className="text-xs font-mono font-extrabold text-gray-900 dark:text-white my-1">
                {d.date}
              </span>
              {d.isPast ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : d.isToday ? (
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-cyan-500 animate-pulse" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRÓXIMA DOSIS REAL ───────────────────────────────────────── */}
      {nextTreatment ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50/50 via-teal-50/30 to-transparent dark:from-cyan-950/20 dark:via-teal-950/10 dark:to-transparent border border-cyan-200/60 dark:border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                  {t("next_dose")}
                </span>
                {nextTreatment.nextDoseTime && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                    {nextTreatment.nextDoseTime}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {nextTreatment.name} • {nextTreatment.dosage}
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                {nextTreatment.frequency || nextTreatment.route || "Seguir indicación médica"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/patient/dashboard/treatments")}
            className="h-9 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer border-0"
          >
            {t("taken")}
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 text-center space-y-2">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t("no_active_treatments")}
          </p>
          <p className="text-[11px] text-gray-400">
            {t("no_active_treatments_desc")}
          </p>
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard/treatments")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-600" />
            <span>Registrar Medicamento</span>
          </button>
        </div>
      )}
    </div>
  );
}
