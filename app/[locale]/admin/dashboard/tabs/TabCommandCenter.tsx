"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Share2,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Users,
  Stethoscope,
  Server,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  UnitEconomicsDTO,
  AdminDashboardDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
  MicroserviceHealthDTO,
  GrowthOverviewDTO,
} from "@/services/admin.service";
import type { AdminTab } from "../components/AdminSidebar";
import { TabExecutivePulse } from "./TabExecutivePulse";

export interface SocialOverviewSnapshot {
  totalFollowers: number;
  totalEngagement: number;
  connectedChannels: number;
  activePlatforms: string[];
}

interface TabCommandCenterProps {
  growthOverview: GrowthOverviewDTO | null;
  socialSnapshot: SocialOverviewSnapshot | null;
  economics: UnitEconomicsDTO | null;
  dashboard: AdminDashboardDTO | null;
  productMetrics: ProductMetricsDTO | null;
  providers: ProviderAdminDTO[];
  services: MicroserviceHealthDTO[];
  selectedPeriod: string;
  formatCurrency: (val: number) => string;
  onNavigateTab: (tab: AdminTab, subTab?: string) => void;
}

export const TabCommandCenter: React.FC<TabCommandCenterProps> = ({
  growthOverview,
  socialSnapshot,
  economics,
  dashboard,
  productMetrics,
  providers,
  services,
  selectedPeriod,
  formatCurrency,
  onNavigateTab,
}) => {
  const [showDetailedPulse, setShowDetailedPulse] = useState(true);

  const gsc = growthOverview?.searchConsole;
  const ga4 = growthOverview?.ga4;
  const pendingKyc = providers.filter((p) => !p.onboardingComplete || p.status === "INACTIVE").length;
  const unhealthyServices = services.filter((s) => s.status !== "UP").length;

  const topChannel =
    ga4?.channels && ga4.channels.length > 0
      ? [...ga4.channels].sort((a, b) => b.activeUsers - a.activeUsers)[0]
      : null;

  const revenueMonth = economics?.totalRevenue ?? dashboard?.revenueThisMonth ?? 0;

  // Consolidar alertas de negocio + crecimiento en una sola lista priorizada
  const priorityActions = [
    ...(growthOverview?.insights || []).map((i) => ({
      id: i.id,
      severity: i.severity,
      title: i.title,
      description: i.description,
      badge: i.metricBadge || i.category,
      onClick: () =>
        onNavigateTab(
          i.targetTab === "social" ? "social" : "growth",
          i.category === "SEO" ? "seo" : "ga4"
        ),
    })),
    ...(pendingKyc > 0
      ? [
          {
            id: "ops-pending-kyc",
            severity: "MEDIUM",
            title: `${pendingKyc} proveedores pendientes de validación KYC/Onboarding`,
            description:
              "Aprobar especialistas pendientes aumenta la oferta activa en el directorio y las citas disponibles.",
            badge: `${pendingKyc} KYC`,
            onClick: () => onNavigateTab("business", "operations"),
          },
        ]
      : []),
    ...(unhealthyServices > 0
      ? [
          {
            id: "infra-unhealthy",
            severity: "HIGH",
            title: `${unhealthyServices} microservicios con alerta de salud`,
            description:
              "Revisa el estado de Cloud Run y los logs de auditoría en Plataforma & Conectores.",
            badge: `${unhealthyServices} Fallo`,
            onClick: () => onNavigateTab("health"),
          },
        ]
      : []),
  ];

  // Embudo unificado: Tráfico → Interacción → Operación → Ingresos
  const funnelSteps = [
    {
      label: "Impresiones Google",
      value: gsc?.totals?.impressions ?? 0,
      sub: `Pos. #${(gsc?.totals?.avgPosition ?? 0).toFixed(1)}`,
      color: "bg-indigo-600",
    },
    {
      label: "Clics Orgánicos",
      value: gsc?.totals?.clicks ?? 0,
      sub: `CTR ${(gsc?.totals?.ctr ?? 0).toFixed(2)}%`,
      color: "bg-sky-600",
    },
    {
      label: "Usuarios Web (GA4)",
      value: ga4?.totals?.activeUsers ?? 0,
      sub: `${ga4?.totals?.sessions ?? 0} sesiones`,
      color: "bg-emerald-600",
    },
    {
      label: "Sesiones con Interacción",
      value: ga4?.totals?.engagedSessions ?? 0,
      sub: `${(ga4?.totals?.engagementRate ?? 0).toFixed(0)}% engagement`,
      color: "bg-teal-600",
    },
    {
      label: "Citas del Mes",
      value: dashboard?.appointmentsThisMonth ?? 0,
      sub: `${dashboard?.activeProvidersThisMonth ?? 0} doctores activos`,
      color: "bg-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🎯 NORTH STAR — 4 PILARES CONECTADOS EN VIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. SEO / Search Console */}
        <button
          type="button"
          onClick={() => onNavigateTab("growth", "seo")}
          className="text-left bg-white hover:border-emerald-300 rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Search className="w-3.5 h-3.5" /> SEO · Search Console
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {(gsc?.totals?.clicks ?? 0).toLocaleString("es-MX")}{" "}
            <span className="text-xs font-semibold text-slate-400">clics</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <strong>{(gsc?.totals?.impressions ?? 0).toLocaleString("es-MX")}</strong> impr · CTR{" "}
            <strong>{(gsc?.totals?.ctr ?? 0).toFixed(2)}%</strong> · Pos{" "}
            <strong>#{(gsc?.totals?.avgPosition ?? 0).toFixed(1)}</strong>
          </p>
        </button>

        {/* 2. GA4 Traffic & Acquisition */}
        <button
          type="button"
          onClick={() => onNavigateTab("growth", "ga4")}
          className="text-left bg-white hover:border-indigo-300 rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <Globe className="w-3.5 h-3.5" /> Tráfico · GA4
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {(ga4?.totals?.activeUsers ?? 0).toLocaleString("es-MX")}{" "}
            <span className="text-xs font-semibold text-slate-400">usuarios</span>
          </p>
          <p className="text-xs text-slate-600 mt-1 truncate">
            <strong>{(ga4?.totals?.sessions ?? 0).toLocaleString("es-MX")}</strong> sesiones · Top:{" "}
            <strong>{topChannel?.channel || "Sin datos"}</strong>
          </p>
        </button>

        {/* 3. Social Media & Meta */}
        <button
          type="button"
          onClick={() => onNavigateTab("social", "channels")}
          className="text-left bg-white hover:border-sky-300 rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
              <Share2 className="w-3.5 h-3.5" /> Redes & Meta
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {(socialSnapshot?.totalFollowers ?? 0).toLocaleString("es-MX")}{" "}
            <span className="text-xs font-semibold text-slate-400">seguidores</span>
          </p>
          <p className="text-xs text-slate-600 mt-1 truncate">
            <strong>{socialSnapshot?.connectedChannels ?? 0}</strong> canales activos ·{" "}
            <strong>{(socialSnapshot?.totalEngagement ?? 0).toLocaleString("es-MX")}</strong> interacciones
          </p>
        </button>

        {/* 4. Business & Revenue */}
        <button
          type="button"
          onClick={() => onNavigateTab("business", "finances")}
          className="text-left bg-white hover:border-amber-300 rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <DollarSign className="w-3.5 h-3.5" /> Negocio & Ingresos
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(revenueMonth)}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <strong>{dashboard?.appointmentsThisMonth ?? 0}</strong> citas ·{" "}
            <strong>{economics?.activeSubscriptions ?? 0}</strong> suscripciones
          </p>
        </button>
      </div>

      {/* 🔁 EMBUDO UNIFICADO DE ADQUISICIÓN → CONVERSIÓN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Embudo de Crecimiento QuHealthy (Tráfico → Operación)
            </h2>
            <p className="text-xs text-slate-500">
              Visión punta a punta conectando Search Console, GA4 y actividad real de plataforma.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              {economics?.totalUsers ?? 0} usuarios totales
            </span>
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              {providers.length} proveedores
            </span>
            <span className="inline-flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              {services.filter((s) => s.status === "UP").length}/{services.length} UP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {funnelSteps.map((step, i) => (
            <div
              key={step.label}
              className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 relative overflow-hidden"
            >
              <div className={`h-1 w-full absolute top-0 left-0 ${step.color}`} />
              <p className="text-[11px] font-semibold text-slate-500">
                {i + 1}. {step.label}
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {step.value.toLocaleString("es-MX")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{step.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 DECISIONES Y ACCIONES PRIORITARIAS PARA DUEÑOS DE PRODUCTO */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Decisiones & Acciones Recomendadas Hoy
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {priorityActions.length} señales activas
          </span>
        </div>

        {priorityActions.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-xl p-3.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Todos los indicadores clave están estables. Revisa Adquisición & SEO para nuevas oportunidades.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className={`text-left rounded-xl border p-4 transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between gap-2 ${
                  action.severity === "HIGH"
                    ? "bg-rose-50/50 border-rose-200/80 hover:border-rose-300"
                    : action.severity === "MEDIUM"
                      ? "bg-amber-50/50 border-amber-200/80 hover:border-amber-300"
                      : "bg-slate-50/70 border-slate-200/80 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {action.severity === "HIGH" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <h3 className="text-xs font-bold text-slate-900">{action.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0">
                    {action.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📊 PULSO EJECUTIVO OPERATIVO DETALLADO (colapsable) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowDetailedPulse((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span>Pulso Operativo y Financiero Detallado</span>
          {showDetailedPulse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetailedPulse && (
          <TabExecutivePulse
            economics={economics}
            dashboard={dashboard}
            productMetrics={productMetrics}
            providers={providers}
            services={services}
            selectedPeriod={selectedPeriod}
            formatCurrency={formatCurrency}
            onNavigateTab={(legacyTab) => {
              if (legacyTab === "finances" || legacyTab === "economics" || legacyTab === "operations" || legacyTab === "foundations") {
                onNavigateTab("business", legacyTab);
              } else if (legacyTab === "crm" || legacyTab === "channels") {
                onNavigateTab("social", legacyTab);
              } else if (legacyTab === "analytics") {
                onNavigateTab("growth", "product");
              } else if (legacyTab === "health") {
                onNavigateTab("health");
              } else {
                onNavigateTab("pulse");
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
