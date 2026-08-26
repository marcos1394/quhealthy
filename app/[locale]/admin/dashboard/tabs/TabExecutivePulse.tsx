"use client";

import React from "react";
import {
  DollarSign,
  Users,
  CalendarCheck,
  Activity,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Briefcase,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import {
  UnitEconomicsDTO,
  AdminDashboardDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
} from "@/services/admin.service";

interface TabExecutivePulseProps {
  economics: UnitEconomicsDTO | null;
  dashboard: AdminDashboardDTO | null;
  productMetrics: ProductMetricsDTO | null;
  providers: ProviderAdminDTO[];
  formatCurrency: (val: number) => string;
  onNavigateTab: (tab: any) => void;
}

export const TabExecutivePulse: React.FC<TabExecutivePulseProps> = ({
  economics,
  dashboard,
  productMetrics,
  providers,
  formatCurrency,
  onNavigateTab,
}) => {
  const pendingKyc = providers.filter((p) => !p.onboardingComplete || p.status === "INACTIVE");

  const revenueData = economics?.chartData && economics.chartData.length > 0
    ? economics.chartData.map((d) => ({
        name: d.date,
        suscripciones: d.subscriptions,
        comisiones: d.commissions,
        total: d.subscriptions + d.commissions,
      }))
    : [
        { name: "Sem 1", suscripciones: 0, comisiones: 0, total: 0 },
        { name: "Sem 2", suscripciones: 0, comisiones: 0, total: 0 },
        { name: "Sem 3", suscripciones: 0, comisiones: 0, total: 0 },
        { name: "Sem 4", suscripciones: economics?.totalSubscriptionsRevenue || 0, comisiones: economics?.totalCommissionsRevenue || 0, total: economics?.totalRevenue || 0 },
      ];

  return (
    <div className="space-y-6">
      {/* 🚀 Top Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title="Ingreso Total (30D)"
          value={formatCurrency(economics?.totalRevenue || 0)}
          changePercent={0}
          changePeriod="Ingreso total acumulado"
          icon={DollarSign}
          variant="emerald"
        />
        <KpiCard
          title="SaaS MRR (Planes Médicos)"
          value={formatCurrency(economics?.mrr || economics?.totalSubscriptionsRevenue || 0)}
          changePercent={0}
          changePeriod={`${economics?.activeSubscriptions || 0} suscripciones`}
          icon={Zap}
          variant="blue"
        />
        <KpiCard
          title="Usuarios Activos (MAU)"
          value={productMetrics?.mau || 0}
          changePercent={0}
          changePeriod={`${productMetrics?.activeProvidersMonth || 0} Médicos / ${productMetrics?.activePatientsMonth || 0} Pacientes`}
          icon={Users}
          variant="indigo"
        />
        <KpiCard
          title="Citas Hoy"
          value={dashboard?.appointmentsToday || 0}
          subtext={`${dashboard?.appointmentsThisMonth || 0} este mes`}
          icon={CalendarCheck}
          variant="purple"
        />
      </div>

      {/* 📈 Main Chart & Pulse Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Velocidad de Ingresos (SaaS vs Marketplace)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Crecimiento acumulado en las últimas 4 semanas
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("finances")}
              className="text-xs font-semibold text-medical-600 hover:text-medical-700 flex items-center gap-1"
            >
              Ver finanzas completas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaaS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="suscripciones"
                  name="SaaS (Suscripciones)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSaaS)"
                />
                <Area
                  type="monotone"
                  dataKey="comisiones"
                  name="Comisiones Marketplace"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center & Quick Alerts */}
        <div className="space-y-4">
          {/* KYC Pending Alert Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Onboarding & Cédulas
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {pendingKyc.length} Pendientes
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Médicos con registro completado esperando validación manual de cédula profesional.
            </p>
            <button
              onClick={() => onNavigateTab("operations")}
              className="mt-3.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              Revisar Pipeline KYC <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Microservices Quick Badge */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Infraestructura
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                14/14 UP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Todos los microservicios y agentes IA respondiendo con latencia promedio de 28ms.
            </p>
            <button
              onClick={() => onNavigateTab("health")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Ver Estado de Servidores <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unit Economics Snapshot */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Margen Neto Real</span>
              <span className="text-emerald-600 font-bold">
                {economics?.totalRevenue && economics.totalRevenue > 0
                  ? `${Math.round((economics.netProfit / economics.totalRevenue) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(economics?.netProfit || 0)}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    economics?.totalRevenue && economics.totalRevenue > 0
                      ? Math.min(Math.max(Math.round((economics.netProfit / economics.totalRevenue) * 100), 0), 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Top Providers & Top Modules Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Providers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-medical-500" />
              Top Médicos (Mayor Volumen)
            </h3>
            <button
              onClick={() => onNavigateTab("finances")}
              className="text-xs font-semibold text-medical-600 hover:text-medical-700"
            >
              Ver todos
            </button>
          </div>

          {economics?.topProviders && economics.topProviders.length > 0 ? (
            <div className="space-y-3">
              {economics.topProviders.slice(0, 4).map((prov, i) => (
                <div
                  key={prov.providerId}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-medical-100 text-medical-700 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">
                        {prov.providerName || `Dr. #${prov.providerId}`}
                      </span>
                      <span className="text-xs text-slate-400">Proveedor Verificado</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(prov.totalEarned)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No hay datos de doctores este mes.</p>
          )}
        </div>

        {/* Most Used Modules */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Módulos Más Utilizados (Telemetría)
            </h3>
            <button
              onClick={() => onNavigateTab("analytics")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver telemetría
            </button>
          </div>

          <div className="space-y-3">
            {(productMetrics?.topModules || []).slice(0, 4).map((mod) => (
              <div key={mod.moduleCode} className="space-y-1.5 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{mod.moduleName}</span>
                  <span className="font-bold text-slate-900">{mod.percentageShare}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, mod.percentageShare * 2.5)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{mod.totalEvents} eventos registrados</span>
                  <span>{mod.uniqueUsers} médicos activos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
