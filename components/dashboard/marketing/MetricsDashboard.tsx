"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Heart, MessageCircle, Share2, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { AnalyticsDashboardDTO } from "@/types/social";

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function KpiCard({ label, value, icon, colorClass, bgClass }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-medical-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{tm("loading")}</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="text-red-500" size={24} />
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{tm("error")}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-600 text-white text-sm font-medium hover:bg-medical-700 transition-colors"
        >
          <RefreshCw size={14} />
          {tm("retry")}
        </button>
      </div>
    );
  }

  const chartData = data?.chartData ?? [];
  const hasData = chartData.length > 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-medical-600" size={22} />
            {tm("title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {tm("subtitle")}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} />
          {tm("refresh")}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={tm("total_views")}
          value={data?.totalViews ?? 0}
          icon={<Eye size={22} />}
          colorClass="text-medical-600"
          bgClass="bg-medical-50 dark:bg-medical-900/20"
        />
        <KpiCard
          label={tm("total_likes")}
          value={data?.totalLikes ?? 0}
          icon={<Heart size={22} />}
          colorClass="text-rose-500"
          bgClass="bg-rose-50 dark:bg-rose-900/20"
        />
        <KpiCard
          label={tm("total_comments")}
          value={data?.totalComments ?? 0}
          icon={<MessageCircle size={22} />}
          colorClass="text-teal-600"
          bgClass="bg-teal-50 dark:bg-teal-900/20"
        />
        <KpiCard
          label={tm("total_shares")}
          value={data?.totalShares ?? 0}
          icon={<Share2 size={22} />}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {!hasData ? (
        // ── Empty state ──────────────────────────────────────────────────────
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
            <TrendingUp className="text-slate-300 dark:text-slate-500" size={28} />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">{tm("empty_title")}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{tm("empty_desc")}</p>
        </div>
      ) : (
        <>
          {/* Line Chart — Views */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              {tm("chart_views_title")}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => v.slice(5)} // MM-DD
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  name={tm("total_views")}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart — Engagement */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              {tm("chart_engagement_title")}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="engagement"
                  name={tm("chart_engagement_title")}
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}