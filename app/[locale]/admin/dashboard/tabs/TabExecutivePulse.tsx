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
  // Rechazar strings arbitrarios que V8 parsea laxamente (exigir estructura estándar YYYY-MM-DD...)
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
  // Tolerancia de 2 minutos por desfase de reloj
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
  const avgLatency = upServices.length > 0
    ? Math.round(upServices.reduce((acc, s) => acc + (s.latencyMs || 0), 0) / upServices.length)
    : 0;

  const revenueData = economics?.chartData && economics.chartData.length > 0
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

  const hasStaleDate = economicsDate.isStale || dashboardDate.isStale || productMetricsDate.isStale;
  const hasTelemetry = Boolean(economics || dashboard || productMetrics);

  const primaryDate = economicsDate.isValid
    ? economicsDate
    : dashboardDate.isValid
    ? dashboardDate
    : productMetricsDate.isValid
    ? productMetricsDate
    : economicsDate;

  // Extracción estricta de métricas ejecutivas (erradicando || 0 y certificados automáticos)
  const totalGmvVal = typeof economics?.totalGmv === "number"
    ? economics.totalGmv
    : typeof economics?.totalRevenue === "number"
    ? economics.totalRevenue
    : null;
  const displayGmv = totalGmvVal !== null ? formatCurrency(totalGmvVal) : null;

  const onlineRevText = typeof economics?.onlineRevenue === "number" ? formatCurrency(economics.onlineRevenue) : null;
  const inClinicRevText = typeof economics?.inClinicRevenue === "number" ? formatCurrency(economics.inClinicRevenue) : null;
  const gmvBreakdown = onlineRevText !== null && inClinicRevText !== null
    ? `En línea: ${onlineRevText} · Consultorio: ${inClinicRevText}`
    : undefined;

  const gmvQuality: SignalQuality = !economics || totalGmvVal === null
    ? "UNAVAILABLE"
    : economicsDate.status === "INVALID" || economicsDate.status === "FUTURE"
    ? "ERROR"
    : economics.costsQuality?.stripeFees === "CERTIFIED"
    ? "CERTIFIED"
    : "PROVISIONAL";

  const mrrVal = typeof economics?.mrr === "number"
    ? economics.mrr
    : typeof economics?.totalSubscriptionsRevenue === "number"
    ? economics.totalSubscriptionsRevenue
    : null;
  const displayMrr = mrrVal !== null ? formatCurrency(mrrVal) : null;

  const mrrBreakdown = typeof economics?.activeSubscriptions === "number"
    ? `${economics.activeSubscriptions} suscripciones`
    : undefined;

  const mrrQuality: SignalQuality = !economics || mrrVal === null
    ? "UNAVAILABLE"
    : economicsDate.status === "INVALID" || economicsDate.status === "FUTURE"
    ? "ERROR"
    : economics.costsQuality?.stripeFees === "CERTIFIED"
    ? "CERTIFIED"
    : "PROVISIONAL";

  const mauVal = typeof productMetrics?.mau === "number" ? productMetrics.mau : null;
  const mauBreakdown = typeof productMetrics?.activeProvidersMonth === "number" && typeof productMetrics?.activePatientsMonth === "number"
    ? `${productMetrics.activeProvidersMonth} Médicos / ${productMetrics.activePatientsMonth} Pacientes`
    : undefined;

  const mauQuality: SignalQuality = !productMetrics || mauVal === null
    ? "UNAVAILABLE"
    : productMetricsDate.status === "INVALID" || productMetricsDate.status === "FUTURE"
    ? "ERROR"
    : "PROVISIONAL";

  const appointmentsTodayVal = typeof dashboard?.appointmentsToday === "number" ? dashboard.appointmentsToday : null;
  const appointmentsMonthText = typeof dashboard?.appointmentsThisMonth === "number"
    ? `${dashboard.appointmentsThisMonth} este mes`
    : undefined;

  const appointmentsQuality: SignalQuality = !dashboard || appointmentsTodayVal === null
    ? "UNAVAILABLE"
    : dashboardDate.status === "INVALID" || dashboardDate.status === "FUTURE"
    ? "ERROR"
    : "PROVISIONAL";

  return (
    <div className="space-y-6">
      {/* 🎯 Las Tres Decisiones Esenciales del CEO (PORT-E-01 & HU #43) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hasTelemetry ? "bg-amber-400 animate-pulse" : "bg-slate-500"}`} />
              <h3 className="font-bold text-base sm:text-lg text-white">
                Las Tres Decisiones Esenciales del CEO (PORT-E-01) — Propuestas a Junta
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Propuestas técnicas y operativas bajo diagnóstico preliminar. Requieren ratificación humana de la Junta Directiva antes de cualquier ejecución.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {hasStaleDate && (
              <span className="text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Dato obsoleto (&gt;48h)
              </span>
            )}
            {primaryDate.status === "INVALID" && (
              <span className="text-[11px] font-medium text-rose-300 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Fecha de corte inválida
              </span>
            )}
            {primaryDate.status === "FUTURE" && (
              <span className="text-[11px] font-medium text-rose-300 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Fecha futura no válida
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              Corte: {primaryDate.status === "VALID" || primaryDate.status === "STALE" ? primaryDate.formattedText.replace(/ \(Obsoleto >48h\)/, "") : primaryDate.formattedText}
            </span>
          </div>
        </div>

        {!hasTelemetry && (
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Telemetría no conectada (Estado Vacío / Sin telemetría verificada)</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                No se ha recibido respuesta de los servicios de analítica, clínica o finanzas. Los valores se muestran como «No disponible / No verificado» y las propuestas representan hipótesis preliminares para la Junta Directiva.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta 1: Producto y Activación */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  1. Eje Producto & Activación
                </span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  PROPUESTA A JUNTA
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">
                ¿El producto entrega primer valor sin romperse?
              </h4>
              <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultas completadas:</span>
                  <span className="font-semibold text-white">
                    {typeof dashboard?.completedAppointmentsThisMonth === "number"
                      ? `${dashboard.completedAppointmentsThisMonth} consultas`
                      : "No disponible / No verificado"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {typeof dashboard?.completedAppointmentsThisMonth === "number"
                    ? `Consultas registradas en clúster clínico: ${dashboard.completedAppointmentsThisMonth} (canceladas: ${typeof dashboard.cancelledAppointmentsThisMonth === "number" ? dashboard.cancelledAppointmentsThisMonth : "No verificado"}).`
                    : "Sin datos verificables de citas clínicas ni cohorte en este corte."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Propuesta Técnica:</span>
                  <span className="text-amber-400 font-semibold">Decisión: PENDIENTE</span>
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  👉 Hipótesis / Propuesta: Evaluar la ejecución de un piloto cualitativo cerrado con acompañamiento concierge; condicionado a validación clínica E2E y resolución formal de Junta.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-1 text-[10px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Fuente: PostgreSQL appointments</span>
                  <span className="font-mono text-slate-300">
                    Calidad: {typeof dashboard?.completedAppointmentsThisMonth === "number" ? (dashboardDate.isStale ? "OBSOLETA" : "PROVISIONAL") : "No disponible / No verificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Periodo: {dashboard ? (selectedPeriod || "30d") : "No verificado"}</span>
                  <span>Corte: {dashboardDate.formattedText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Demanda y Monetización */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  2. Eje Demanda & Monetización
                </span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  PROPUESTA A JUNTA
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">
                ¿Hay demanda comprobable y dinero real en caja?
              </h4>
              <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ingreso real en pasarela:</span>
                  <span className="font-semibold text-white">
                    {typeof economics?.totalRevenue === "number"
                      ? formatCurrency(economics.totalRevenue)
                      : "No disponible / No verificado"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {typeof economics?.totalRevenue === "number"
                    ? `Volumen en pasarela: ${formatCurrency(economics.totalRevenue)}. MRR: ${typeof economics.mrr === "number" ? formatCurrency(economics.mrr) : typeof economics.totalSubscriptionsRevenue === "number" ? formatCurrency(economics.totalSubscriptionsRevenue) : "No verificado"}. CAC: No disponible.`
                    : "Sin conciliación bancaria de pasarela ni eventos de pago verificados."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Propuesta Técnica:</span>
                  <span className="text-amber-400 font-semibold">Decisión: PENDIENTE</span>
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  👉 Hipótesis / Propuesta: Mantener $0 en pauta publicitaria; reconstruir embudo y validar disposición de pago directamente antes de definir precios comerciales o contratar pauta.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-1 text-[10px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Fuente: Stripe Balance API</span>
                  <span className="font-mono text-slate-300">
                    Calidad: {typeof economics?.totalRevenue === "number"
                      ? (economics.costsQuality?.stripeFees === "CERTIFIED" ? "AUDITADA" : "PROVISIONAL")
                      : "No disponible / No verificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Periodo: {economics?.period || "No verificado"}</span>
                  <span>Corte: {economicsDate.formattedText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Riesgo Operativo y FinOps */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  3. Eje Riesgo Operativo & FinOps
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  PROPUESTA A JUNTA
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">
                ¿Qué riesgo o costo amenaza la continuidad?
              </h4>
              <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Costo cloud registrado:</span>
                  <span className="font-semibold text-white">
                    {typeof economics?.cloudCosts === "number"
                      ? formatCurrency(economics.cloudCosts)
                      : "No disponible / No verificado"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {typeof economics?.cloudCosts === "number"
                    ? `Costo cloud: ${formatCurrency(economics.cloudCosts)}. Clúster: ${totalServices > 0 ? `${upCount}/${totalServices} UP` : "Sin telemetría"}. Excepciones pasarela: Brecha de telemetría en DTO.`
                    : "Sin telemetría de costos cloud ni métricas de infraestructura verificadas en este DTO."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Propuesta Técnica:</span>
                  <span className="text-amber-400 font-semibold">Decisión: PENDIENTE</span>
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  👉 Hipótesis / Propuesta: Evaluar opciones de optimización de infraestructura y esquema de autenticación de borde; pendiente de medición pasiva de latencia y decisión de junta.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-1 text-[10px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Fuente: GCP Billing API & Cloudflare Metrics</span>
                  <span className="font-mono text-slate-300">
                    Calidad: {typeof economics?.cloudCosts === "number"
                      ? (economics.costsQuality?.cloudCosts || "ESTIMADA")
                      : "No disponible / No verificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Periodo: {economics?.period || "No verificado"}</span>
                  <span>Corte: {economicsDate.formattedText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Top Executive KPIs (ADMIN-TRUST-01: Cero fallbacks a cero falso, linaje fidedigno) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title={`Volumen Clínico (${selectedPeriod.toUpperCase()})`}
          value={displayGmv}
          changePercent={0}
          changePeriod={gmvBreakdown}
          icon={DollarSign}
          variant="emerald"
          quality={gmvQuality}
          source="Stripe Connect API"
          owner="Finanzas"
          asOf={economicsDate.formattedText}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Volumen bruto transaccionado a través de pasarelas de pago y conciliado con Stripe."
        />
        <KpiCard
          title="SaaS MRR (Planes Médicos)"
          value={displayMrr}
          changePercent={0}
          changePeriod={mrrBreakdown}
          icon={Zap}
          variant="blue"
          quality={mrrQuality}
          source="Stripe Billing API"
          owner="Finanzas"
          asOf={economicsDate.formattedText}
          period={economics?.period || selectedPeriod}
          isFilterable={true}
          explanation="Ingresos recurrentes mensuales certificados de suscripciones profesionales activas."
        />
        <KpiCard
          title="Usuarios Activos (MAU)"
          value={mauVal}
          changePercent={0}
          changePeriod={mauBreakdown}
          icon={Users}
          variant="indigo"
          quality={mauQuality}
          source="Telemetry Event Stream"
          owner="Growth / Producto"
          asOf={productMetricsDate.formattedText}
          period={selectedPeriod}
          isFilterable={true}
          explanation="Usuarios únicos (médicos y pacientes) con sesiones activas en el periodo."
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
          explanation="Citas agendadas y atendidas en el día calendario actual en base de datos primaria."
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
                <p className="text-sm font-semibold text-slate-700">Sin datos de velocidad de ingresos para este periodo</p>
                <p className="text-xs text-slate-400">Los datos históricos se sincronizarán con los cortes de facturación de Stripe.</p>
              </div>
            )}
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
                <ShieldCheck className={`w-4 h-4 ${totalServices > 0 && upCount === totalServices ? "text-emerald-600" : totalServices === 0 ? "text-slate-400" : "text-amber-600"}`} />
                Infraestructura
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                totalServices === 0
                  ? "bg-slate-50 text-slate-600 border-slate-200"
                  : upCount === totalServices
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : upCount > 0
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {totalServices > 0 ? `${upCount}/${totalServices} UP` : "Sin telemetría"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {totalServices === 0
                ? "No se pudo consultar el estado del clúster de microservicios."
                : upCount === totalServices
                ? `Todos los microservicios (${totalServices}) respondiendo con latencia promedio de ${avgLatency}ms.`
                : `${upCount} de ${totalServices} microservicios en línea. Latencia promedio: ${avgLatency}ms.`}
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
                {economics?.totalRevenue && economics.totalRevenue > 0 && typeof economics.netProfit === "number"
                  ? `${Math.round((economics.netProfit / economics.totalRevenue) * 100)}%`
                  : "N/D"}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {typeof economics?.netProfit === "number" ? formatCurrency(economics.netProfit) : "No disponible"}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    economics?.totalRevenue && economics.totalRevenue > 0 && typeof economics.netProfit === "number"
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
                        {(!prov.onlineEarned || prov.onlineEarned === 0) && (!prov.inClinicEarned || prov.inClinicEarned === 0) ? (
                          <span className="text-xs text-slate-400">Proveedor Verificado</span>
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
                    <span>{mod.uniqueUsers} médicos activos</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Esperando eventos de telemetría en vivo (0 eventos en los últimos 30 días).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
