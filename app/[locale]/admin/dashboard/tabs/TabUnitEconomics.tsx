"use client";

import React from "react";
import {
  DollarSign,
  Cloud,
  Cpu,
  Receipt,
  Mail,
  CreditCard,
  TrendingUp,
  Percent,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import { UnitEconomicsDTO } from "@/services/admin.service";
import { SignalQuality } from "@/types/admin-signal";

interface TabUnitEconomicsProps {
  economics: UnitEconomicsDTO | null;
  selectedPeriod?: string;
  formatCurrency: (val: number) => string;
}

export const TabUnitEconomics: React.FC<TabUnitEconomicsProps> = ({
  economics,
  selectedPeriod = "30d",
  formatCurrency,
}) => {
  const gcpCost = economics?.cloudCosts || 0;
  const aiCost = economics?.aiCosts || 0;
  const satCost = economics?.satFacturamaCosts || 0;
  const commsCost = economics?.communicationsCosts || 0;
  const stripeCost = economics?.stripeFees || 0;
  const totalOperatingCosts =
    economics?.totalCosts || gcpCost + aiCost + satCost + commsCost + stripeCost;

  const costBreakdown = [
    {
      name: "Pasarela Stripe",
      cost: stripeCost,
      color: "#f97316",
      icon: CreditCard,
      desc: "Comisión fija + 3.6%",
      quality: "CERTIFIED" as SignalQuality,
      source: "Stripe Balance API",
    },
    {
      name: "Infraestructura GCP",
      cost: gcpCost,
      color: "#f43f5e",
      icon: Cloud,
      desc: gcpCost > 0 ? "Cloud Run, Cloud SQL, Storage" : "Sin exportación BigQuery activa",
      quality: (gcpCost > 0 ? "CERTIFIED" : "UNAVAILABLE") as SignalQuality,
      source: "GCP Billing Export",
    },
    {
      name: "Inteligencia Artificial (Gemini)",
      cost: aiCost,
      color: "#8b5cf6",
      icon: Cpu,
      desc: "Health Agent & Copilot Tokens (Estimación teórica)",
      quality: "PROVISIONAL" as SignalQuality,
      source: "Modelo Teórico por Consulta",
    },
    {
      name: "Facturación SAT (Facturama)",
      cost: satCost,
      color: "#3b82f6",
      icon: Receipt,
      desc: "Timbres fiscales CFDI 4.0 (Estimación por cita)",
      quality: "PROVISIONAL" as SignalQuality,
      source: "Modelo Teórico por CFDI",
    },
    {
      name: "Comunicaciones (SMS/Resend)",
      cost: commsCost,
      color: "#06b6d4",
      icon: Mail,
      desc: "Notificaciones y OTPs (Estimación por evento)",
      quality: "PROVISIONAL" as SignalQuality,
      source: "Modelo Teórico por Notificación",
    },
  ];

  const hasArpu = economics && economics.arpu !== undefined && economics.arpu !== null;
  const contributionMargin = hasArpu ? economics.arpu - (economics.costPerUser || 0) : 0;
  const contributionMarginPct = hasArpu && economics.arpu > 0
    ? Math.round((contributionMargin / economics.arpu) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ⚠️ Aviso de Escenario Estimado & Veracidad de Señales */}
      {economics?.isEstimatedScenario && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-950">Escenario Estimado (Señal Provisional)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {economics.reconciliationQuality || "PROVISIONAL"}
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {economics.reconciliationNotes || "Los costos de infraestructura IA, timbrado SAT y mensajería se calculan en base a modelos teóricos de consumo. Conciliación bancaria en proceso."}
            </p>
          </div>
        </div>
      )}

      {/* Top Unit Economics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ARPU (Ingreso / Usuario)"
          value={formatCurrency(economics?.arpu || 0)}
          subtext="Promedio global por usuario activo"
          icon={DollarSign}
          variant="emerald"
          quality={economics ? "PROVISIONAL" : "UNAVAILABLE"}
          source="Modelo Financiero Unificado"
          owner="Finanzas & FinOps"
          asOf={economics?.asOf || new Date().toISOString()}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Ingreso promedio mensual por usuario activo (GMV comisiones + suscripciones SaaS / MAU)."
        />
        <KpiCard
          title="Costo por Usuario (CPAU)"
          value={formatCurrency(economics?.costPerUser || 0)}
          subtext="Nube + IA + Pasarelas / Activo"
          icon={TrendingUp}
          variant="rose"
          quality={(economics?.costsQuality?.["cpau"] as SignalQuality) || (economics ? "PROVISIONAL" : "UNAVAILABLE")}
          source="FinOps Aggregator"
          owner="FinOps & Infraestructura"
          asOf={economics?.asOf || new Date().toISOString()}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Suma de pasarelas Stripe, GCP, tokens IA, timbrado SAT y SMS dividida entre MAU."
        />
        <KpiCard
          title="Costo Operativo Total"
          value={formatCurrency(totalOperatingCosts)}
          subtext="Gastos directos del mes"
          icon={Layers}
          variant="orange"
          quality={(economics?.costsQuality?.["total"] as SignalQuality) || (economics ? "PROVISIONAL" : "UNAVAILABLE")}
          source="Stripe + GCP BigQuery + Estimaciones"
          owner="Finanzas & Infraestructura"
          asOf={economics?.asOf || new Date().toISOString()}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Costos totales de operación del periodo."
        />
        <KpiCard
          title="Margen Neto Global"
          value={formatCurrency(economics?.netProfit || 0)}
          changePercent={0}
          changePeriod="Utilidad neta real"
          icon={Percent}
          variant="indigo"
          quality={economics ? "PROVISIONAL" : "UNAVAILABLE"}
          source="Modelo de Conciliación Preliminar"
          owner="Dirección Financiera"
          asOf={economics?.asOf || new Date().toISOString()}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Utilidad neta calculada antes de conciliación bancaria definitiva."
        />
      </div>

      {/* Unit Economics Formula Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">
          Ecuación Unitaria de Rentabilidad (Por Usuario Activo)
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
          <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex-1 w-full">
            <span className="text-xs text-emerald-700 font-semibold uppercase block">
              Ingreso Promedio (ARPU)
            </span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
              {formatCurrency(economics?.arpu || 0)}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block">SaaS + Comisiones</span>
          </div>

          <div className="text-2xl font-bold text-slate-300 hidden md:block">-</div>

          <div className="text-center p-4 bg-rose-50 border border-rose-100 rounded-2xl flex-1 w-full">
            <span className="text-xs text-rose-700 font-semibold uppercase block">
              Costo Unitario (CPAU)
            </span>
            <span className="text-2xl font-extrabold text-rose-900 mt-1 block">
              {formatCurrency(economics?.costPerUser || 0)}
            </span>
            <span className="text-[11px] text-rose-600 mt-1 block">GCP + IA + Timbres + Pasarela</span>
          </div>

          <div className="text-2xl font-bold text-slate-300 hidden md:block">=</div>

          <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex-1 w-full">
            <span className="text-xs text-indigo-700 font-semibold uppercase block">
              Margen de Contribución
            </span>
            <span className="text-2xl font-extrabold text-indigo-950 mt-1 block">
              {formatCurrency(contributionMargin)}
            </span>
            <span className="text-[11px] text-indigo-600 mt-1 block">
              {contributionMarginPct}% de margen unitario
            </span>
          </div>
        </div>
      </div>

      {/* Granular Cost Breakdown Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Desglose Granular de Costos Operativos
          </h3>
          <div className="space-y-3">
            {costBreakdown.map((item) => {
              const Icon = item.icon;
              const percent = totalOperatingCosts > 0 ? Math.round((item.cost / totalOperatingCosts) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">
                          {item.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                          item.quality === "CERTIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.quality === "PROVISIONAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {item.quality === "CERTIFIED" ? "CERTIFICADO" : item.quality === "PROVISIONAL" ? "PROVISIONAL" : "NO DISPONIBLE"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-base block">
                      {formatCurrency(item.cost)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {percent}% del total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Chart Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Proporción de Costos
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparativa de impacto en la estructura financiera
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={100} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
