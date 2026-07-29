"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Shield,
  Star,
  CalendarX,
  Activity,
  UserCheck,
  Info,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Heart,
  Globe,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProviderScore } from "@/hooks/useProviderScore";

import { ProviderScoreBadge } from "@/components/provider/ProviderScoreBadge";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function ProviderReputationCard() {
  const t = useTranslations("ProviderReputation");
  const { myActionableScore, isLoading, fetchMyActionableScore } =
    useProviderScore();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  useEffect(() => {
    fetchMyActionableScore();
  }, [fetchMyActionableScore]);

  const pillarIcons: Record<string, React.ReactNode> = {
    P1: <Shield className="w-4 h-4" strokeWidth={2} />,
    P2: <Star className="w-4 h-4" strokeWidth={2} />,
    P3: <CalendarX className="w-4 h-4" strokeWidth={2} />,
    P4: <Activity className="w-4 h-4" strokeWidth={2} />,
    P5: <UserCheck className="w-4 h-4" strokeWidth={2} />,
    P6: <Heart className="w-4 h-4" strokeWidth={2} />,
    P7: <Globe className="w-4 h-4" strokeWidth={2} />,
  };

  const getProgressColorClass = (status: string) => {
    if (status === "OPTIMAL") return "bg-emerald-600 dark:bg-emerald-400";
    if (status === "IMPROVABLE") return "bg-amber-500 dark:bg-amber-400";
    return "bg-gray-300 dark:bg-gray-700";
  };

  // ── ESTADO 1: Cargando ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 min-h-[320px] flex flex-col items-center justify-center gap-3 transition-colors rounded-3xl shadow-sm p-8 font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  // ── ESTADO 2: Proveedor Nuevo / Sin Score ──────────────────────────────
  if (
    !myActionableScore ||
    myActionableScore.isNewProvider ||
    myActionableScore.band === "NUEVO"
  ) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 min-h-[320px] flex flex-col items-center justify-center p-8 text-center transition-colors rounded-3xl shadow-sm font-sans space-y-3">
        <div className="w-12 h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
          <Sparkles className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("unlock_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("unlock_desc")}
          </p>
        </div>
      </div>
    );
  }

  // ── ESTADO 3: Proveedor con Score Calificado ───────────────────────────
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col min-h-[350px] transition-colors rounded-3xl shadow-sm overflow-hidden font-sans">
      {/* Header del Card */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t("quality_metrics")}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight leading-none">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("audit_title")}</span>
          </h2>
        </div>

        <div className="flex flex-col md:items-end gap-1">
          <ProviderScoreBadge scoreData={myActionableScore} />
          <p className="text-[11px] font-mono font-medium text-gray-400 pt-0.5">
            {t("updated_at", {
              date: new Date(
                myActionableScore.lastCalculatedAt
              ).toLocaleDateString(),
            })}
          </p>
        </div>
      </div>

      {/* Body: Desglose por Pilares */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
        <TooltipProvider delayDuration={150}>
          {myActionableScore.breakdown &&
            Object.entries(myActionableScore.breakdown).map(([key, pillar]) => {
              const hasActions = pillar.actions && pillar.actions.length > 0;
              const isExpanded = expandedPillar === key;

              return (
                <div
                  key={key}
                  className="border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors"
                >
                  <div
                    role={hasActions ? "button" : undefined}
                    tabIndex={hasActions ? 0 : undefined}
                    className={cn(
                      "p-5 sm:p-6 flex flex-col gap-3 group select-none",
                      hasActions &&
                        "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#050505]"
                    )}
                    onClick={() =>
                      hasActions && setExpandedPillar(isExpanded ? null : key)
                    }
                    onKeyDown={(e) => {
                      if (
                        hasActions &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        setExpandedPillar(isExpanded ? null : key);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors">
                          {pillarIcons[key]}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {pillar.name}
                          </span>
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-help transition-colors border-0 bg-transparent p-0"
                              >
                                <Info className="w-3.5 h-3.5" strokeWidth={2} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-xl max-w-xs font-sans">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                                {pillar.tooltip}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                          {pillar.percentage}%
                        </span>
                        {hasActions && (
                          <div className="w-7 h-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-200 dark:group-hover:border-emerald-900/40 transition-colors">
                            {isExpanded ? (
                              <ChevronUp
                                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300"
                                strokeWidth={2}
                              />
                            ) : (
                              <ChevronDown
                                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300"
                                strokeWidth={2}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="h-2 rounded-full w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getProgressColorClass(pillar.status)
                        )}
                        style={{ width: `${pillar.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Panel de Acciones Expandible */}
                  {hasActions && isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] space-y-3">
                      {pillar.potentialPoints != null &&
                        pillar.potentialPoints > 0 && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full shadow-2xs">
                            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>
                              {t("projected_delta", {
                                points: pillar.potentialPoints,
                              })}
                            </span>
                          </div>
                        )}
                      <ul className="space-y-2.5 pt-1">
                        {pillar.actions?.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 mt-1.5" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </TooltipProvider>

        {/* Footer Percentil */}
        {myActionableScore.percentile != null && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] text-center mt-auto rounded-b-3xl">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t.rich("top_percentile", {
                percent: 100 - myActionableScore.percentile,
                highlight: (chunks) => (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 mx-1">
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}