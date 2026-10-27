"use client";

import React from "react";
import {
  Stethoscope,
  TrendingUp,
  DollarSign,
  Users,
  Server,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  UnitEconomicsDTO,
  AdminDashboardDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
  MicroserviceHealthDTO,
} from "@/services/admin.service";

interface StartupAristasRadarProps {
  economics: UnitEconomicsDTO | null;
  dashboard: AdminDashboardDTO | null;
  productMetrics: ProductMetricsDTO | null;
  providers: ProviderAdminDTO[];
  services?: MicroserviceHealthDTO[];
  formatCurrency: (val: number) => string;
  onNavigateTab: (tab: any) => void;
}

interface AristaMetric {
  label: string;
  value: string;
}

interface AristaConfig {
  id: string;
  title: string;
  subtitle: string;
  tabTarget: string;
  icon: React.ElementType;
  status: "HEALTHY" | "ATTENTION" | "DEGRADED";
  statusLabel: string;
  primaryMetrics: AristaMetric[];
}

export function StartupAristasRadar({
  economics,
  dashboard,
  productMetrics,
  providers,
  services = [],
  formatCurrency,
  onNavigateTab,
}: StartupAristasRadarProps) {
  const upServices = services.filter((s) => s.status === "UP");
  const totalServicesCount = services.length;
  const infraRatio = totalServicesCount > 0 ? upServices.length / totalServicesCount : 0;

  const latencies = upServices
    .map((s) => s.latencyMs)
    .filter((l): l is number => typeof l === "number" && l > 0);
  const avgLatency =
    latencies.length > 0
      ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)} ms`
      : "No disponible";

  const activeProvidersCount = dashboard?.activeProvidersThisMonth ?? 0;
  const onboardedProvidersCount = providers.filter(
    (p) => p.onboardingComplete && p.status === "ACTIVE"
  ).length;

  const totalAppointmentsMonth = dashboard?.appointmentsThisMonth ?? 0;
  const completedAppointmentsMonth = dashboard?.completedAppointmentsThisMonth ?? 0;

  const aristas: AristaConfig[] = [
    {
      id: "producto-clinico",
      title: "1. Producto & Operación Clínica",
      subtitle: "Consultas, agenda y actividad médica en PostgreSQL",
      tabTarget: "operations",
      icon: Stethoscope,
      status: totalAppointmentsMonth > 0 ? "HEALTHY" : "ATTENTION",
      statusLabel: totalAppointmentsMonth > 0 ? "Flujo Activo" : "Sin Citas Mes",
      primaryMetrics: [
        {
          label: "Citas del Mes",
          value: dashboard ? String(totalAppointmentsMonth) : "No disponible",
        },
        {
          label: "Citas Completadas",
          value: dashboard ? String(completedAppointmentsMonth) : "No disponible",
        },
        {
          label: "Citas Hoy",
          value: dashboard ? String(dashboard.appointmentsToday) : "No disponible",
        },
      ],
    },
    {
      id: "adquisicion-growth",
      title: "2. Tráfico & Telemetría de Producto",
      subtitle: "Sesiones activas y retención en tiempo real",
      tabTarget: "analytics",
      icon: TrendingUp,
      status: (productMetrics?.mau ?? 0) > 0 ? "HEALTHY" : "ATTENTION",
      statusLabel: (productMetrics?.mau ?? 0) > 0 ? "Telemetría Activa" : "Esperando Tráfico",
      primaryMetrics: [
        {
          label: "MAU (30d)",
          value: productMetrics ? String(productMetrics.mau) : "No disponible",
        },
        {
          label: "Sesiones (30d)",
          value: productMetrics ? String(productMetrics.totalSessionsMonth) : "No disponible",
        },
        {
          label: "Stickiness (DAU/MAU)",
          value: productMetrics ? `${productMetrics.stickinessRatio}%` : "No disponible",
        },
      ],
    },
    {
      id: "monetizacion-finanzas",
      title: "3. Monetización & Finanzas (Stripe)",
      subtitle: "Ingresos procesados, MRR y margen post-Stripe",
      tabTarget: "finances",
      icon: DollarSign,
      status: economics ? "HEALTHY" : "ATTENTION",
      statusLabel: economics ? "Stripe Conectado" : "Sin Señal Stripe",
      primaryMetrics: [
        {
          label: "Revenue Neto Stripe",
          value:
            economics && typeof economics.totalRevenue === "number"
              ? formatCurrency(economics.totalRevenue)
              : "No disponible",
        },
        {
          label: "MRR Suscripciones",
          value:
            economics && typeof economics.mrr === "number"
              ? formatCurrency(economics.mrr)
              : "No disponible",
        },
        {
          label: "Margen Bruto (Post-Stripe)",
          value:
            economics && typeof economics.grossMargin === "number"
              ? formatCurrency(economics.grossMargin)
              : "No disponible",
        },
      ],
    },
    {
      id: "operacion-medica-red",
      title: "4. Red de Especialistas & Onboarding",
      subtitle: "Médicos registrados y estado KYC en PostgreSQL",
      tabTarget: "operations",
      icon: Users,
      status: activeProvidersCount > 0 || providers.length > 0 ? "HEALTHY" : "ATTENTION",
      statusLabel: `${providers.length} en Padrón`,
      primaryMetrics: [
        {
          label: "Médicos con Citas (Mes)",
          value: dashboard ? String(activeProvidersCount) : "No disponible",
        },
        {
          label: "Nuevos Médicos (Mes)",
          value: dashboard ? String(dashboard.newProvidersThisMonth) : "No disponible",
        },
        {
          label: "KYC Completado",
          value: `${onboardedProvidersCount} / ${providers.length}`,
        },
      ],
    },
    {
      id: "infraestructura-sre",
      title: "5. Infraestructura Cloud Run",
      subtitle: "Disponibilidad HTTP en vivo y latencia de microservicios",
      tabTarget: "health",
      icon: Server,
      status: infraRatio >= 0.85 ? "HEALTHY" : infraRatio >= 0.5 ? "ATTENTION" : "DEGRADED",
      statusLabel:
        totalServicesCount > 0
          ? `${upServices.length}/${totalServicesCount} UP`
          : "Sondeando...",
      primaryMetrics: [
        {
          label: "Servicios Cloud Run UP",
          value:
            totalServicesCount > 0
              ? `${upServices.length} de ${totalServicesCount}`
              : "No disponible",
        },
        {
          label: "Latencia Promedio",
          value: avgLatency,
        },
        {
          label: "Usuarios Totales BD",
          value: economics ? String(economics.totalUsers) : "No disponible",
        },
      ],
    },
    {
      id: "cumplimiento-gobernanza",
      title: "6. Eficiencia & Calidad Operativa",
      subtitle: "Indicadores reales de asistencia, cancelación y ausentismo",
      tabTarget: "foundations",
      icon: ShieldCheck,
      status: "HEALTHY",
      statusLabel: "BD Conectada",
      primaryMetrics: [
        {
          label: "Ausentismo (No-Show Mes)",
          value: dashboard ? String(dashboard.noShowAppointmentsThisMonth) : "No disponible",
        },
        {
          label: "Cancelaciones del Mes",
          value: dashboard ? String(dashboard.cancelledAppointmentsThisMonth) : "No disponible",
        },
        {
          label: "Volumen Clínico (GMV)",
          value:
            economics && typeof economics.totalGmv === "number"
              ? formatCurrency(economics.totalGmv)
              : "No disponible",
        },
      ],
    },
  ];

  const getStatusBadgeStyle = (status: AristaConfig["status"]) => {
    switch (status) {
      case "HEALTHY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ATTENTION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DEGRADED":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <section
      data-testid="startup-aristas-radar"
      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              6 Aristas Conectadas
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Radar Operativo en Tiempo Real
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métricas alimentadas directamente desde PostgreSQL, Stripe API, Telemetría Interna y sondas HTTP Cloud Run.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {aristas.map((arista) => {
          const Icon = arista.icon;
          return (
            <div
              key={arista.id}
              data-testid={`arista-card-${arista.id}`}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 hover:border-indigo-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/70 text-indigo-600 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {arista.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {arista.subtitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusBadgeStyle(
                      arista.status
                    )}`}
                  >
                    {arista.statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {arista.primaryMetrics.map((m, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200/60 rounded-lg p-2"
                    >
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {m.label}
                      </p>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onNavigateTab(arista.tabTarget)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  Abrir vista detallada
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
