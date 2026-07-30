"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Flame,
  Activity,
  Droplet,
  Wheat,
  Sparkles,
  Utensils,
} from "lucide-react";

import { NutritionAnalysis } from "@/types/nutrition";

interface AnalysisResultProps {
  analysis: NutritionAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const t = useTranslations("Nutrition.AnalysisResult");
  const { totals, detectedFoods, recommendations, healthScore } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500";
    if (score >= 50) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  return (
    <div className="space-y-6 font-sans transition-colors select-none">
      {/* ── METRICAS Y HEALTH SCORE ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Health Score */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {t("health_score_title")}
          </h3>

          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-gray-100 dark:text-gray-800/80"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreColor(
                  healthScore
                )} transition-all duration-1000 ease-out`}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
                {healthScore}
              </span>
              <span className="text-[10px] font-bold font-mono text-gray-400">
                {t("health_score_max")}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de Macronutrientes */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 p-6 md:col-span-2 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {t("nutrition_summary")}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MacroCard
              icon={<Flame className="w-4 h-4 text-orange-500" strokeWidth={2} />}
              label={t("calories")}
              value={t("unit_kcal", { value: totals?.calories ?? 0 })}
            />
            <MacroCard
              icon={<Activity className="w-4 h-4 text-sky-500" strokeWidth={2} />}
              label={t("protein")}
              value={t("unit_g", { value: totals?.protein ?? 0 })}
            />
            <MacroCard
              icon={<Wheat className="w-4 h-4 text-amber-600" strokeWidth={2} />}
              label={t("carbs")}
              value={t("unit_g", { value: totals?.carbs ?? 0 })}
            />
            <MacroCard
              icon={<Droplet className="w-4 h-4 text-amber-400" strokeWidth={2} />}
              label={t("fats")}
              value={t("unit_g", { value: totals?.fats ?? 0 })}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t("fiber")}
              </p>
              <p className="font-mono font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                {t("unit_g", { value: totals?.fiber ?? 0 })}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t("sugars")}
              </p>
              <p className="font-mono font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                {t("unit_g", { value: totals?.sugars ?? 0 })}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t("sodium")}
              </p>
              <p className="font-mono font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                {t("unit_mg", { value: totals?.sodium ?? 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ALIMENTOS DETECTADOS ────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Utensils className="w-4 h-4" strokeWidth={2} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("detected_foods_title")}
          </h3>
        </div>

        <div className="space-y-2.5">
          {detectedFoods && detectedFoods.length > 0 ? (
            detectedFoods.map((food, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all shadow-2xs ${
                  !food.is_confident
                    ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
                    : "border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-[#050505]"
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white capitalize tracking-tight">
                    {food.name}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("estimated_portion", {
                      portion: food.estimated_portion,
                    })}
                    {food.preparation_method &&
                      ` • ${t("prep_method", {
                        method: food.preparation_method,
                      })}`}
                  </p>
                </div>

                {!food.is_confident && (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[10px] font-bold bg-amber-100/80 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/40 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("low_confidence")}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs font-medium text-gray-400 italic p-4 text-center">
              {t("no_foods_detected")}
            </p>
          )}
        </div>
      </div>

      {/* ── RECOMENDACIONES DEL NUTRICIONISTA ────────────────────────── */}
      <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300 tracking-tight">
            {t("recommendations_title")}
          </h3>
        </div>

        <ul className="space-y-2.5">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs font-medium text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">
                  •
                </span>
                <span>{rec}</span>
              </li>
            ))
          ) : (
            <li className="text-xs font-medium text-emerald-800/70 dark:text-emerald-400/70 italic">
              {t("no_recommendations")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function MacroCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50/60 dark:bg-[#050505] rounded-2xl p-3.5 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-800 shadow-2xs space-y-1">
      <div className="mb-0.5">{icon}</div>
      <p className="text-sm sm:text-base font-black font-mono text-gray-900 dark:text-white tracking-tight">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
        {label}
      </p>
    </div>
  );
}