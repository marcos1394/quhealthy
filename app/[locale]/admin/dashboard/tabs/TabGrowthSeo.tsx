"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  Eye,
  Target,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Users,
  Activity,
  Clock,
  MapPin,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type {
  GrowthOverviewDTO,
  ProductMetricsDTO,
} from "@/services/admin.service";
import { TabProductAnalytics } from "./TabProductAnalytics";

export type GrowthSubTab = "seo" | "ga4" | "product";

interface TabGrowthSeoProps {
  growthOverview: GrowthOverviewDTO | null;
  productMetrics: ProductMetricsDTO | null;
  isLoadingGrowth: boolean;
  growthDays: number;
  onChangeGrowthDays: (days: number) => void;
  onForceRefreshGrowth: () => void;
  initialSubTab?: GrowthSubTab;
}

const EVENT_LABELS: Record<string, { label: string; stage: string; color: string }> = {
  view_item: { label: "Vistas de Producto/Servicio", stage: "Descubrimiento", color: "bg-sky-500" },
  view_provider_profile: { label: "Perfiles de Especialista", stage: "Descubrimiento", color: "bg-indigo-500" },
  view_business_landing: { label: "Landing B2B Médicos", stage: "Descubrimiento", color: "bg-violet-500" },
  add_to_cart: { label: "Agregados al Carrito", stage: "Intención", color: "bg-amber-500" },
  booking_initiated: { label: "Reservas Iniciadas", stage: "Intención", color: "bg-amber-600" },
  begin_checkout: { label: "Checkouts Iniciados", stage: "Checkout", color: "bg-orange-500" },
  add_payment_info: { label: "Redirección a Pago", stage: "Checkout", color: "bg-rose-500" },
  form_start: { label: "Formularios Iniciados", stage: "Fricción", color: "bg-slate-400" },
  form_submit: { label: "Formularios Enviados", stage: "Fricción", color: "bg-slate-700" },
  sign_up: { label: "Registros Completados", stage: "Conversión", color: "bg-emerald-500" },
  signup_provider_complete: { label: "Médicos Registrados", stage: "Conversión", color: "bg-emerald-600" },
  booking_confirmed: { label: "Citas Confirmadas", stage: "Conversión", color: "bg-teal-600" },
  purchase: { label: "Compras Completadas", stage: "Ingresos", color: "bg-emerald-700" },
  referral_invite_sent: { label: "Invitaciones de Referido", stage: "Viralidad", color: "bg-pink-500" },
};

const DeltaBadge: React.FC<{ value?: number | null; suffix?: string; invertGood?: boolean }> = ({
  value,
  suffix = "%",
  invertGood = false,
}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const isPositive = invertGood ? value < 0 : value > 0;
  const isNeutral = value === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
        isNeutral
          ? "bg-slate-100 text-slate-600"
          : isPositive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
      }`}
    >
      {!isNeutral &&
        (value > 0 ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        ))}
      {value > 0 ? `+${value}` : value}
      {suffix}
    </span>
  );
};

const formatDuration = (sec?: number) => {
  if (!sec || sec <= 0) return "0s";
  const mins = Math.floor(sec / 60);
  const rem = Math.round(sec % 60);
  return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
};

const shortenUrl = (fullUrl: string) => {
  try {
    const parsed = new URL(fullUrl);
    return parsed.pathname || "/";
  } catch {
    return fullUrl;
  }
};

export const TabGrowthSeo: React.FC<TabGrowthSeoProps> = ({
  growthOverview,
  productMetrics,
  isLoadingGrowth,
  growthDays,
  onChangeGrowthDays,
  onForceRefreshGrowth,
  initialSubTab = "seo",
}) => {
  const [subTab, setSubTab] = useState<GrowthSubTab>(initialSubTab);
  const [querySearch, setQuerySearch] = useState("");

  const gsc = growthOverview?.searchConsole;
  const ga4 = growthOverview?.ga4;

  const filteredQueries = (gsc?.topQueries || []).filter((q) =>
    querySearch.trim()
      ? q.query.toLowerCase().includes(querySearch.trim().toLowerCase())
      : true
  );

  const maxChannelSessions = Math.max(
    1,
    ...(ga4?.channels || []).map((c) => c.sessions)
  );
  const maxEventCount = Math.max(
    1,
    ...(ga4?.keyEvents || []).map((e) => e.count)
  );

  return (
    <div className="space-y-6">
      {/* Header + Sub-tabs + Period Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">
              Adquisición, SEO & Embudo de Tráfico
            </h2>
            {gsc?.connected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <CheckCircle2 className="w-3 h-3" /> Search Console
              </span>
            )}
            {ga4?.connected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                <CheckCircle2 className="w-3 h-3" /> GA4 ({ga4.propertyId})
              </span>
            )}
            {growthOverview?.cached && (
              <span className="text-[11px] font-medium text-slate-400">
                · Caché Redis (3h)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métricas reales de Google Search Console, Google Analytics 4 y telemetría interna para priorizar acciones de tráfico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rango de días GSC/GA4 */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold">
            {[7, 28, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChangeGrowthDays(d)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  growthDays === d
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onForceRefreshGrowth}
            disabled={isLoadingGrowth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGrowth ? "animate-spin" : ""}`} />
            Sincronizar en vivo
          </button>
        </div>
      </div>

      {/* Sub-navigation pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { id: "seo" as const, label: "SEO & Search Console", icon: Search, badge: gsc?.quickWinQueries?.length ? `${gsc.quickWinQueries.length} Quick Wins` : undefined },
          { id: "ga4" as const, label: "Tráfico & Embudo GA4", icon: Globe, badge: ga4?.totals ? `${ga4.totals.activeUsers} usuarios` : undefined },
          { id: "product" as const, label: "Uso de Producto (Interno)", icon: BarChart3 },
        ]).map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                active
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {isLoadingGrowth && !growthOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 1: GOOGLE SEARCH CONSOLE (SEO)                            */}
      {/* ================================================================= */}
      {subTab === "seo" && (
        <div className="space-y-6">
          {gsc && !gsc.connected ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Google Search Console no conectado en este momento
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  {gsc.error || "Verifica que sa-analytics tenga acceso a sc-domain:quhealthy.org."}
                </p>
              </div>
            </div>
          ) : (
            gsc && (
              <>
                {/* 4 KPI Cards GSC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Clics Orgánicos</span>
                      <MousePointerClick className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(gsc.totals?.clicks ?? 0).toLocaleString("es-MX")}
                      </p>
                      <DeltaBadge value={gsc.clicksDeltaPct} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Previo: {(gsc.previousTotals?.clicks ?? 0).toLocaleString("es-MX")} clics
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Impresiones en Google</span>
                      <Eye className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(gsc.totals?.impressions ?? 0).toLocaleString("es-MX")}
                      </p>
                      <DeltaBadge value={gsc.impressionsDeltaPct} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Previo: {(gsc.previousTotals?.impressions ?? 0).toLocaleString("es-MX")} impr.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">CTR Promedio</span>
                      <Target className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(gsc.totals?.ctr ?? 0).toFixed(2)}%
                      </p>
                      <DeltaBadge value={gsc.ctrDeltaPct} suffix=" pts" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Meta saludable en ecommerce médico: 3.5%–5%
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Posición Media</span>
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        #{(gsc.totals?.avgPosition ?? 0).toFixed(1)}
                      </p>
                      <DeltaBadge value={gsc.positionDelta} suffix=" pos" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Previo: #{(gsc.previousTotals?.avgPosition ?? 0).toFixed(1)} (positivo = subiste)
                    </p>
                  </div>
                </div>

                {/* Daily Trend Chart */}
                {gsc.dailyTrend && gsc.dailyTrend.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Tendencia Diaria de Impresiones y Clics ({growthDays} días)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Monitorea el impacto de los Rich Snippets y el sitemap limpio en Google.
                        </p>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gsc.dailyTrend}>
                          <defs>
                            <linearGradient id="gscImpr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gscClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickFormatter={(v) => String(v).slice(5)}
                          />
                          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#10b981" }} />
                          <Tooltip />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="impressions"
                            name="Impresiones"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#gscImpr)"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="clicks"
                            name="Clics"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#gscClicks)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 🎯 SEO Quick Wins */}
                {gsc.quickWinQueries && gsc.quickWinQueries.length > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/40 rounded-2xl border border-emerald-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-600 text-white">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Quick Wins SEO — Oportunidades de Crecimiento Rápido
                          </h3>
                          <p className="text-xs text-slate-600">
                            Búsquedas donde ya apareces en posición 4–20 con CTR bajo: prioriza estos títulos, precios y enlaces internos.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-emerald-200/70 text-slate-500">
                            <th className="py-2 pr-3 font-semibold">Búsqueda (Query)</th>
                            <th className="py-2 px-2 text-right font-semibold">Impr.</th>
                            <th className="py-2 px-2 text-right font-semibold">Clics</th>
                            <th className="py-2 px-2 text-right font-semibold">CTR</th>
                            <th className="py-2 px-2 text-right font-semibold">Pos.</th>
                            <th className="py-2 px-2 text-right font-semibold">Potencial</th>
                            <th className="py-2 pl-3 font-semibold">Acción recomendada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {gsc.quickWinQueries.map((w) => (
                            <tr key={w.query} className="hover:bg-white/80">
                              <td className="py-2.5 pr-3 font-bold text-slate-900">{w.query}</td>
                              <td className="py-2.5 px-2 text-right font-mono">{w.impressions}</td>
                              <td className="py-2.5 px-2 text-right font-mono">{w.clicks}</td>
                              <td className="py-2.5 px-2 text-right font-mono text-amber-700 font-semibold">
                                {w.ctr.toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono">#{w.position.toFixed(1)}</td>
                              <td className="py-2.5 px-2 text-right">
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  +{w.estimatedExtraClicks} clics
                                </span>
                              </td>
                              <td className="py-2.5 pl-3 text-slate-600">{w.recommendation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Queries & Top Pages */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900">Top Búsquedas</h3>
                      <input
                        type="search"
                        value={querySearch}
                        onChange={(e) => setQuerySearch(e.target.value)}
                        placeholder="Filtrar búsqueda..."
                        aria-label="Filtrar búsquedas de Search Console"
                        className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-white border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="py-2 pr-2 font-semibold">Query</th>
                            <th className="py-2 px-2 text-right font-semibold">Clics</th>
                            <th className="py-2 px-2 text-right font-semibold">Impr.</th>
                            <th className="py-2 px-2 text-right font-semibold">CTR</th>
                            <th className="py-2 pl-2 text-right font-semibold">Pos.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredQueries.map((q) => (
                            <tr key={q.query} className="hover:bg-slate-50">
                              <td className="py-2 pr-2 font-medium text-slate-800">{q.query}</td>
                              <td className="py-2 px-2 text-right font-bold text-emerald-700">{q.clicks}</td>
                              <td className="py-2 px-2 text-right text-slate-600">{q.impressions}</td>
                              <td className="py-2 px-2 text-right text-slate-600">{q.ctr.toFixed(1)}%</td>
                              <td className="py-2 pl-2 text-right font-mono text-slate-500">
                                {q.position.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Top Páginas en Google</h3>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-white border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="py-2 pr-2 font-semibold">URL</th>
                            <th className="py-2 px-2 text-right font-semibold">Clics</th>
                            <th className="py-2 px-2 text-right font-semibold">Impr.</th>
                            <th className="py-2 pl-2 text-right font-semibold">Pos.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(gsc.topPages || []).map((p) => (
                            <tr key={p.page} className="hover:bg-slate-50">
                              <td className="py-2 pr-2 max-w-[260px] truncate">
                                <a
                                  href={p.page}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-700 hover:underline font-medium"
                                  title={p.page}
                                >
                                  <span className="truncate">{shortenUrl(p.page)}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                                </a>
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-emerald-700">{p.clicks}</td>
                              <td className="py-2 px-2 text-right text-slate-600">{p.impressions}</td>
                              <td className="py-2 pl-2 text-right font-mono text-slate-500">
                                {p.position.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Devices, Countries & Sitemaps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Dispositivos (Mobile vs Desktop)
                    </h3>
                    <div className="space-y-3">
                      {(gsc.devices || []).map((d) => {
                        const DevIcon =
                          d.key === "MOBILE" ? Smartphone : d.key === "TABLET" ? Tablet : Monitor;
                        return (
                          <div key={d.key} className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                              <DevIcon className="w-4 h-4 text-slate-500" />
                              {d.key}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">{d.clicks} clics</span>
                              <span className="text-slate-400 ml-2">
                                pos #{d.position.toFixed(1)} · {d.ctr.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Top Países (Orgánico)
                    </h3>
                    <div className="space-y-2">
                      {(gsc.countries || []).slice(0, 6).map((c) => (
                        <div key={c.key} className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase text-slate-700">{c.key}</span>
                          <span className="text-slate-600">
                            <strong className="text-slate-900">{c.clicks}</strong> clics · {c.impressions} impr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Salud de Sitemaps
                    </h3>
                    <div className="space-y-2.5">
                      {(gsc.sitemaps || []).map((s) => (
                        <div key={s.path} className="text-xs space-y-1">
                          <p className="font-semibold text-slate-800 truncate" title={s.path}>
                            {shortenUrl(s.path)}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                              {s.submitted} enviadas
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold ${
                                s.errors > 0
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {s.errors} errores · {s.warnings} avisos
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 2: GOOGLE ANALYTICS 4 (TRAFFIC & FUNNEL)                  */}
      {/* ================================================================= */}
      {subTab === "ga4" && (
        <div className="space-y-6">
          {ga4 && !ga4.connected ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Google Analytics 4 no conectado en este momento
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  {ga4.error || "Verifica que sa-analytics tenga acceso a la propiedad GA4."}
                </p>
              </div>
            </div>
          ) : (
            ga4 && (
              <>
                {/* 4 KPI Cards GA4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Usuarios Activos</span>
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(ga4.totals?.activeUsers ?? 0).toLocaleString("es-MX")}
                      </p>
                      <DeltaBadge value={ga4.usersDeltaPct} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nuevos usuarios: {(ga4.totals?.newUsers ?? 0).toLocaleString("es-MX")}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Sesiones & Interacción</span>
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(ga4.totals?.sessions ?? 0).toLocaleString("es-MX")}
                      </p>
                      <DeltaBadge value={ga4.sessionsDeltaPct} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tasa de interacción: {(ga4.totals?.engagementRate ?? 0).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Vistas de Página</span>
                      <Layers className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {(ga4.totals?.screenPageViews ?? 0).toLocaleString("es-MX")}
                      </p>
                      <DeltaBadge value={ga4.pageViewsDeltaPct} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Previo: {(ga4.previousTotals?.screenPageViews ?? 0).toLocaleString("es-MX")} vistas
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Duración Promedio</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {formatDuration(ga4.totals?.avgSessionDurationSec)}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sesiones comprometidas: {(ga4.totals?.engagedSessions ?? 0).toLocaleString("es-MX")}
                    </p>
                  </div>
                </div>

                {/* Daily Traffic Chart */}
                {ga4.dailyTrend && ga4.dailyTrend.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      Evolución de Usuarios y Sesiones ({growthDays} días)
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ga4.dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickFormatter={(v) => String(v).slice(5)}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="sessions"
                            name="Sesiones"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.14}
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="activeUsers"
                            name="Usuarios activos"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.22}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Channels + Key Events Funnel */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">
                      Canales de Adquisición (Dónde llegan tus usuarios)
                    </h3>
                    <div className="space-y-3">
                      {(ga4.channels || []).map((ch) => {
                        const pct = Math.max(4, Math.round((ch.sessions / maxChannelSessions) * 100));
                        return (
                          <div key={ch.channel} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{ch.channel}</span>
                              <span className="text-slate-600">
                                <strong className="text-slate-900">{ch.activeUsers}</strong> usuarios · {ch.sessions} ses. ·{" "}
                                <span className="text-emerald-700 font-semibold">
                                  {ch.engagementRate.toFixed(0)}% int.
                                </span>
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">
                      Eventos Clave & Embudo de Conversión (GA4)
                    </h3>
                    {ga4.keyEvents && ga4.keyEvents.length > 0 ? (
                      <div className="space-y-3">
                        {ga4.keyEvents.map((ev) => {
                          const meta = EVENT_LABELS[ev.eventName] || {
                            label: ev.eventName,
                            stage: "Evento",
                            color: "bg-slate-600",
                          };
                          const pct = Math.max(4, Math.round((ev.count / maxEventCount) * 100));
                          return (
                            <div key={ev.eventName} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800">{meta.label}</span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {ev.eventName}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900">
                                  {ev.count.toLocaleString("es-MX")}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Los nuevos eventos clave (`view_item`, `add_to_cart`, `begin_checkout`, `sign_up`, `booking_initiated`) aparecerán aquí conforme lleguen sesiones nuevas.
                      </p>
                    )}
                  </div>
                </div>

                {/* Top Public Pages & Cities */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      Top Páginas Públicas (sin ruido de /admin)
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {(ga4.topPages || []).map((p) => (
                        <div
                          key={p.pagePath}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                        >
                          <span className="font-mono text-slate-700 truncate max-w-[300px]" title={p.pagePath}>
                            {p.pagePath}
                          </span>
                          <span className="text-slate-600 shrink-0 ml-2">
                            <strong className="text-slate-900">{p.views}</strong> vistas · {p.activeUsers} usr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Ciudades con Mayor Tráfico
                    </h3>
                    <div className="space-y-2">
                      {(ga4.topCities || []).map((c) => (
                        <div
                          key={`${c.city}-${c.country}`}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                        >
                          <span className="font-semibold text-slate-800">
                            {c.city}
                            {c.country ? <span className="text-slate-400 font-normal"> · {c.country}</span> : null}
                          </span>
                          <span className="text-slate-600">
                            <strong className="text-slate-900">{c.activeUsers}</strong> usuarios · {c.sessions} ses.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 3: PRODUCT ANALYTICS (INTERNAL TELEMETRY)                 */}
      {/* ================================================================= */}
      {subTab === "product" && <TabProductAnalytics productMetrics={productMetrics} />}
    </div>
  );
};
