"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Activity,
  Apple,
  Moon,
  HeartPulse,
  TrendingUp,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { HealthScoreResponse } from "@/types/healthscore";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface HealthScore360WidgetProps {
  scoreData: HealthScoreResponse | null;
  isLoading: boolean;
  onOpenOnboarding: () => void;
}

export function HealthScore360Widget({
  scoreData,
  isLoading,
  onOpenOnboarding,
}: HealthScore360WidgetProps) {
  const t = useTranslations("PatientDashboard.Score360");
  const tScore = useTranslations("PatientDashboard.score");

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[320px] rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col items-center justify-center text-center shadow-xs font-sans">
        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400 mb-3" />
        <p className="text-xs font-semibold text-gray-400">{tScore("status_collecting")}</p>
      </div>
    );
  }

  const hasScore = scoreData && typeof scoreData.quscore === "number" && scoreData.quscore > 0;
  const score = hasScore ? scoreData.quscore : 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getBandLabel = () => {
    if (!hasScore) return "Sin calcular";
    if (score >= 80) return "Óptimo";
    if (score >= 60) return "Favorable";
    if (score >= 40) return "Moderado";
    return "Atención";
  };

  const pillars = [
    {
      key: "activity",
      label: t("pillar_activity"),
      score: hasScore ? Math.min(100, Math.round(score * 0.98)) : 0,
      icon: Activity,
      color: "#10b981",
    },
    {
      key: "nutrition",
      label: t("pillar_nutrition"),
      score: hasScore ? Math.min(100, Math.round(score * 0.92)) : 0,
      icon: Apple,
      color: "#06b6d4",
    },
    {
      key: "sleep",
      label: t("pillar_sleep"),
      score: hasScore ? Math.min(100, Math.round(score * 1.02)) : 0,
      icon: Moon,
      color: "#8b5cf6",
    },
    {
      key: "clinical",
      label: t("pillar_clinical"),
      score: hasScore ? Math.min(100, Math.round(score * 1.05)) : 0,
      icon: HeartPulse,
      color: "#f43f5e",
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-7 shadow-xs font-sans select-none space-y-5 transition-all">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t("title")}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenOnboarding}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{hasScore ? "Actualizar" : "Calcular"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── SCORE Y DESGLOSE DE PILARES ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Anillo de Score */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 text-center">
          <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
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
                cx="64"
                cy="64"
                r={radius}
                stroke="#10b981"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-gray-900 dark:text-white leading-none">
                {hasScore ? score : "—"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                {getBandLabel()}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
            QuHealthScore™
          </span>
        </div>

        {/* 4 Pilares de Salud */}
        <div className="sm:col-span-7 space-y-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Icon className="w-3.5 h-3.5" style={{ color: pillar.color }} />
                    <span>{pillar.label}</span>
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white font-extrabold">
                    {hasScore ? `${pillar.score}%` : "—"}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-[#141414] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: hasScore ? `${pillar.score}%` : "0%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: pillar.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TIP PREVENTIVO IA ────────────────────────────────────────── */}
      <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="truncate">
          <strong>{t("ai_recommendation")}:</strong>{" "}
          {hasScore
            ? "Completar tus signos vitales periódicos mantendrá tu score optimizado."
            : "Completa el cuestionario clínico inicial para desbloquear tus pilares preventivos."}
        </span>
      </div>
    </div>
  );
}
