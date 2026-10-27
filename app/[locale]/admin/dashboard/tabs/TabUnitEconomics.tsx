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
  Users,
  Zap,
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
import { calculateConsultationUnitEconomics } from "@/lib/finops/unit-economics-calculator";

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
  const gcpCost = economics?.cloudCosts ?? null;
  const aiCost = economics?.aiCosts ?? null;
  const satCost = economics?.satFacturamaCosts ?? null;
  const commsCost = economics?.communicationsCosts ?? null;
  const stripeCost = economics?.stripeFees ?? null;
  const totalOperatingCosts = economics?.totalCosts ?? null;

  const allCosts = [
    {
      name: "Pasarela Stripe",
      cost: stripeCost,
      color: "#f97316",
      icon: CreditCard,
      desc: "Comisión real retenida por Stripe en transacciones del periodo",
      quality: ((economics?.costsQuality?.["stripeFees"] as SignalQuality) ||
        (stripeCost !== null ? "PROVISIONAL" : "UNAVAILABLE")) as SignalQuality,
      source: "Stripe Balance API",
      alwaysShow: true,
    },
    {
      name: "Infraestructura GCP",
      cost: gcpCost,
      color: "#f43f5e",
      icon: Cloud,
      desc:
        gcpCost && gcpCost > 0
          ? "Cloud Run, Cloud SQL, Storage (BigQuery Billing Export)"
          : "Exportación BigQuery pendiente de datos en el mes actual",
      quality: ((economics?.costsQuality?.["cloudCosts"] as SignalQuality) ||
        (gcpCost && gcpCost > 0 ? "PROVISIONAL" : "UNAVAILABLE")) as SignalQuality,
      source: "GCP Billing Export",
      alwaysShow: true,
    },
    {
      name: "Inteligencia Artificial (Gemini)",
      cost: aiCost,
      color: "#8b5cf6",
      icon: Cpu,
      desc: "Health Agent & Copilot Tokens",
      quality: ((economics?.costsQuality?.["aiCosts"] as SignalQuality) ||
        (aiCost !== null ? "PROVISIONAL" : "UNAVAILABLE")) as SignalQuality,
      source: "Gemini Billing API",
      alwaysShow: false,
    },
    {
      name: "Facturación SAT (Facturama)",
      cost: satCost,
      color: "#3b82f6",
      icon: Receipt,
      desc: "Timbres fiscales CFDI 4.0",
      quality: ((economics?.costsQuality?.["satFacturamaCosts"] as SignalQuality) ||
        (satCost !== null ? "PROVISIONAL" : "UNAVAILABLE")) as SignalQuality,
      source: "Facturama API",
      alwaysShow: false,
    },
    {
      name: "Comunicaciones (SMS/Resend)",
      cost: commsCost,
      color: "#06b6d4",
      icon: Mail,
      desc: "Notificaciones y OTPs",
      quality: ((economics?.costsQuality?.["communicationsCosts"] as SignalQuality) ||
        (commsCost !== null ? "PROVISIONAL" : "UNAVAILABLE")) as SignalQuality,
      source: "Resend / Twilio API",
      alwaysShow: false,
    },
  ];

  // Mostrar únicamente fuentes conectadas o con datos reales para evitar saturación visual
  const costBreakdown = allCosts.filter(
    (item) => item.alwaysShow || (item.cost !== null && item.cost !== undefined)
  );

  const arpu = economics?.arpu;
  const hasArpu = typeof arpu === "number";
  const cpau = economics?.costPerUser;
  const hasCpau = typeof cpau === "number";
  const grossMargin = economics?.grossMargin;
  const hasGrossMargin = typeof grossMargin === "number";

  const planTiers = economics?.planTiers ?? [];
  const salesByType = economics?.salesByType ?? [];

  return (
    <div className="space-y-6">
      {/* Connected SaaS & Margin Metrics Strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Métricas Conectadas de Monetización & SaaS ({selectedPeriod.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-500">
              Calculadas en tiempo real desde Stripe API y PostgreSQL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
              Margen Bruto (Post-Stripe)
            </span>
            <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">
              {hasGrossMargin ? formatCurrency(grossMargin) : "No disponible"}
            </span>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              Revenue Stripe menos comisiones de pasarela
            </span>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl">
            <span className="text-[11px] text-blue-800 font-bold uppercase tracking-wider block">
              ARR Proyectado (12x MRR)
            </span>
            <span className="text-2xl font-extrabold text-blue-950 mt-1 block">
              {typeof economics?.arr === "number" ? formatCurrency(economics.arr) : "No disponible"}
            </span>
            <span className="text-[11px] text-blue-700 mt-1 block">
              MRR actual:{" "}
              {typeof economics?.mrr === "number" ? formatCurrency(economics.mrr) : "N/D"}
            </span>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
            <span className="text-[11px] text-indigo-800 font-bold uppercase tracking-wider block">
              Usuarios Totales en BD
            </span>
            <span className="text-2xl font-extrabold text-indigo-950 mt-1 block">
              {typeof economics?.totalUsers === "number" ? economics.totalUsers : "No disponible"}
            </span>
            <span className="text-[11px] text-indigo-700 mt-1 block">
              Suscripciones activas: {economics?.activeSubscriptions ?? 0}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider block">
              Tasa de Churn SaaS (BD)
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {typeof economics?.churnRate === "number"
                ? `${economics.churnRate}%`
                : "0%"}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Cancelaciones registradas en PostgreSQL
            </span>
          </div>
        </div>
      </div>

      {/* Top Unit Economics KPIs (ADMIN-TRUST-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ARPU (Ingreso / Usuario)"
          value={hasArpu ? formatCurrency(arpu) : null}
          subtext="Promedio global por usuario en BD"
          icon={DollarSign}
          variant="emerald"
          quality={economics ? (hasArpu ? "CERTIFIED" : "UNAVAILABLE") : "UNAVAILABLE"}
          source="Stripe + PostgreSQL"
          owner="Finanzas & FinOps"
          asOf={economics?.asOf}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Ingreso promedio por usuario registrado (Revenue total Stripe / Total usuarios en BD)."
        />
        <KpiCard
          title="Costo por Usuario (CPAU)"
          value={hasCpau ? formatCurrency(cpau) : null}
          subtext="Nube + Pasarelas / Activo"
          icon={TrendingUp}
          variant="rose"
          quality={
            ((economics?.costsQuality?.["costPerUser"] ||
              (economics?.costsQuality?.["cpau"] as SignalQuality)) ||
              (hasCpau ? "CERTIFIED" : "UNAVAILABLE")) as SignalQuality
          }
          source="FinOps Aggregator"
          owner="FinOps & Infraestructura"
          asOf={economics?.asOf}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Requiere exportación completa de costos en BigQuery."
        />
        <KpiCard
          title="Costo Operativo Total"
          value={totalOperatingCosts !== null ? formatCurrency(totalOperatingCosts) : null}
          subtext="Gastos directos certificados"
          icon={Layers}
          variant="orange"
          quality={
            ((economics?.costsQuality?.["totalCosts"] as SignalQuality) ||
              (totalOperatingCosts !== null ? "CERTIFIED" : "UNAVAILABLE")) as SignalQuality
          }
          source="Stripe + GCP BigQuery"
          owner="Finanzas & Infraestructura"
          asOf={economics?.asOf}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Costos totales certificados de operación del periodo."
        />
        <KpiCard
          title="Margen Neto Global"
          value={
            economics && economics.netProfit !== undefined && economics.netProfit !== null
              ? formatCurrency(economics.netProfit)
              : null
          }
          subtext="Utilidad neta post-nube"
          icon={Percent}
          variant="indigo"
          quality={
            ((economics?.costsQuality?.["netProfit"] as SignalQuality) ||
              (economics?.netProfit !== null && economics?.netProfit !== undefined
                ? "PROVISIONAL"
                : "UNAVAILABLE")) as SignalQuality
          }
          source="Conciliación Financiera"
          owner="Dirección Financiera"
          asOf={economics?.asOf}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Utilidad neta una vez descontados costos de pasarela e infraestructura cloud."
        />
      </div>

      {/* Connected Plan Tier Distribution & Sales Volume from PostgreSQL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-blue-600" />
            Distribución Real de Planes SaaS (PostgreSQL)
          </h3>
          {planTiers.length > 0 ? (
            <div className="space-y-3">
              {planTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {tier.tierName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {tier.activeSubscribers} suscriptores activos ({tier.percentageShare}%)
                    </span>
                  </div>
                  <span className="font-bold text-blue-700 text-sm">
                    {formatCurrency(tier.monthlyRevenue)} / mes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">
              No hay planes activos registrados en este corte.
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-emerald-600" />
            Volumen de Ventas por Categoría (PostgreSQL)
          </h3>
          {salesByType.length > 0 ? (
            <div className="space-y-3">
              {salesByType.map((sale, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {sale.itemType}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sale.volumeCount} operaciones completadas
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(sale.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">
              Sin operaciones liquidadas en el periodo seleccionado ({selectedPeriod}).
            </p>
          )}
        </div>
      </div>

      {/* Connected Cost Sources Breakdown & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Fuentes de Costo Conectadas (Stripe & GCP BigQuery)
          </h3>
          <div className="space-y-3">
            {costBreakdown.map((item) => {
              const Icon = item.icon;
              const percent =
                item.cost !== null &&
                item.cost !== undefined &&
                totalOperatingCosts !== null &&
                totalOperatingCosts > 0
                  ? Math.round(((item.cost ?? 0) / totalOperatingCosts) * 100)
                  : null;
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
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            item.quality === "CERTIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.quality === "PROVISIONAL"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.quality === "CERTIFIED"
                            ? "CERTIFICADO"
                            : item.quality === "PROVISIONAL"
                            ? "CONECTADO"
                            : "NO DISPONIBLE"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-base block">
                      {item.cost !== null && item.cost !== undefined
                        ? formatCurrency(item.cost)
                        : "No disponible"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {percent !== null ? `${percent}% del total` : item.source}
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
              Comparativa de Costos
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Costos verificados en el periodo ({selectedPeriod})
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costBreakdown.map((c) => ({ ...c, chartCost: c.cost ?? 0 }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={10}
                  width={100}
                />
                <RechartsTooltip
                  formatter={(v: number, name: string, item: any) =>
                    item?.payload?.cost !== null && item?.payload?.cost !== undefined
                      ? formatCurrency(v)
                      : "No disponible"
                  }
                />
                <Bar dataKey="chartCost" radius={[0, 6, 6, 0]}>
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🔬 SPRINT-4: Unit Economics Granular por Consulta Médica */}
      {(() => {
        const sampleConsultation = calculateConsultationUnitEconomics({
          consultationPrice: 800,
          quhealthyTakePercent: 0.15,
          durationMinutes: 30,
        });

        return (
          <div
            data-testid="unit-economics-consultation-breakdown"
            className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Unit Economics Auditado
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    Modelo Unitario por Consulta Típica ($800 MXN / 30 min)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Desglose de COGS directos: Cloud Run + Vertex AI + LiveKit WebRTC + Stripe + Facturama SAT.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase block">
                  Margen de Contribución
                </span>
                <span className="text-xl font-black text-emerald-600 block">
                  {formatCurrency(sampleConsultation.contributionMargin)} ({sampleConsultation.contributionMarginPercent}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Precio Paciente</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {formatCurrency(sampleConsultation.consultationPrice)}
                </p>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/60">
                <p className="text-[10px] font-bold text-indigo-700 uppercase">Take QuHealthy (15%)</p>
                <p className="text-sm font-extrabold text-indigo-950 mt-0.5">
                  {formatCurrency(sampleConsultation.quhealthyGrossTake)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Payout Doctor (85%)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {formatCurrency(sampleConsultation.providerPayout)}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Stripe (3.6% + $3)</p>
                <p className="text-sm font-extrabold text-amber-950 mt-0.5">
                  {formatCurrency(sampleConsultation.stripeFee)}
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60">
                <p className="text-[10px] font-bold text-purple-700 uppercase">Infra (Run + AI + WebRTC)</p>
                <p className="text-sm font-extrabold text-purple-950 mt-0.5">
                  {formatCurrency(
                    sampleConsultation.cloudRunCost +
                      sampleConsultation.vertexAiCost +
                      sampleConsultation.liveKitCost
                  )}
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Timbre SAT CFDI 4.0</p>
                <p className="text-sm font-extrabold text-blue-950 mt-0.5">
                  {formatCurrency(sampleConsultation.satCfdiCost)}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
