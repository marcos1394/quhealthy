"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Sparkles,
  TrendingUp,
  Building2,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";
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

type AristaCategory = "ALL" | "CLINICAL_AI" | "GROWTH_COMMERCIAL" | "INFRA_GOVERNANCE";

export const StartupAristasRadar: React.FC<StartupAristasRadarProps> = ({
  economics,
  dashboard,
  productMetrics,
  providers,
  services = [],
  formatCurrency,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AristaCategory>("ALL");

  const upCount = services.filter((s) => s.status === "UP").length;
  const totalServices = services.length;
  const pendingKycCount = providers.filter(
    (p) => !p.onboardingComplete || p.status === "INACTIVE"
  ).length;
  const activeProvidersCount = providers.filter(
    (p) => p.onboardingComplete && p.status === "ACTIVE"
  ).length;

  const aristas = [
    {
      id: "product",
      category: "CLINICAL_AI" as AristaCategory,
      code: "product-engineering",
      title: "1. Producto & Clínica E2E",
      subtitle: "Citas, Expediente NOM-004, Telemedicina & Mobile iOS",
      statusBadge: "H1–H3 EN VIVO",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Stethoscope,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      primaryMetricLabel: "Consultas mes / Citas hoy",
      primaryMetricValue:
        typeof dashboard?.completedAppointmentsThisMonth === "number"
          ? `${dashboard.completedAppointmentsThisMonth} completadas · ${dashboard.appointmentsToday ?? 0} hoy`
          : "Sin corte clínico activo",
      deliverables: [
        "Compuerta Consentimiento Informado NOM-004 (HU-EHR-024)",
        "Receta Electrónica PDF + QR & Google Calendar 2-Way Sync",
        "Universal Links iOS (AASA) + API Push (/api/notifications/devices)",
      ],
      targetTab: "operations" as AdminTab,
      ctaLabel: "Abrir Operaciones Médicas",
    },
    {
      id: "ai",
      category: "CLINICAL_AI" as AristaCategory,
      code: "data-ai-copilot",
      title: "2. Copiloto IA & Pulso Longitudinal",
      subtitle: "Vertex AI Asistivo, Farmacovigilancia & Seguimiento",
      statusBadge: "GUARDIA NOM-024",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Sparkles,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      primaryMetricLabel: "Seguridad Clínica IA",
      primaryMetricValue: "0 diagnósticos autónomos · Edición médica obligatoria",
      deliverables: [
        "Borrador SOAP Pre-Consulta con aprobación explícita del médico",
        "Verificador de Interacciones Farmacológicas y Alergias Cruzadas",
        "Plan de Cuidados Longitudinal 7/30/90/180d & HealthScore 360°",
      ],
      targetTab: "analytics" as AdminTab,
      ctaLabel: "Ver Adopción de Módulos IA",
    },
    {
      id: "growth",
      category: "GROWTH_COMMERCIAL" as AristaCategory,
      code: "growth-marketing",
      title: "3. Growth, SEO & Conversión",
      subtitle: "SEO Programático, E-E-A-T, Atribución & CRM Preventivo",
      statusBadge: "60 RUTAS SEO",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
      icon: TrendingUp,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      primaryMetricLabel: "Tráfico & Usuarios Activos (MAU)",
      primaryMetricValue:
        typeof productMetrics?.mau === "number"
          ? `${productMetrics.mau.toLocaleString()} MAU (${productMetrics.activeProvidersMonth ?? 0} médicos)`
          : "60 páginas Especialidad × Ciudad indexadas",
      deliverables: [
        "60 Landings Especialidad × Ciudad en sitemap.xml con JSON-LD",
        "Sello Médico Verificado E-E-A-T (Cédula SEP) & Guardia Anti-PII GA4",
        "Atribución First-Party (UTM/GCLID) & Reactivación Preventiva LFPDPPP",
      ],
      targetTab: "channels" as AdminTab,
      ctaLabel: "Ver Canales & Atribución CMO",
    },
    {
      id: "commercial",
      category: "GROWTH_COMMERCIAL" as AristaCategory,
      code: "commercial-operations",
      title: "4. Comercial, Clínicas & KYB",
      subtitle: "Pipeline Cédulas DGP, Clínicas Multi-Sede & Fundaciones",
      statusBadge: pendingKycCount > 0 ? `${pendingKycCount} KYC PENDIENTES` : "KYB AL DÍA",
      badgeStyle:
        pendingKycCount > 0
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Building2,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      primaryMetricLabel: "Red Médica & Clínicas",
      primaryMetricValue: `${activeProvidersCount} activos · ${providers.length} registrados`,
      deliverables: [
        "Roles Enterprise en Clínicas (CLINIC_ADMIN, RECEPTIONIST, PHYSICIAN)",
        "Asignación Multi-Sede (branch) & Playbook B2B2C / Laboratorios",
        "Flujo de Subsidio e Impacto Social en Fundaciones (/foundation)",
      ],
      targetTab: "crm" as AdminTab,
      ctaLabel: "Gestionar CRM & Pipeline KYB",
    },
    {
      id: "sre",
      category: "INFRA_GOVERNANCE" as AristaCategory,
      code: "devsecops-sre",
      title: "5. DevSecOps, SRE & FinOps",
      subtitle: "Cloud Run, Perímetro Zero-Trust, Cabeceras OWASP & Costos",
      statusBadge:
        totalServices > 0 ? `${upCount}/${totalServices} MICROSERVICIOS UP` : "PERÍMETRO ACTIVO",
      badgeStyle:
        totalServices > 0 && upCount === totalServices
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-700 border-slate-200",
      icon: ShieldCheck,
      iconBg: "bg-teal-50 text-teal-600 border-teal-100",
      primaryMetricLabel: "Gasto Cloud GCP & Resiliencia",
      primaryMetricValue:
        typeof economics?.cloudCosts === "number"
          ? `${formatCurrency(economics.cloudCosts)} GCP · Staging/Prod aislados`
          : "Perímetro Cloudflare + OWASP Headers activos",
      deliverables: [
        "Filtro Zero-Trust X-CF-Origin-Verify & Permissions-Policy cámara/mic",
        "Aislamiento estricto Staging (staging.quhealthy.org) vs Producción",
        "FinOps: Caché Redis (@Cacheable) + Lifecycle de blobs en GCS",
      ],
      targetTab: "health" as AdminTab,
      ctaLabel: "Inspeccionar Salud & Servidores",
    },
    {
      id: "governance",
      category: "INFRA_GOVERNANCE" as AristaCategory,
      code: "founder-cos-gov",
      title: "6. Finanzas, Legal & Gobierno",
      subtitle: "Unit Economics, Stripe, COFEPRIS / NOM-024 & Seed Room",
      statusBadge: "DATA ROOM SEED",
      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Landmark,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      primaryMetricLabel: "Recaudo Stripe & Suscripciones",
      primaryMetricValue:
        typeof economics?.totalRevenue === "number"
          ? `${formatCurrency(economics.totalRevenue)} (${economics.activeSubscriptions ?? 0} suscripciones)`
          : "Señales financieras con linaje veraz (ADMIN-TRUST-01)",
      deliverables: [
        "Auditoría COFEPRIS Telemedicina, NOM-004, NOM-024 y Derechos ARCO",
        "Separación estricta GMV Clínico vs Recaudo Conciliado Stripe",
        "Data Room Seed & Gobernanza de Cohortes (Horizontes 1–3 completados)",
      ],
      targetTab: "finances" as AdminTab,
      ctaLabel: "Abrir Finanzas & Unit Economics",
    },
  ];

  const filteredAristas =
    selectedCategory === "ALL"
      ? aristas
      : aristas.filter((a) => a.category === selectedCategory);

  return (
    <section
      data-testid="startup-aristas-radar"
      aria-label="Radar Ejecutivo de las 6 Aristas de la Startup"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Cabecera limpia con filtros por dimensión */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-medical-700 bg-medical-50 border border-medical-200/70 px-2.5 py-0.5 rounded-full">
              <Layers className="w-3.5 h-3.5" />
              Sistema Operativo Agéntico Lean v2
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Sprints 1–3 en Producción
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Mapa Ejecutivo por Arista de la Startup (6 Escuadrones)
          </h2>
          <p className="text-xs text-slate-500">
            Visibilidad consolidada del progreso técnico, clínico, comercial, regulatorio y financiero conectado a cada módulo administrativo.
          </p>
        </div>

        {/* Filtros rápidos para evitar saturación visual */}
        <div
          role="group"
          aria-label="Filtrar aristas de la startup"
          className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start lg:self-auto"
        >
          {[
            { id: "ALL" as AristaCategory, label: "Todas (6)" },
            { id: "CLINICAL_AI" as AristaCategory, label: "Clínica & IA" },
            { id: "GROWTH_COMMERCIAL" as AristaCategory, label: "Growth & Comercial" },
            { id: "INFRA_GOVERNANCE" as AristaCategory, label: "SRE & Finanzas" },
          ].map((filter) => {
            const active = selectedCategory === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedCategory(filter.id)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de las 6 Aristas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAristas.map((arista) => {
          const Icon = arista.icon;
          return (
            <div
              key={arista.id}
              data-testid={`arista-card-${arista.id}`}
              className="group rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300/90 hover:shadow-sm transition-all p-4 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top row: Icon + Title + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${arista.iconBg}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {arista.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {arista.subtitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${arista.badgeStyle}`}
                  >
                    {arista.statusBadge}
                  </span>
                </div>

                {/* Live Metric Pill */}
                <div className="bg-white rounded-xl border border-slate-200/70 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {arista.primaryMetricLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-800 text-right">
                    {arista.primaryMetricValue}
                  </span>
                </div>

                {/* Shipped Capabilities Checklist */}
                <ul className="space-y-1.5 pt-0.5">
                  {arista.deliverables.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 leading-snug"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Navigation Action */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  @{arista.code}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab(arista.targetTab)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-medical-600 hover:text-medical-700 transition-colors"
                >
                  {arista.ctaLabel}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
