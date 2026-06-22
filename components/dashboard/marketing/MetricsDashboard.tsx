"use client";

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
import { cn } from "@/lib/utils";

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  isLast?: boolean;
}

function KpiCard({ label, value, icon, colorClass, isLast }: KpiCardProps) {
  return (
    <div className={cn(
      "p-6 flex flex-col justify-between bg-white dark:bg-[#0a0a0a] transition-colors hover:bg-gray-50 dark:hover:bg-[#111]",
      "border-b lg:border-b-0", // Border bottom on mobile
      !isLast && "border-r border-black/10 dark:border-white/10" // Border right for all except last
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </span>
        <div className={cn("w-8 h-8 flex items-center justify-center border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]", colorClass)}>
          {icon}
        </div>
      </div>
      <p className={cn("text-3xl font-semibold tracking-tight leading-none", colorClass)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
      <p className="text-gray-500 mb-2 border-b border-black/10 dark:border-white/10 pb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span>{entry.name}:</span> 
          <span className="text-black dark:text-white text-xs">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MetricsDashboard() {
  const t = useTranslations("DashboardMarketing");
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
          {tm("loading", { defaultValue: 'SINCRONIZANDO TELEMETRÍA...' })}
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20">
        <div className="w-16 h-16 border border-red-500/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-tight text-red-600 dark:text-red-400 mb-2">
          {tm("error", { defaultValue: 'ERROR DE LECTURA' })}
        </p>
        <button
          onClick={fetchData}
          className="mt-4 h-10 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          {tm("retry", { defaultValue: 'REINTENTAR CONEXIÓN' })}
        </button>
      </div>
    );
  }

  const chartData = data?.chartData ?? [];
  const hasData = chartData.length > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER ARQUITECTÓNICO */}
      <div className="flex items-start md:items-center justify-between p-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              Dashboard Analítico
            </p>
            <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
              {tm("title", { defaultValue: 'MÉTRICAS DE RENDIMIENTO' })}
            </h2>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="h-12 w-12 md:w-auto md:px-6 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors shrink-0 rounded-none"
          title={tm("refresh", { defaultValue: 'ACTUALIZAR DATOS' })}
        >
          <RefreshCw className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest">
            {tm("refresh", { defaultValue: 'SINC' })}
          </span>
        </button>
      </div>

      {/* KPI CARDS (GRID BLUEPRINT) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
        <KpiCard
          label={tm("total_views", { defaultValue: 'IMPRESIONES GLOBALES' })}
          value={data?.totalViews ?? 0}
          icon={<Eye className="w-4 h-4" strokeWidth={1.5} />}
          colorClass="text-black dark:text-white"
        />
        <KpiCard
          label={tm("total_likes", { defaultValue: 'REACCIONES' })}
          value={data?.totalLikes ?? 0}
          icon={<Heart className="w-4 h-4" strokeWidth={1.5} />}
          colorClass="text-black dark:text-white"
        />
        <KpiCard
          label={tm("total_comments", { defaultValue: 'INTERACCIONES' })}
          value={data?.totalComments ?? 0}
          icon={<MessageCircle className="w-4 h-4" strokeWidth={1.5} />}
          colorClass="text-black dark:text-white"
        />
        <KpiCard
          label={tm("total_shares", { defaultValue: 'DISTRIBUCIÓN' })}
          value={data?.totalShares ?? 0}
          icon={<Share2 className="w-4 h-4" strokeWidth={1.5} />}
          colorClass="text-black dark:text-white"
          isLast={true}
        />
      </div>

      {!hasData ? (
        // ── Empty state ──────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
          <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
            <Activity className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
            {tm("empty_title", { defaultValue: 'REGISTRO ANALÍTICO VACÍO' })}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
            {tm("empty_desc", { defaultValue: 'NO EXISTEN DATOS DE RENDIMIENTO PARA MOSTRAR EN EL PERIODO ACTUAL.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart — Views */}
          <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none">
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-black dark:bg-white" /> 
                {tm("chart_views_title", { defaultValue: 'EVOLUCIÓN DE ALCANCE' })}
              </h3>
            </div>
            <div className="p-6 pt-8">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#6b7280" strokeOpacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: "bold" }}
                    tickFormatter={(v) => v.slice(5)} // MM-DD
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: "bold" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name={tm("total_views", { defaultValue: 'IMPRESIONES' })}
                    stroke="#000"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, stroke: '#000', strokeWidth: 2, fill: '#fff' }}
                    // Fix for dark mode line color (recharts standard SVG props)
                    className="dark:stroke-white"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart — Engagement */}
          <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none">
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400" /> 
                {tm("chart_engagement_title", { defaultValue: 'NIVEL DE INTERACCIÓN' })}
              </h3>
            </div>
            <div className="p-6 pt-8">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#6b7280" strokeOpacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: "bold" }}
                    tickFormatter={(v) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: "bold" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.1 }} />
                  <Bar
                    dataKey="engagement"
                    name={tm("chart_engagement_title", { defaultValue: 'INTERACCIONES' })}
                    fill="#9ca3af" // Neutral technical gray
                    radius={[0, 0, 0, 0]} // Strict square corners
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}