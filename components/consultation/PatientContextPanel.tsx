"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { User, AlertTriangle, ShieldAlert, Activity } from "lucide-react";

import { PatientClinicalProfile } from "@/types/ehr";

interface PatientContextPanelProps {
  patientProfile: PatientClinicalProfile | null;
  isOfflinePatient: boolean;
  displayFullName: string;
}

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({
  patientProfile,
  isOfflinePatient,
  displayFullName,
}) => {
  const t = useTranslations("EHR");
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  return (
    <aside className="w-full lg:w-1/4 lg:min-w-[280px] lg:max-w-[340px] bg-white dark:bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-0 font-sans transition-colors">
      {/* ── HEADER DEL PERFIL ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <User className="w-4 h-4" strokeWidth={2} />
        </div>
        <h2 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
          {t("patient_profile")}
        </h2>
      </div>

      {/* ── FICHA RÁPIDA DE IDENTIFICACIÓN ────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xl font-bold font-mono">
              {displayInitial}
            </span>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate leading-snug">
              {displayFullName}
            </h3>

            {!isOfflinePatient && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {patientProfile?.gender && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 shadow-2xs">
                    {patientProfile.gender}
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 shadow-2xs">
                  {patientProfile?.bloodType || t("blood_type_nd")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notificación de Paciente No Registrado */}
        {isOfflinePatient && (
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-[11px] font-bold shadow-2xs">
            <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{t("not_registered_app")}</span>
          </div>
        )}
      </div>

      {/* ── SECCIONES CLÍNICAS (SI ES PACIENTE REGISTRADO) ─────────────── */}
      {!isOfflinePatient && (
        <div className="space-y-6">
          {/* 📊 QuScore */}
          <div className="p-5 rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <Activity className="w-4 h-4" strokeWidth={2} />
              <span>{t("qu_score")}</span>
            </div>

            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
              {patientProfile?.quScore || "--"}
            </div>

            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                {patientProfile?.quScoreBand || t("uncalculated")}
              </span>
            </div>
          </div>

          {/* ⚠️ Alergias y Condiciones */}
          <div className="space-y-5 pt-2">
            {/* Alergias */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2} />
                <span>{t("allergies")}</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {patientProfile?.allergies?.length ? (
                  patientProfile.allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center px-2.5 py-1 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-[11px] font-bold shadow-2xs"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-gray-400 italic">
                    {t("no_data")}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            {/* Condiciones Crónicas */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("conditions")}</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {patientProfile?.chronicConditions?.length ? (
                  patientProfile.chronicConditions.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-bold shadow-2xs"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-gray-400 italic">
                    {t("no_data")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};