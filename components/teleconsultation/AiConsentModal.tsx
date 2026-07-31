"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, BrainCircuit, ShieldAlert, ArrowRight } from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface AiConsentModalProps {
  onSubmit: (preferences: {
    audioProcessingAccepted: boolean;
    clinicalNoteAccepted: boolean;
    dataStorageAccepted: boolean;
    consentVersion: string;
  }) => void;
  isSubmitting?: boolean;
}

export const AiConsentModal: React.FC<AiConsentModalProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const t = useTranslations("AiConsentModal");

  const [audioAccepted, setAudioAccepted] = useState(false);
  const [clinicalNoteAccepted, setClinicalNoteAccepted] = useState(false);
  const [storageAccepted, setStorageAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      audioProcessingAccepted: audioAccepted,
      clinicalNoteAccepted: clinicalNoteAccepted,
      dataStorageAccepted: storageAccepted,
      consentVersion: t("consent_version"),
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start sm:justify-center bg-gray-50/60 dark:bg-[#050505] font-sans select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group shrink-0 sm:my-auto shadow-2xl transition-colors">
        
        {/* Elementos Decorativos de Fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-950/20 rounded-bl-full pointer-events-none -z-10 transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-6 right-6 w-12 h-12 bg-emerald-600 dark:bg-emerald-400 text-white dark:text-gray-900 rounded-2xl flex items-center justify-center pointer-events-none shadow-2xs">
          <BrainCircuit className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Opción 1: Audio */}
          <label
            onClick={() => setAudioAccepted(!audioAccepted)}
            className={cn(
              "flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-2xs select-none",
              audioAccepted
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center transition-colors shadow-2xs",
                audioAccepted
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              )}
            >
              {audioAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={audioAccepted}
              onChange={() => {}}
            />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("audio_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("audio_desc")}
              </p>
            </div>
          </label>

          {/* Opción 2: Nota Clínica */}
          <label
            onClick={() => setClinicalNoteAccepted(!clinicalNoteAccepted)}
            className={cn(
              "flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-2xs select-none",
              clinicalNoteAccepted
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center transition-colors shadow-2xs",
                clinicalNoteAccepted
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              )}
            >
              {clinicalNoteAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={clinicalNoteAccepted}
              onChange={() => {}}
            />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("clinical_note_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("clinical_note_desc")}
              </p>
            </div>
          </label>

          {/* Opción 3: Almacenamiento */}
          <label
            onClick={() => setStorageAccepted(!storageAccepted)}
            className={cn(
              "flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-2xs select-none",
              storageAccepted
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center transition-colors shadow-2xs",
                storageAccepted
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              )}
            >
              {storageAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={storageAccepted}
              onChange={() => {}}
            />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("storage_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("storage_desc")}
              </p>
            </div>
          </label>

          {/* Aviso de Transparencia */}
          <div className="flex items-start gap-3 p-4 mt-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-2xs">
            <ShieldAlert
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-[11px] font-medium text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              {t("notice")}
            </p>
          </div>

          {/* Botón de Envío */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>{t("btn_continue")}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};