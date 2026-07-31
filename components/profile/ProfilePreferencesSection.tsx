"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Target, Video, Building2, Home } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ConsumerProfile } from "@/types/consumerProfile";
import { cn } from "@/lib/utils";

const GOALS_OPTIONS_KEYS = [
  "goal_weight_loss",
  "goal_skin",
  "goal_stress",
  "goal_energy",
  "goal_rehab",
] as const;

const MODALITY_OPTIONS = [
  { value: "in_person", icon: Building2 },
  { value: "video_call", icon: Video },
  { value: "home_visit", icon: Home },
] as const;

interface Props {
  form: ConsumerProfile;
  toggleArrayItem: (field: "healthGoals", value: string) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleInterestChange: (activity: string, value: number[]) => void;
}

export function ProfilePreferencesSection({
  form,
  toggleArrayItem,
  handleSelectChange,
}: Props) {
  const t = useTranslations("PatientProfile");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── CABECERA DE SECCIÓN ────────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
          <Sparkles className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("section_preferences")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("section_preferences_desc")}
          </p>
        </div>
      </div>

      {/* ── CAMPOS DE PREFERENCIAS ────────────────────────────────────── */}
      <div className="space-y-8">
        {/* Objetivos de Salud */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("label_health_goals")}
              </Label>
            </div>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
              {t("help_health_goals")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {GOALS_OPTIONS_KEYS.map((goalKey) => {
              const goalValue = t(goalKey);
              const isSelected = form.healthGoals.includes(goalValue);

              return (
                <Badge
                  key={goalKey}
                  variant="outline"
                  onClick={() => toggleArrayItem("healthGoals", goalValue)}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-xs font-bold transition-all rounded-xl border select-none shadow-2xs",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 shadow-xs"
                      : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                  )}
                >
                  {goalValue}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Modalidad de Consulta */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-sky-500 shrink-0" strokeWidth={2} />
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("label_modality")}
              </Label>
            </div>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
              {t("help_modality")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {MODALITY_OPTIONS.map((modality) => {
              const isSelected =
                form.preferredModality === modality.value.toUpperCase();
              const Icon = modality.icon;

              return (
                <button
                  key={modality.value}
                  type="button"
                  onClick={() =>
                    handleSelectChange(
                      "preferredModality",
                      modality.value.toUpperCase()
                    )
                  }
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all cursor-pointer text-center shadow-2xs",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 shrink-0 transition-colors",
                      isSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                    )}
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold">
                    {t(`modality_${modality.value}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}