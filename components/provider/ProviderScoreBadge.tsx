"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";

import { ProviderScoreResponse, ProviderScoreBand } from "@/types/providerScore";
import { cn } from "@/lib/utils";

interface ProviderScoreBadgeProps {
  scoreData?: ProviderScoreResponse;
  className?: string;
}

export function ProviderScoreBadge({
  scoreData,
  className,
}: ProviderScoreBadgeProps) {
  const t = useTranslations("ProviderScore");

  // Estilo base Soft Health Tech: Píldora redondeada, tipografía clara, bordes suaves y sombra leve
  const baseClasses =
    "inline-flex items-center justify-center border px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-all gap-1.5 shadow-2xs font-sans select-none";

  // Estado de Carga
  if (!scoreData) {
    return (
      <span
        className={cn(
          baseClasses,
          "border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-gray-800/50 animate-pulse w-28 h-7",
          className
        )}
      />
    );
  }

  // Proveedor Nuevo
  if (scoreData.isNewProvider || scoreData.band === "NUEVO") {
    return (
      <span
        className={cn(
          baseClasses,
          "bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/40",
          className
        )}
      >
        <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" strokeWidth={2} />
        <span>{t("band_nuevo")}</span>
      </span>
    );
  }

  // Configuración visual por banda de puntuación
  const getBandConfig = (band: ProviderScoreBand) => {
    switch (band) {
      case "ELITE":
        return {
          color:
            "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
          icon: (
            <ShieldCheck
              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
              strokeWidth={2}
            />
          ),
          label: t("band_elite"),
        };
      case "PREMIUM":
        return {
          color:
            "bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
          icon: (
            <Sparkles
              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
              strokeWidth={2}
            />
          ),
          label: t("band_premium"),
        };
      case "ADVANCED":
        return {
          color:
            "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/40",
          icon: (
            <Award
              className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0"
              strokeWidth={2}
            />
          ),
          label: t("band_advanced"),
        };
      case "IN_PROGRESS":
        return {
          color:
            "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
          icon: (
            <TrendingUp
              className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
              strokeWidth={2}
            />
          ),
          label: t("band_in_progress"),
        };
      case "LOW_QUALITY":
      default:
        return {
          color:
            "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
          icon: (
            <AlertCircle
              className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"
              strokeWidth={2}
            />
          ),
          label: t("band_low"),
        };
    }
  };

  const config = getBandConfig(scoreData.band);

  return (
    <span className={cn(baseClasses, config.color, className)}>
      {config.icon}
      <span className="flex items-center gap-1.5">
        <span className="font-mono font-bold tracking-tight">
          {scoreData.score}
        </span>
        <span className="w-px h-3 bg-current opacity-30" />
        <span className="font-semibold">{config.label}</span>
      </span>
    </span>
  );
}