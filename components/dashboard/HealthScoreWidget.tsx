"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { Sparkles, ArrowRight } from "lucide-react";
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

  // 🔄 ESTADO 1: Cargando (Soft Health)
  if (isLoading) {
    return (
      <div className="relative h-full min-h-[320px] w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 mb-6">
            <QhSpinner size="sm" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            {t("loading", { defaultValue: "Sincronizando Telemetría..." })}
          </p>
        </div>
      </div>
    );
  }

  // ✨ ESTADO 2: Sin datos (Soft Health CTA)
  if (!scoreData) {
    return (
      <div
        onClick={onOpenOnboarding}
        className="group relative h-full min-h-[320px] w-full rounded-3xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 p-8 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden"
      >
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110 relative z-10 shrink-0">
            <Sparkles className="w-8 h-8" strokeWidth={2} />
          </div>
        </div>

        <div className="relative z-10 space-y-3 mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("cta_title", { defaultValue: "Algoritmo en Pausa" })}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">
            {t("cta_desc", {
              defaultValue:
                "Calibra tu expediente base para encender el motor de predicción y revelar tu QuScore.",
            })}
          </p>
        </div>

        <div className="mt-auto relative z-10">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
            {t("cta_button", { defaultValue: "Iniciar Diagnóstico" })}
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    );
  }

  // 📊 ESTADO 3: Con Datos (Mandamos la info real, y el nombre de marca fijo)
  // NOTA: Asumo que en el futuro agregarás un prop como `percentile={scoreData.percentile}`
  return (
    <HealthScoreCard
      score={scoreData.quscore}
      title="QuHealthScore™"
      subtitle={t("level", { band: scoreData.band })}
      // percentile={scoreData.percentile} <-- Aquí mandaríamos el dato real
    />
  );
}
