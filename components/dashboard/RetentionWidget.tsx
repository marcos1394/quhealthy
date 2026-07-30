"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Users, TrendingUp, TrendingDown, AlertCircle, RefreshCcw } from "lucide-react";
import { useRetentionData } from "@/hooks/useRetentionData";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const RetentionWidget = () => {
  const t = useTranslations("Dashboard.RetentionWidget");
  const { data, isLoading, error } = useRetentionData();

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center justify-center min-h-[160px]">
        <QhSpinner size="md" className="text-indigo-600 dark:text-indigo-400 mb-2" />
        <span className="text-xs font-semibold text-gray-400">{t("loading") || "Cargando métricas..."}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center justify-center min-h-[160px]">
        <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
        <span className="text-xs font-semibold text-gray-500">{t("error") || "No se pudieron cargar las métricas"}</span>
      </div>
    );
  }

  const isPositiveGrowth = data.retentionRateGrowth >= 0;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col font-sans transition-all duration-300">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              {t("title") || "Retención de Pacientes"}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("subtitle") || "Mes actual vs Mes anterior"}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Retention Rate */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("retention_rate") || "Tasa de Retención"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white">
              {data.retentionRate}%
            </span>
            <span
              className={`flex items-center text-xs font-bold ${
                isPositiveGrowth ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isPositiveGrowth ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(data.retentionRateGrowth)}%
            </span>
          </div>
        </div>

        {/* Metric 2: Average Visits */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("avg_visits") || "Visitas Promedio"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white">
              {data.avgVisitsPerPatient}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {t("per_patient") || "/ paciente"}
            </span>
          </div>
        </div>

        {/* Metric 3: Churn Risk */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("churn_risk") || "En Riesgo"}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{t("churn_tooltip") || "Pacientes sin citas en los últimos 60 días."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${data.churnRiskCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {data.churnRiskCount}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {t("patients") || "pacientes"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
