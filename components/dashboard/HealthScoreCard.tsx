"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

interface HealthScoreCardProps {
  score?: number;
  title?: string;
  subtitle?: string;
  percentile?: number | null;
  statusLabel?: string;
}

export const HealthScoreCard = ({
  score = 0,
  title,
  subtitle,
  percentile = null,
  statusLabel,
}: HealthScoreCardProps) => {
  const t = useTranslations("PatientDashboard.score");

  const displayTitle = title || t("default_title");
  const displaySubtitle = subtitle || t("default_subtitle");

  // Cálculos para el anillo de progreso circular
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getDynamicStatus = () => {
    if (statusLabel) return statusLabel;
    if (safeScore === 0) return t("status_collecting");
    if (safeScore >= 80) return t("status_optimal");
    if (safeScore >= 50) return t("status_stable");
    return t("status_attention");
  };

  const StatusIcon =
    safeScore === 0
      ? Fingerprint
      : safeScore >= 50
        ? ShieldCheck
        : AlertTriangle;

  return (
    <div className="group relative w-full h-full min-h-[320px] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex flex-col items-center justify-between text-center transition-all duration-200 hover:shadow-md hover:border-emerald-500/30 overflow-hidden font-sans select-none shadow-2xs">
      {/* Cabecera Técnica */}
      <div className="flex justify-between w-full items-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
          <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{getDynamicStatus()}</span>
        </span>

        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-500 shadow-2xs">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </div>
      </div>

      {/* Gráfico Anillo de Progreso */}
      <div className="relative flex items-center justify-center w-36 h-36 my-2">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-gray-800"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="text-emerald-600 dark:text-emerald-400"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-full w-24 h-24 border border-gray-100 dark:border-gray-800 shadow-2xs">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight leading-none"
          >
            {safeScore}
          </motion.span>
          <span className="text-[10px] font-bold font-mono text-gray-400 mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Título y Subtítulo */}
      <div className="space-y-1 my-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          {displayTitle}
        </h3>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto leading-relaxed">
          {displaySubtitle}
        </p>
      </div>

      {/* Footer KPI Dinámico */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 w-full flex items-center justify-center">
        {percentile && percentile > 0 ? (
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("percentile", { percentile })}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <Activity className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("accumulating")}</span>
          </div>
        )}
      </div>
    </div>
  );
};