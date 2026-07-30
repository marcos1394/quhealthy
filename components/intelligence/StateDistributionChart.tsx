"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { useIntelligenceAggregate } from "@/hooks/useIntelligence";
import { useBIStore } from "@/store/intelligence.store";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Paleta de degradado dinámico en tonos verde esmeralda y teal
const EMERALD_PALETTE = [
  "#059669", // emerald-600
  "#10b981", // emerald-500
  "#34d399", // emerald-400
  "#0d9488", // teal-600
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  t: (key: string, values?: Record<string, any>) => string;
}

// Tooltip personalizado acorde al sistema de diseño Soft Health Tech
function CustomTooltip({ active, payload, t }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-xl font-sans text-xs space-y-1">
        <p className="font-bold text-gray-900 dark:text-white">
          {item.payload.label}
        </p>
        <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {t("total")}:{" "}
          {t("units", { count: item.value?.toLocaleString() || 0 })}
        </p>
      </div>
    );
  }
  return null;
}

export function StateDistributionChart() {
  const t = useTranslations("Intelligence.StateDistributionChart");
  const { data: rawData, loading, error } = useIntelligenceAggregate("entidad");
  const setFilter = useBIStore((state) => state.setFilter);

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[320px] flex flex-col items-center justify-center gap-3 font-sans">
        <QhSpinner
          size="md"
          className="text-emerald-600 dark:text-emerald-400"
        />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 animate-pulse">
          {t("loading")}
        </span>
      </div>
    );
  }

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (error || !rawData) {
    return (
      <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-center font-sans p-6">
        <AlertCircle
          className="w-6 h-6 text-rose-500 shrink-0"
          strokeWidth={2}
        />
        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {t("error_title")}
        </p>
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {t("error_desc")}
        </p>
      </div>
    );
  }

  const data = rawData;
  const chartHeight = Math.max(300, data.length * 40);

  return (
    <div className="h-[380px] w-full overflow-y-auto pr-2 custom-scrollbar font-sans select-none">
      <div style={{ height: chartHeight, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800/60"
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              width={160}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9ca3af",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
              content={<CustomTooltip t={t} />}
            />
            <Bar
              dataKey="total"
              radius={[0, 8, 8, 0]}
              onClick={(entry) => setFilter("estado", entry.label)}
              className="cursor-pointer hover:opacity-85 transition-opacity"
              barSize={18}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EMERALD_PALETTE[index % EMERALD_PALETTE.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}