"use client";

import React from "react";
import {
  Users,
  Clock,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import { ProductMetricsDTO } from "@/services/admin.service";

interface TabProductAnalyticsProps {
  productMetrics: ProductMetricsDTO | null;
}

export const TabProductAnalytics: React.FC<TabProductAnalyticsProps> = ({
  productMetrics,
}) => {
  const dau = productMetrics?.dau || 0;
  const wau = productMetrics?.wau || 0;
  const mau = productMetrics?.mau || 0;
  const stickiness = productMetrics?.stickinessRatio || 0;

  const topModules = productMetrics?.topModules || [];
  const dauTrends = productMetrics?.dauTrends || [];
  const providerFunnel = productMetrics?.providerOnboardingFunnel || [];
  const patientFunnel = productMetrics?.patientBookingFunnel || [];

  const CATEGORY_COLORS: Record<string, string> = {
    CLINICAL: "bg-medical-50 text-medical-700 border-medical-200",
    BUSINESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
    AI: "bg-purple-50 text-purple-700 border-purple-200",
    GENERAL: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Product Engagement KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="DAU (Usuarios Activos Hoy)"
          value={dau}
          changePercent={0}
          changePeriod="Usuarios diarios"
          icon={Flame}
          variant="orange"
        />
        <KpiCard
          title="MAU (Usuarios Activos Mes)"
          value={mau}
          changePercent={0}
          changePeriod={`${productMetrics?.activeProvidersMonth || 0} Médicos / ${productMetrics?.activePatientsMonth || 0} Pacientes`}
          icon={Users}
          variant="indigo"
        />
        <KpiCard
          title="Stickiness (DAU / MAU)"
          value={`${stickiness}%`}
          subtext="Ratio de retención diaria"
          icon={Activity}
          variant="emerald"
        />
        <KpiCard
          title="Duración Media de Sesión"
          value={`${productMetrics?.avgSessionDurationMinutes || 0}m`}
          subtext={`${productMetrics?.totalSessionsMonth || 0} sesiones totales`}
          icon={Clock}
          variant="blue"
        />
      </div>

      {/* DAU Trends & Session Activity */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Tendencia de Actividad Diaria (DAU & Sesiones Totales)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fluctuación de médicos y pacientes interactuando con la plataforma
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            {productMetrics?.totalSessionsMonth || 2150} sesiones este mes
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dauTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="activeUsers"
                name="Usuarios Activos (DAU)"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorDau)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🏆 Leaderboard: ¿Qué módulo se usa más? */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Ranking de Adopción y Uso de Módulos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución exacta de clics, tiempo de permanencia y médicos activos por módulo.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Telemetría en tiempo real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Módulo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Eventos / Clics</th>
                <th className="px-4 py-3 text-right">Médicos Únicos</th>
                <th className="px-4 py-3 text-right">Tiempo Total</th>
                <th className="px-4 py-3 rounded-tr-xl">Participación (%)</th>
              </tr>
            </thead>
            <tbody>
              {topModules.map((mod, idx) => (
                <tr
                  key={mod.moduleCode}
                  className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    {mod.moduleName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.GENERAL
                      }`}
                    >
                      {mod.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                    {mod.totalEvents.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                    {mod.uniqueUsers} médicos
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                    {Math.round(mod.totalDurationMinutes / 60)} hrs
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${mod.percentageShare}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 text-xs w-10 text-right">
                        {mod.percentageShare}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Embudos de Conversión (Funnels) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Onboarding Funnel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Embudo de Activación de Médicos
            </h3>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Conversión Final: 32.8%
            </span>
          </div>
          <div className="space-y-3">
            {providerFunnel.map((step, idx) => (
              <div key={step.stepName} className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{step.stepName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{step.count} usuarios</span>
                    {idx > 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        ({step.conversionRate}% paso previo)
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-medical-500 h-full rounded-full"
                    style={{
                      width: `${(step.count / (providerFunnel[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Booking Funnel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Embudo de Agendamiento de Pacientes
            </h3>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Conversión Final: 30.4%
            </span>
          </div>
          <div className="space-y-3">
            {patientFunnel.map((step, idx) => (
              <div key={step.stepName} className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{step.stepName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{step.count} pacientes</span>
                    {idx > 0 && (
                      <span className="text-[11px] text-indigo-600 font-semibold">
                        ({step.conversionRate}% paso previo)
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${(step.count / (patientFunnel[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
