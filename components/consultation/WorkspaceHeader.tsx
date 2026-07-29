"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Stethoscope,
  Mic,
  Save,
  CheckCircle2,
} from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";

interface WorkspaceHeaderProps {
  appointmentId: number;
  displayFullName: string;
  isOfflinePatient: boolean;
  isRecording: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  appointmentId,
  displayFullName,
  isOfflinePatient,
  isRecording,
  isSubmitting,
  onComplete,
  onBack,
}) => {
  const t = useTranslations("EHR");

  return (
    <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between shadow-xs z-10 shrink-0 gap-4 font-sans transition-colors">
      {/* ── LADO IZQUIERDO: BOTÓN REGRESAR E INFORMACIÓN DE LA CONSULTA ── */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs hidden sm:flex">
            <Stethoscope className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="space-y-0.5 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {t("title_consultation")}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {t("appointment_num", { id: appointmentId })}
              </span>
              <span>•</span>
              <span className="text-gray-900 dark:text-white truncate font-sans font-bold">
                {displayFullName}
              </span>

              {isOfflinePatient && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-[10px] font-bold">
                  {t("offline_badge")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LADO DERECHO: INDICADORES Y ACCIONES DE CABECERA ───────────── */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Indicador de Escucha de Audio en Vivo */}
        {isRecording && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse shadow-2xs">
            <Mic className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden md:inline">{t("listening_status")}</span>
          </div>
        )}

        {/* Guardar Borrador */}
        <button
          type="button"
          className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="hidden md:inline">{t("btn_save_draft")}</span>
        </button>

        {/* Finalizar y Cobrar */}
        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
        >
          {isSubmitting ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("btn_processing")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_finish_and_charge")}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};