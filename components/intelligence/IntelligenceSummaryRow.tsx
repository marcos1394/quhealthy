"use client";

import { useIntelligenceSummary } from "@/hooks/useIntelligence";
import { Users, MapPin, Building, Map, AlertCircle } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function IntelligenceSummaryRow() {
  const { data, loading, error } = useIntelligenceSummary();

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center gap-3">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          Extrayendo métricas principales...
        </p>
      </div>
    );
  }

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-6 shadow-sm flex items-center justify-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={2} />
        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
          Error de lectura al recuperar las métricas de la infraestructura.
        </p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Activos Identificados",
      value: data.totalEstablishments.toLocaleString(),
      icon: Building,
    },
    {
      title: "Georreferenciados",
      value: data.georeferencedEstablishments.toLocaleString(),
      icon: MapPin,
    },
    {
      title: "Sector Privado",
      value: data.privateEstablishments.toLocaleString(),
      icon: Users,
    },
    {
      title: "Entidades Cubiertas",
      value: "32 / 32",
      icon: Map,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">
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