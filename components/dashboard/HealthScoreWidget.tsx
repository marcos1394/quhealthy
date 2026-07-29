"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight } from "lucide-react";

import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { HealthScoreResponse } from "@/types/healthscore";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface HealthScoreWidgetProps {
  scoreData: HealthScoreResponse | null;
  isLoading: boolean;
  onOpenOnboarding: () => void;
}

export function HealthScoreWidget({
  scoreData,
  isLoading,
  onOpenOnboarding,
}: HealthScoreWidgetProps) {
  const t = useTranslations("PatientDashboard.Widget");

  // ── ESTADO 1: Cargando (Soft Health) ───────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative h-full min-h-[320px] w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-2xs font-sans">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 shadow-2xs">
            <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  // ── ESTADO 2: Sin datos (CTA Diagnóstico) ────────────────────────────────
  if (!scoreData) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenOnboarding}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenOnboarding();
          }
        }}
        className="group relative h-full min-h-[320px] w-full rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-8 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-500/30 overflow-hidden font-sans select-none shadow-2xs"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-2xs transition-transform duration-200 group-hover:scale-105 my-2">
          <Sparkles className="w-7 h-7" strokeWidth={2} />
        </div>

        <div className="space-y-1.5 my-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("cta_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto leading-relaxed">
            {t("cta_desc")}
          </p>
        </div>

        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/30 w-full flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors">
            <span>{t("cta_button")}</span>
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    );
  }

  // ── ESTADO 3: Con Datos ─────────────────────────────────────────────────
  return (
    <HealthScoreCard
      score={scoreData.quscore}
      title="QuHealthScore™"
      subtitle={t("level", { band: scoreData.band })}
    />
  );
}