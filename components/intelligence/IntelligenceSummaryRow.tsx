"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Users, MapPin, Building, Map, AlertCircle } from "lucide-react";

import { useIntelligenceSummary } from "@/hooks/useIntelligence";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function IntelligenceSummaryRow() {
  const t = useTranslations("Intelligence.SummaryRow");
  const { data, loading, error } = useIntelligenceSummary();

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xs flex flex-col items-center justify-center gap-3 font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 shadow-2xs flex items-center justify-center gap-3 font-sans">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" strokeWidth={2} />
        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {t("error")}
        </p>
      </div>
    );
  }

  const kpis = [
    {
      title: t("kpi_total"),
      value: data.totalEstablishments.toLocaleString(),
      icon: Building,
    },
    {
      title: t("kpi_georeferenced"),
      value: data.georeferencedEstablishments.toLocaleString(),
      icon: MapPin,
    },
    {
      title: t("kpi_private"),
      value: data.privateEstablishments.toLocaleString(),
      icon: Users,
    },
    {
      title: t("kpi_entities"),
      value: "32 / 32",
      icon: Map,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans select-none">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xs hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-tight leading-tight">
                {kpi.title}
              </h3>
            </div>

            <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
              {kpi.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}