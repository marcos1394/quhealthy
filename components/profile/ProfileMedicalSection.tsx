"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React from "react";
import { useTranslations } from "next-intl";
import { HeartPulse, AlertCircle, Pill, Activity } from "lucide-react";

import { Label } from "@/components/ui/label";
import { ConsumerProfile } from "@/types/consumerProfile";
import { TagInput } from "@/components/profile/TagInput";

interface Props {
  form: ConsumerProfile;
  handleTagChange: (field: keyof ConsumerProfile, value: string) => void;
}

export function ProfileMedicalSection({ form, handleTagChange }: Props) {
  const t = useTranslations("PatientProfile");

  const arrayToString = (arr: string[] | undefined): string => {
    return Array.isArray(arr)
      ? arr.join(", ")
      : typeof arr === "string"
      ? arr
      : "";
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── CABECERA DE SECCIÓN ────────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
          <HeartPulse className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("section_medical")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("section_medical_desc")}
          </p>
        </div>
      </div>

      {/* ── CAMPOS DE ETIQUETAS MÉDICAS ───────────────────────────────── */}
      <div className="space-y-6">
        {/* Padecimientos / Diagnósticos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_medical_history")}
            </Label>
          </div>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
            {t("help_medical_history")}
          </p>
          <div className="pt-1">
            <TagInput
              value={arrayToString(form.medicalConditions)}
              onChange={(val) => handleTagChange("medicalConditions", val)}
              placeholder={t("placeholder_medical")}
              icon={<Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />}
            />
          </div>
        </div>

        {/* Alergias */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_allergies")}
            </Label>
          </div>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
            {t("help_allergies")}
          </p>
          <div className="pt-1">
            <TagInput
              value={arrayToString(form.allergies)}
              onChange={(val) => handleTagChange("allergies", val)}
              placeholder={t("placeholder_allergies")}
              icon={<AlertCircle className="w-4 h-4 text-amber-500" strokeWidth={2} />}
            />
          </div>
        </div>

        {/* Medicamentos Actuales */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-sky-500 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_medications")}
            </Label>
          </div>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
            {t("help_medications")}
          </p>
          <div className="pt-1">
            <TagInput
              value={arrayToString(form.currentMedications)}
              onChange={(val) => handleTagChange("currentMedications", val)}
              placeholder={t("placeholder_medications")}
              icon={<Pill className="w-4 h-4 text-sky-500" strokeWidth={2} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}