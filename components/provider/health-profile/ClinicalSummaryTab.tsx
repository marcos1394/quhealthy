"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Weight,
  AlertCircle,
  AlertTriangle,
  Pill,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

import {
  PatientHealthProfile,
} from "@/types/healthProfile";
import { MedicalHistoryResponse } from "@/types/medicalHistory";

interface ClinicalSummaryTabProps {
  healthProfile: PatientHealthProfile | null;
  history: MedicalHistoryResponse | null;
}

const getVitalSignIcon = (type: string) => {
  switch (type) {
    case "HEART_RATE":
      return <Heart className="w-4 h-4 text-rose-500" strokeWidth={2} />;
    case "BLOOD_PRESSURE":
      return <Activity className="w-4 h-4 text-sky-500" strokeWidth={2} />;
    case "BODY_TEMPERATURE":
      return <Thermometer className="w-4 h-4 text-orange-500" strokeWidth={2} />;
    case "BLOOD_OXYGEN":
      return <Droplet className="w-4 h-4 text-cyan-500" strokeWidth={2} />;
    case "WEIGHT":
      return <Weight className="w-4 h-4 text-emerald-500" strokeWidth={2} />;
    default:
      return <Activity className="w-4 h-4 text-emerald-500" strokeWidth={2} />;
  }
};

export const ClinicalSummaryTab: React.FC<ClinicalSummaryTabProps> = ({
  healthProfile,
  history,
}) => {
  const t = useTranslations("DashboardPatientDetail.Summary");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const getVitalSignLabel = (type: string) => {
    switch (type) {
      case "HEART_RATE":
        return t("vital_heart_rate");
      case "BLOOD_PRESSURE":
        return t("vital_blood_pressure");
      case "BODY_TEMPERATURE":
        return t("vital_body_temperature");
      case "BLOOD_OXYGEN":
        return t("vital_blood_oxygen");
      case "WEIGHT":
        return t("vital_weight");
      case "HEIGHT":
        return t("vital_height");
      case "BMI":
        return t("vital_bmi");
      case "RESPIRATORY_RATE":
        return t("vital_respiratory_rate");
      case "GLUCOSE":
        return t("vital_glucose");
      default:
        return type;
    }
  };

  const latestAppointment = history?.timeline?.[0];
  const vitalSigns = healthProfile?.latestVitalSigns || [];
  const activeProblems =
    healthProfile?.activeProblems?.filter((p) => p.status === "ACTIVO") || [];
  const allergies =
    healthProfile?.allergies?.filter((a) => a.status === "ACTIVA") || [];
  const medications = healthProfile?.medications || [];

  return (
    <div className="flex flex-col gap-6 bg-transparent min-h-full p-6 md:p-8 font-sans transition-colors select-none">
      {/* ── SECCIÓN DE SIGNOS VITALES ─────────────────────────────────── */}
      {vitalSigns.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Activity className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("vitals_title")}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {vitalSigns.map((vs) => (
              <div
                key={vs.id}
                className="flex flex-col items-start p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  {getVitalSignIcon(vs.type)}
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                    {getVitalSignLabel(vs.type)}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
                    {vs.value}
                    {vs.secondaryValue ? `/${vs.secondaryValue}` : ""}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-gray-400">
                    {vs.unit}
                  </span>
                </div>

                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 pt-1">
                  {t("measured_time", {
                    time: formatDistanceToNow(new Date(vs.measuredAt), {
                      locale: dateLocale,
                    }),
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISPOSICIÓN DE DOS COLUMNAS ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1 */}
        <div className="flex flex-col gap-6">
          {/* Problemas Activos */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                  <AlertCircle className="w-4 h-4" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("active_problems_title")}
                </h4>
              </div>

              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                {activeProblems.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {activeProblems.length > 0 ? (
                activeProblems.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs space-y-1"
                  >
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                      {p.diagnosis}
                    </span>
                    {p.startDate && (
                      <span className="text-[11px] font-medium text-gray-400">
                        {t("from_date", {
                          date: format(new Date(p.startDate), "MMM yyyy", {
                            locale: dateLocale,
                          }),
                        })}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs font-medium text-gray-400 py-6 text-center bg-gray-50/40 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                  {t("no_active_problems")}
                </div>
              )}
            </div>
          </div>

          {/* Última Intervención */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                <FileText className="w-4 h-4" strokeWidth={2} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("latest_intervention_title")}
              </h4>
            </div>

            <div>
              {latestAppointment ? (
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {latestAppointment.serviceName}
                    </h5>
                  </div>

                  <p className="text-[11px] font-mono font-semibold text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-800">
                    {format(new Date(latestAppointment.date), "dd MMM yyyy", {
                      locale: dateLocale,
                    })}
                  </p>

                  {latestAppointment.publicNotes ? (
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "{latestAppointment.publicNotes}"
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic">
                      {t("no_notes")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs font-medium text-gray-400 py-6 text-center bg-gray-50/40 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                  {t("no_interventions")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="flex flex-col gap-6">
          {/* Alergias */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
                  <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("allergies_title")}
                </h4>
              </div>

              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                {allergies.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {allergies.length > 0 ? (
                allergies.map((a) => (
                  <span
                    key={a.id}
                    className="text-xs font-bold border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xs"
                  >
                    <span>{a.substance}</span>
                    <span className="opacity-80 text-[10px] bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full">
                      {a.severity}
                    </span>
                  </span>
                ))
              ) : (
                <div className="text-xs font-medium text-gray-400 py-6 text-center bg-gray-50/40 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed w-full">
                  {t("no_allergies")}
                </div>
              )}
            </div>
          </div>

          {/* Medicación */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                  <Pill className="w-4 h-4" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("medications_title")}
                </h4>
              </div>

              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                {medications.length}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {medications.length > 0 ? (
                medications.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center text-xs font-semibold text-gray-900 dark:text-white py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                        <Pill className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <span className="font-bold">{m.name}</span>
                    </div>

                    <span className="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 px-3 py-1 rounded-full text-right max-w-[50%] truncate shadow-2xs">
                      {m.dosage}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs font-medium text-gray-400 py-6 text-center bg-gray-50/40 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                  {t("no_medications")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};