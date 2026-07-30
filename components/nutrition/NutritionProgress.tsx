"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Flame,
  Activity,
  Wheat,
  Droplet,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { NutritionProfile, NutritionAnalysis } from "@/types/nutrition";

interface Props {
  profile: NutritionProfile;
  history: NutritionAnalysis[];
}

interface ProgressBarProps {
  label: string;
  icon: React.ReactNode;
  consumed: number;
  target: number;
  unit: string;
  colorClass: string;
}

export default function NutritionProgress({ profile, history }: Props) {
  const t = useTranslations("Nutrition.Progress");

  // Helper para manejar fechas sin timezone explícito desde el backend
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const str = String(dateStr);
    const hasTimezone = /(Z|[+-]\d{2}(:\d{2})?)$/.test(str);
    return new Date(hasTimezone ? str : `${str}Z`);
  };

  // Calcular totales del día actual
  const today = new Date().toDateString();
  const todaysHistory = history.filter(
    (item) => parseDate(item.createdAt).toDateString() === today
  );

  const consumed = todaysHistory.reduce(
    (acc, curr) => ({
      calories: acc.calories + (curr.totals.calories || 0),
      protein: acc.protein + (curr.totals.protein || 0),
      carbs: acc.carbs + (curr.totals.carbs || 0),
      fats: acc.fats + (curr.totals.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const target = {
    calories: profile.targetCalories || 2000,
    protein: profile.targetProtein || 120,
    carbs: profile.targetCarbs || 250,
    fats: profile.targetFats || 70,
  };

  const remaining = {
    calories: Math.max(0, target.calories - consumed.calories),
    protein: Math.max(0, target.protein - consumed.protein),
    carbs: Math.max(0, target.carbs - consumed.carbs),
    fats: Math.max(0, target.fats - consumed.fats),
  };

  const getPercentage = (c: number, tVal: number) =>
    Math.min(100, Math.round((c / tVal) * 100)) || 0;

  const ProgressBar = ({
    label,
    icon,
    consumed,
    target,
    unit,
    colorClass,
  }: ProgressBarProps) => {
    const pct = getPercentage(consumed, target);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-2xs">
              {icon}
            </div>
            <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 tracking-tight">
              {label}
            </span>
          </div>

          <div className="text-right flex items-baseline gap-1">
            <span className="font-mono font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {consumed.toLocaleString()}
            </span>
            <span className="font-mono text-xs font-semibold text-gray-400">
              / {target.toLocaleString()} {unit}
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden shadow-2xs p-0.5">
          <div
            className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="text-right">
          <span className="font-mono text-[10px] font-bold text-gray-400">
            {pct}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans transition-colors select-none">
      {/* ── BANNER DE RESUMEN INTELIGENTE ───────────────────────────── */}
      <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300 tracking-tight">
            {t("daily_summary_title")}
          </h3>
        </div>

        <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
          {remaining.calories > 0
            ? t("remaining_msg", {
                calories: remaining.calories.toLocaleString(),
                protein: remaining.protein,
                carbs: remaining.carbs,
                fats: remaining.fats,
              })
            : t("exceeded_msg")}
        </p>
      </div>

      {/* ── BARRAS DE PROGRESO NUTRICIONAL ───────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 shadow-2xs border border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800/80">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("today_progress_title")}
          </h3>
        </div>

        <div className="space-y-5">
          <ProgressBar
            label={t("calories")}
            icon={<Flame className="w-4 h-4 text-orange-500" strokeWidth={2} />}
            consumed={consumed.calories}
            target={target.calories}
            unit={t("unit_kcal")}
            colorClass="bg-orange-500"
          />

          <ProgressBar
            label={t("protein")}
            icon={<Activity className="w-4 h-4 text-rose-500" strokeWidth={2} />}
            consumed={consumed.protein}
            target={target.protein}
            unit={t("unit_g")}
            colorClass="bg-rose-500"
          />

          <ProgressBar
            label={t("carbs")}
            icon={<Wheat className="w-4 h-4 text-amber-500" strokeWidth={2} />}
            consumed={consumed.carbs}
            target={target.carbs}
            unit={t("unit_g")}
            colorClass="bg-amber-500"
          />

          <ProgressBar
            label={t("fats")}
            icon={<Droplet className="w-4 h-4 text-emerald-500" strokeWidth={2} />}
            consumed={consumed.fats}
            target={target.fats}
            unit={t("unit_g")}
            colorClass="bg-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}