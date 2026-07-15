import { Metadata } from "next";
import { MapPin, Activity, Building2, BarChart3, Database } from "lucide-react";
import dynamic from "next/dynamic";

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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24 transition-colors duration-300 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      {/* Hero Section Arquitectónico */}
      <div className="border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black dark:text-white">
              Inteligencia Epidemiológica
            </h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-3xl mb-12 leading-relaxed">
            SISTEMA DE TELEMETRÍA Y CENSO GEORREFERENCIADO DE INFRAESTRUCTURA
            CLÍNICA EN MÉXICO. MONITOREO DE REDES DE SALUD PÚBLICA Y PRIVADA EN
            TIEMPO REAL.
          </p>

          <IntelligenceSummaryRow />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        <QueryBuilder />

        {/* Mapa Principal */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
          <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-1">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                Cartografía Nacional
              </h2>
              <p className="text-[9px] uppercase tracking-widest text-gray-500">
                DISTRIBUCIÓN GEOGRÁFICA DE UNIDADES MÉDICAS REGISTRADAS.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
              <Database className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>DATOS OFICIALES VIGENTES</span>
            </div>
          </div>
          <div className="p-0 bg-gray-100 dark:bg-[#111] relative min-h-[500px]">
            <MapWrapper />
          </div>
        </div>

        {/* Paneles de Datos Analíticos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
            <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-1">
                <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
                Densidad por Estado
              </h3>
              <p className="text-[9px] uppercase tracking-widest text-gray-500">
                CONCENTRACIÓN DE INFRAESTRUCTURA TERRITORIAL.
              </p>
            </div>
            <div className="p-6">
              <StateDistributionChart />
            </div>
          </div>

          <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
            <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-1">
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
                Segmentación Institucional
              </h3>
              <p className="text-[9px] uppercase tracking-widest text-gray-500">
                DESGLOSE DE ACTIVOS POR DEPENDENCIA RECTORA.
              </p>
            </div>
            <div className="p-6">
              <InstitutionDistributionChart />
            </div>
          </div>
        </div>

        {/* Tabla Explorable */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
          <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
              Registro Tabular Interactivo
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-gray-500">
              EXPLORACIÓN GRANULAR Y EXTRACCIÓN DE DATOS PARAMETRIZADOS.
            </p>
          </div>
          <div className="p-6 overflow-x-auto">
            <HealthcareExplorerTable />
          </div>
        </div>
      </div>
    </div>
  );
}
