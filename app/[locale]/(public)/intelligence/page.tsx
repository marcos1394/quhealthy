import { Metadata } from "next";
import Link from "next/link";
import { 
  MapPin, 
  Activity, 
  Building2, 
  BarChart3, 
  Database,
  ChevronRight,
  Table as TableIcon
} from "lucide-react";

import { MapWrapper } from "@/components/intelligence/MapWrapper";
import { IntelligenceSummaryRow } from "@/components/intelligence/IntelligenceSummaryRow";
import { StateDistributionChart } from "@/components/intelligence/StateDistributionChart";
import { InstitutionDistributionChart } from "@/components/intelligence/InstitutionDistributionChart";
import { HealthcareExplorerTable } from "@/components/intelligence/HealthcareExplorerTable";
import { QueryBuilder } from "@/components/intelligence/QueryBuilder";

export const metadata: Metadata = {
  title: "Auditoría de Salud | QuHealthy",
  description:
    "Terminal de datos interactiva de establecimientos de salud georreferenciados.",
};

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pb-24 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      
      {/* ── HERO SECTION ARQUITECTÓNICO ──────────────────────────────────── */}
      <div className="pt-28 pb-12 md:pt-36 md:pb-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
          
          {/* Breadcrumb Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
            <Link
              href="/"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              QuHealthy
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-bold">
              Auditoría de Salud
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Activity className="h-6 w-6" strokeWidth={2} />
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Inteligencia <span className="text-emerald-600 dark:text-emerald-400">Epidemiológica</span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-3xl pt-1">
              Sistema de telemetría y censo georreferenciado de la infraestructura clínica en México. Monitoreo integral de redes de salud pública y privada en tiempo real.
            </p>
          </div>

          {/* Summary Row */}
          <div className="pt-4">
            <IntelligenceSummaryRow />
          </div>

        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-10 space-y-10">
        
        {/* Query Builder */}
        <QueryBuilder />

        {/* MAPA PRINCIPAL */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Header del Mapa */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Cartografía Nacional de Infraestructura
                </h2>
              </div>
              <p className="text-xs font-medium text-gray-500 pl-10">
                Distribución geográfica y geolocalización de unidades médicas registradas.
              </p>
            </div>

            <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <Database className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Datos Oficiales Vigentes</span>
            </div>
          </div>

          {/* Mapa Wrapper Container */}
          <div className="p-0 bg-gray-100 dark:bg-[#111] relative min-h-[500px]">
            <MapWrapper />
          </div>
        </div>

        {/* GRÁFICAS DE DATOS ANALÍTICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Estado */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <BarChart3 className="h-4 w-4" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Densidad por Entidad Federativa
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-500 pl-10">
                Concentración territorial de infraestructura de salud.
              </p>
            </div>

            <div className="pt-2">
              <StateDistributionChart />
            </div>
          </div>

          {/* Chart 2: Institución */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Building2 className="h-4 w-4" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Segmentación por Institución
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-500 pl-10">
                Desglose de activos por dependencia rectora y sector.
              </p>
            </div>

            <div className="pt-2">
              <InstitutionDistributionChart />
            </div>
          </div>

        </div>

        {/* TABLA DE EXPLORACIÓN GRANULAR */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 overflow-hidden">
          <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <TableIcon className="h-4 w-4" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Registro Tabular Interactivo
              </h2>
            </div>
            <p className="text-xs font-medium text-gray-500 pl-10">
              Exploración granular y extracción de datos parametrizados.
            </p>
          </div>

          <div className="overflow-x-auto">
            <HealthcareExplorerTable />
          </div>
        </div>

      </div>

    </div>
  );
}