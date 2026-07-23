"use client";

/* eslint-disable react-doctor/button-has-type */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Heart, MessageCircle, Share2, Eye, RefreshCw, AlertCircle, Activity } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { AnalyticsDashboardDTO } from "@/types/social";
import { QhSpinner } from "@/components/ui/QhSpinner";

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all hover:border-gray-200 dark:hover:border-gray-700">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-500">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-[#0a0a0a]/95 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl backdrop-blur-md px-4 py-3 text-xs font-semibold">
      <p className="text-gray-400 font-mono mb-1.5 pb-1.5 border-b border-gray-100 dark:border-gray-800">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-gray-500">{entry.name}:</span> 
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MetricsDashboard() {
  const tm = useTranslations("DashboardMarketing.metrics");
  const { getAnalyticsDashboard } = useSocial();

  const [data, setData] = useState<AnalyticsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      const result = await getAnalyticsDashboard();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[350px] gap-4 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 animate-pulse">
          {tm("loading", { defaultValue: 'Sincronizando telemetría de rendimiento...' })}
        </p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {tm("error", { defaultValue: 'Error de Lectura' })}
        </h3>
        <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed mb-5">
          No se pudieron sincronizar las métricas. Compruebe la conexión del servidor.
        </p>
        <button
          type="button"
          onClick={fetchData}
          className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          <span>{tm("retry", { defaultValue: 'Reintentar Conexión' })}</span>
        </button>
      </div>
    );
  }

  const chartData = data?.chartData ?? [];
  const hasData = chartData.length > 0;

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Dashboard Analítico</p>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-none">
              {tm("title", { defaultValue: 'Métricas de Rendimiento' })}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center gap-2"
          title={tm("refresh", { defaultValue: 'Actualizar datos' })}
        >
          <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="hidden md:inline">{tm("refresh", { defaultValue: 'Sincronizar' })}</span>
        </button>
      </div>

      {/* --- KPI CARDS GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={tm("total_views", { defaultValue: 'Impresiones Globales' })}
          value={data?.totalViews ?? 0}
          icon={<Eye className="w-4 h-4" strokeWidth={2} />}
        />
        <KpiCard
          label={tm("total_likes", { defaultValue: 'Reacciones' })}
          value={data?.totalLikes ?? 0}
          icon={<Heart className="w-4 h-4" strokeWidth={2} />}
        />
        <KpiCard
          label={tm("total_comments", { defaultValue: 'Interacciones' })}
          value={data?.totalComments ?? 0}
          icon={<MessageCircle className="w-4 h-4" strokeWidth={2} />}
        />
        <KpiCard
          label={tm("total_shares", { defaultValue: 'Distribución' })}
          value={data?.totalShares ?? 0}
          icon={<Share2 className="w-4 h-4" strokeWidth={2} />}
        />
      </div>

      {!hasData ? (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
            <Activity className="w-6 h-6 text-gray-400" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            {tm("empty_title", { defaultValue: 'Registro Analítico Vacío' })}
          </h3>
          <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
            {tm("empty_desc", { defaultValue: 'No existen datos de rendimiento para mostrar en el periodo actual.' })}
          </p>
        </div>
      ) : (
        /* --- CHARTS GRID --- */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Line Chart — Views */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {tm("chart_views_title", { defaultValue: 'Evolución de Alcance' })}
              </h3>
            </div>
            
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="views"
                  name={tm("total_views", { defaultValue: 'Impresiones' })}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 2, fill: '#10b981' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart — Engagement */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {tm("chart_engagement_title", { defaultValue: 'Nivel de Interacción' })}
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#10b981', opacity: 0.06 }} />
                <Bar
                  dataKey="engagement"
                  name={tm("chart_engagement_title", { defaultValue: 'Interacciones' })}
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}