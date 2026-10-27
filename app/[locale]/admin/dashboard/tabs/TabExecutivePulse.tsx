"use client";

import React from "react";
import {
  DollarSign,
  Users,
  CalendarCheck,
  Activity,
  ShieldCheck,
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
import { StartupAristasRadar } from "../components/StartupAristasRadar";
import { SignalQuality } from "@/types/admin-signal";
import {
  UnitEconomicsDTO,
  AdminDashboardDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
  MicroserviceHealthDTO,
} from "@/services/admin.service";

interface TabExecutivePulseProps {
  economics: UnitEconomicsDTO | null;
  dashboard: AdminDashboardDTO | null;
  productMetrics: ProductMetricsDTO | null;
  providers: ProviderAdminDTO[];
  services?: MicroserviceHealthDTO[];
  selectedPeriod?: string;
  formatCurrency: (val: number) => string;
  onNavigateTab: (tab: any) => void;
}

export type DateValidationStatus = "VALID" | "MISSING" | "INVALID" | "FUTURE" | "STALE";

export interface ValidatedDateInfo {
  status: DateValidationStatus;
  raw?: string;
  formattedText: string;
  isStale: boolean;
  isValid: boolean;
}

export function validateSourceDate(rawDate?: string | null, maxAgeHours = 48): ValidatedDateInfo {
  if (!rawDate || typeof rawDate !== "string" || rawDate.trim() === "") {
    return {
      status: "MISSING",
      formattedText: "No disponible / No verificado",
      isStale: false,
      isValid: false,
    };
  }

  const trimmed = rawDate.trim();
  const isLikelyDate = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(trimmed);
  const parsed = new Date(trimmed);
  const time = parsed.getTime();
  if (isNaN(time) || !isLikelyDate) {
    return {
      status: "INVALID",
      raw: rawDate,
      formattedText: "Fecha inválida",
      isStale: false,
      isValid: false,
    };
  }

  const now = Date.now();
  if (time > now + 120000) {
    return {
      status: "FUTURE",
      raw: rawDate,
      formattedText: "Fecha futura no válida",
      isStale: false,
      isValid: false,
    };
  }

  const isStale = now - time > maxAgeHours * 3600 * 1000;
  if (isStale) {
    return {
      status: "STALE",
      raw: rawDate,
      formattedText: `${parsed.toLocaleDateString("es-MX")} (Obsoleto >${maxAgeHours}h)`,
      isStale: true,
      isValid: true,
    };
  }

  return {
    status: "VALID",
    raw: rawDate,
    formattedText: parsed.toLocaleDateString("es-MX"),
    isStale: false,
    isValid: true,
  };
}

export const TabExecutivePulse: React.FC<TabExecutivePulseProps> = ({
  economics,
  dashboard,
  productMetrics,
  providers,
  services = [],
  selectedPeriod = "30d",
  formatCurrency,
  onNavigateTab,
}) => {
  const pendingKyc = providers.filter((p) => !p.onboardingComplete || p.status === "INACTIVE");

  const totalServices = services.length;
  const upCount = services.filter((s) => s.status === "UP").length;
  const upServices = services.filter((s) => s.status === "UP" && typeof s.latencyMs === "number");
  const avgLatency =
    upServices.length > 0
      ? Math.round(upServices.reduce((acc, s) => acc + (s.latencyMs || 0), 0) / upServices.length)
      : 0;

  const revenueData =
    economics?.chartData && economics.chartData.length > 0
      ? economics.chartData.map((d) => {
          const sub = typeof d.subscriptions === "number" ? d.subscriptions : 0;
          const comm = typeof d.commissions === "number" ? d.commissions : 0;
          return {
            name: d.date,
            suscripciones: sub,
            comisiones: comm,
            total: sub + comm,
          };
        })
      : [];

  // Validación de fechas por fuente (ADMIN-TRUST-01)
  const economicsDate = validateSourceDate(economics?.asOf);
  const dashboardDate = validateSourceDate(dashboard?.generatedAt);
  const productMetricsDate = validateSourceDate(productMetrics?.asOf);

  const totalGmvVal = typeof economics?.totalGmv === "number" ? economics.totalGmv : null;
  const displayGmv = totalGmvVal !== null ? formatCurrency(totalGmvVal) : null;

  const onlineRevText =
    typeof economics?.onlineRevenue === "number" ? formatCurrency(economics.onlineRevenue) : null;
  const inClinicRevText =
    typeof economics?.inClinicRevenue === "number"
      ? formatCurrency(economics.inClinicRevenue)
      : null;
  const gmvBreakdown =
    onlineRevText !== null && inClinicRevText !== null
      ? `En línea: ${onlineRevText} · Consultorio: ${inClinicRevText}`
      : undefined;

  const gmvQuality: SignalQuality =
    !economics || totalGmvVal === null
      ? "UNAVAILABLE"
      : economicsDate.status === "INVALID" || economicsDate.status === "FUTURE"
      ? "ERROR"
      : economics.reconciliationQuality || "PROVISIONAL";

  const mrrVal =
    typeof economics?.mrr === "number"
      ? economics.mrr
      : typeof economics?.totalSubscriptionsRevenue === "number"
      ? economics.totalSubscriptionsRevenue
      : null;
  const displayMrr = mrrVal !== null ? formatCurrency(mrrVal) : null;

  const mrrBreakdown =
    typeof economics?.activeSubscriptions === "number"
      ? `${economics.activeSubscriptions} suscripciones activas`
      : undefined;

  const mrrQuality: SignalQuality =
    !economics || mrrVal === null
      ? "UNAVAILABLE"
      : economicsDate.status === "INVALID" || economicsDate.status === "FUTURE"
      ? "ERROR"
      : economics.reconciliationQuality || "PROVISIONAL";

  const mauVal = typeof productMetrics?.mau === "number" ? productMetrics.mau : null;
  const mauBreakdown =
    typeof productMetrics?.activeProvidersMonth === "number" &&
    typeof productMetrics?.activePatientsMonth === "number"
      ? `${productMetrics.activeProvidersMonth} Médicos / ${productMetrics.activePatientsMonth} Pacientes`
      : undefined;

  const mauQuality: SignalQuality =
    !productMetrics || mauVal === null
      ? "UNAVAILABLE"
      : productMetricsDate.status === "INVALID" || productMetricsDate.status === "FUTURE"
      ? "ERROR"
      : "PROVISIONAL";

  const appointmentsTodayVal =
    typeof dashboard?.appointmentsToday === "number" ? dashboard.appointmentsToday : null;
  const appointmentsMonthText =
    typeof dashboard?.appointmentsThisMonth === "number"
      ? `${dashboard.appointmentsThisMonth} este mes`
      : undefined;

  const appointmentsQuality: SignalQuality =
    !dashboard || appointmentsTodayVal === null
      ? "UNAVAILABLE"
      : dashboardDate.status === "INVALID" || dashboardDate.status === "FUTURE"
      ? "ERROR"
      : "PROVISIONAL";

  const grossMarginVal =
    typeof economics?.grossMargin === "number" ? economics.grossMargin : null;
  const grossMarginPct =
    grossMarginVal !== null && economics?.totalRevenue && economics.totalRevenue > 0
      ? Math.round((grossMarginVal / economics.totalRevenue) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* 🚀 1. Top Executive KPIs Connected in Real Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title={`Volumen Clínico Agregado (${selectedPeriod.toUpperCase()})`}
          value={displayGmv}
          subtext={gmvBreakdown}
          icon={DollarSign}
          variant="emerald"
          quality={gmvQuality}
          source="PostgreSQL (citas online + consultorio)"
          owner="Operaciones / Finanzas"
          asOf={economicsDate.formattedText}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Volumen bruto agregado en PostgreSQL de citas pagadas en línea y en consultorio."
        />
        <KpiCard
          title={`Recaudo por Suscripciones (${selectedPeriod.toUpperCase()})`}
          value={displayMrr}
          subtext={mrrBreakdown}
          icon={Zap}
          variant="blue"
          quality={mrrQuality}
          source="Stripe Balance Transactions"
          owner="Finanzas"
          asOf={economicsDate.formattedText}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Cobros reales de suscripciones procesados en Stripe API en el periodo seleccionado."
        />
        <KpiCard
          title="Usuarios Activos (MAU)"
          value={mauVal}
          subtext={mauBreakdown}
          icon={Users}
          variant="indigo"
          quality={mauQuality}
          source="Telemetry Event Stream"
          owner="Growth / Producto"
          asOf={productMetricsDate.formattedText}
          period={selectedPeriod}
          isFilterable={true}
          explanation="Usuarios únicos con sesiones activas registradas por el motor de telemetría interna."
        />
        <KpiCard
          title="Citas Hoy"
          value={appointmentsTodayVal}
          subtext={appointmentsMonthText}
          icon={CalendarCheck}
          variant="purple"
          quality={appointmentsQuality}
          source="PostgreSQL Clinical Cluster"
          owner="Operaciones Médicas"
          asOf={dashboardDate.formattedText}
          period="24h"
          isFilterable={false}
          explanation="Citas agendadas y atendidas en el día calendario actual en PostgreSQL."
        />
      </div>

      {/* 🧭 2. Radar Operativo de las 6 Aristas Conectadas */}
      <StartupAristasRadar
        economics={economics}
        dashboard={dashboard}
        productMetrics={productMetrics}
        providers={providers}
        services={services}
        formatCurrency={formatCurrency}
        onNavigateTab={onNavigateTab}
      />

      {/* 📈 3. Main Chart & Connected Operational Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Velocidad de Ingresos en Stripe (SaaS vs Marketplace)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Serie histórica extraída en vivo desde Stripe BalanceTransactions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("finances")}
              className="text-xs font-semibold text-medical-600 hover:text-medical-700 flex items-center gap-1 cursor-pointer"
            >
              Ver finanzas completas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            {revenueData.length > 0 ? (
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
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center p-6 space-y-2">
                <Activity className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">
                  Sin cargos registrados en Stripe para este periodo ({selectedPeriod})
                </p>
                <p className="text-xs text-slate-400">
                  La conexión con Stripe API está activa; las transacciones se graficarán automáticamente al procesarse.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connected Operational Alerts */}
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
              Médicos en padrón con validación de cédula o perfil clínico pendiente.
            </p>
            <button
              onClick={() => onNavigateTab("operations")}
              className="mt-3.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Revisar Pipeline KYC <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Microservices Quick Badge */}
          <div
            data-testid="pulse-infra-card"
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    totalServices > 0 && upCount === totalServices
                      ? "text-emerald-600"
                      : totalServices === 0
                      ? "text-slate-400"
                      : "text-amber-600"
                  }`}
                />
                Clúster Cloud Run
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  totalServices === 0
                    ? "bg-slate-50 text-slate-600 border-slate-200"
                    : upCount === totalServices
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : upCount > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {totalServices > 0 ? `${upCount}/${totalServices} UP` : "Sin telemetría"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {totalServices === 0
                ? "Consultando sondas HTTP de Cloud Run..."
                : upCount === totalServices
                ? `Los ${totalServices} microservicios responden en línea (latencia media: ${avgLatency} ms).`
                : `${upCount} de ${totalServices} microservicios en línea (latencia media: ${avgLatency} ms).`}
            </p>
            <button
              onClick={() => onNavigateTab("health")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Ver Estado de Servidores <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Connected Gross Margin Post-Stripe Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Margen Bruto (Post-Stripe)</span>
              <span className="text-emerald-600 font-bold">
                {grossMarginPct !== null ? `${grossMarginPct}%` : "Sin volumen"}
              </span>
            </div>
            <div
              data-testid="pulse-gross-margin-value"
              className="text-2xl font-extrabold text-slate-900"
            >
              {grossMarginVal !== null ? formatCurrency(grossMarginVal) : "No disponible"}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                Comisiones Stripe:{" "}
                <strong className="text-slate-700">
                  {typeof economics?.stripeFees === "number"
                    ? formatCurrency(economics.stripeFees)
                    : "N/D"}
                </strong>
              </span>
              <button
                onClick={() => onNavigateTab("economics")}
                className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Unit Economics →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 4. Top Providers & Top Modules Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Providers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-medical-500" />
              Top Médicos por Volumen Clínico (PostgreSQL)
            </h3>
            <button
              onClick={() => onNavigateTab("finances")}
              className="text-xs font-semibold text-medical-600 hover:text-medical-700 cursor-pointer"
            >
              Ver libro mayor
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
                      <div className="flex items-center gap-1.5 flex-wrap text-xs mt-0.5">
                        {prov.onlineEarned && prov.onlineEarned > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium border border-emerald-200">
                            💳 En línea: {formatCurrency(prov.onlineEarned)}
                          </span>
                        ) : null}
                        {prov.inClinicEarned && prov.inClinicEarned > 0 ? (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium border border-amber-200">
                            💵 Consultorio: {formatCurrency(prov.inClinicEarned)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(prov.totalEarned)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Sin citas liquidadas registradas en este periodo.
            </p>
          )}
        </div>

        {/* Most Used Modules */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Módulos Más Utilizados (Telemetría en Vivo)
            </h3>
            <button
              onClick={() => onNavigateTab("analytics")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Ver telemetría
            </button>
          </div>

          <div className="space-y-3">
            {(productMetrics?.topModules || []).length > 0 ? (
              productMetrics!.topModules.slice(0, 4).map((mod) => (
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
                    <span>{mod.uniqueUsers} usuarios activos</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Esperando eventos de uso de módulos en el periodo actual.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
