"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { NutritionProfileRequest } from "@/types/nutrition";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  initialData?: Partial<NutritionProfileRequest>;
  onSubmit: (data: NutritionProfileRequest) => void;
  isLoading: boolean;
}

export default function NutritionOnboarding({
  initialData,
  onSubmit,
  isLoading,
}: Props) {
  const t = useTranslations("Nutrition.Onboarding");

  const [formData, setFormData] = useState<NutritionProfileRequest>({
    primaryGoal: "MAINTAIN_WEIGHT",
    weightKg: initialData?.weightKg || 70,
    heightCm: initialData?.heightCm || 170,
    age: initialData?.age || 30,
    gender: initialData?.gender || "MALE",
    activityLevel: initialData?.activityLevel || "MODERATE",
  });

  const handleChange = (
    field: keyof NutritionProfileRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 p-6 md:p-8 max-w-2xl mx-auto font-sans transition-colors select-none">
      {/* ── HEADER DE BIENVENIDA ────────────────────────────────────── */}
      <div className="text-center mb-8 space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 shadow-2xs">
          <Sparkles className="w-6 h-6" strokeWidth={2} />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t("title")}
        </h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* ── FORMULARIO DE PERFIL NUTRICIONAL ───────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Objetivo */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_goal")}
          </label>
          <select
            value={formData.primaryGoal}
            onChange={(e) => handleChange("primaryGoal", e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none shadow-2xs cursor-pointer"
          >
            <option value="LOSE_WEIGHT" className="bg-white dark:bg-[#0a0a0a]">
              {t("goal_lose")}
            </option>
            <option
              value="MAINTAIN_WEIGHT"
              className="bg-white dark:bg-[#0a0a0a]"
            >
              {t("goal_maintain")}
            </option>
            <option value="GAIN_MUSCLE" className="bg-white dark:bg-[#0a0a0a]">
              {t("goal_gain")}
            </option>
          </select>
        </div>

        {/* Peso & Altura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_weight")}
            </label>
            <input
              type="number"
              value={formData.weightKg}
              onChange={(e) =>
                handleChange("weightKg", parseFloat(e.target.value) || 0)
              }
              className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_height")}
            </label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) =>
                handleChange("heightCm", parseFloat(e.target.value) || 0)
              }
              className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Edad & Sexo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_age")}
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                handleChange("age", parseInt(e.target.value) || 0)
              }
              className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_gender")}
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none shadow-2xs cursor-pointer"
            >
              <option value="MALE" className="bg-white dark:bg-[#0a0a0a]">
                {t("gender_male")}
              </option>
              <option value="FEMALE" className="bg-white dark:bg-[#0a0a0a]">
                {t("gender_female")}
              </option>
            </select>
          </div>
        </div>

        {/* Nivel de Actividad */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_activity")}
          </label>
          <select
            value={formData.activityLevel}
            onChange={(e) => handleChange("activityLevel", e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none shadow-2xs cursor-pointer"
          >
            <option value="SEDENTARY" className="bg-white dark:bg-[#0a0a0a]">
              {t("act_sedentary")}
            </option>
            <option value="LIGHT" className="bg-white dark:bg-[#0a0a0a]">
              {t("act_light")}
            </option>
            <option value="MODERATE" className="bg-white dark:bg-[#0a0a0a]">
              {t("act_moderate")}
            </option>
            <option value="ACTIVE" className="bg-white dark:bg-[#0a0a0a]">
              {t("act_active")}
            </option>
            <option value="VERY_ACTIVE" className="bg-white dark:bg-[#0a0a0a]">
              {t("act_very_active")}
            </option>
          </select>
        </div>

        {/* Botón de Envío */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-11 mt-6 transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("btn_loading")}</span>
            </>
          ) : (
            <span>{t("btn_submit")}</span>
          )}
        </Button>
      </form>
    </div>
  );
}