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
  Sparkles,
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
  const radius = 62;
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
    <div className="group relative w-full h-full min-h-[340px] bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-[#0a0a0a] rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 p-6 sm:p-8 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 overflow-hidden font-sans select-none shadow-xs">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 w-40 h-40 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cabecera Técnica */}
      <div className="flex justify-between w-full items-center mb-4 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 shadow-2xs">
          <StatusIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{getDynamicStatus()}</span>
        </span>

        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/90 dark:bg-[#141414]/90 border border-gray-200/80 dark:border-gray-800 text-gray-500 shadow-2xs">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </div>
      </div>

      {/* Gráfico Anillo de Progreso */}
      <div className="relative flex items-center justify-center w-40 h-40 my-2">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-100/90 dark:text-gray-800/90"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0px 0px 8px rgba(16,185,129,0.45))",
            }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center justify-center bg-white/95 dark:bg-[#0f0f0f]/95 rounded-full w-28 h-28 border border-emerald-100 dark:border-emerald-900/40 shadow-md">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-4xl font-black font-mono text-gray-900 dark:text-white tracking-tight leading-none"
          >
            {safeScore}
          </motion.span>
          <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
            QuScore™
          </span>
        </div>
      </div>

      {/* Título y Subtítulo */}
      <div className="space-y-1 my-2 relative z-10">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
          {displayTitle}
        </h3>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[220px] mx-auto leading-relaxed">
          {displaySubtitle}
        </p>
      </div>

      {/* Footer KPI Dinámico */}
      <div className="pt-4 border-t border-emerald-100/80 dark:border-gray-800/80 w-full flex items-center justify-center relative z-10">
        {percentile && percentile > 0 ? (
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("percentile", { percentile })}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
            <span>{t("accumulating")}</span>
          </div>
        )}
      </div>
    </div>
  );
};