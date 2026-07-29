"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

import { useFinancialData } from "@/hooks/useFinancialData";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Tooltip Personalizado Soft Health Tech
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-xl font-sans">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-1.5 mb-2">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-bold font-mono text-gray-900 dark:text-white leading-none flex items-baseline gap-1">
          <span>${payload[0].value?.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-sans">
            MXN
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = () => {
  const t = useTranslations("Dashboard.RevenueChart");
  const { data, isLoading, error } = useFinancialData(6);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800 gap-3 font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400">
          {t("loading")}
        </span>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 text-center font-sans gap-2">
        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2} />
        <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
          {t("error_title")}
        </span>
        <p className="text-xs font-medium text-rose-600/80 dark:text-rose-300/80 max-w-xs leading-relaxed">
          {String(error)}
        </p>
      </div>
    );
  }

  // Gráfico de Ingresos
  return (
    <div className="w-full h-[300px] relative bg-white dark:bg-[#0a0a0a] pt-4 pr-2 pb-2 rounded-3xl border border-gray-100 dark:border-gray-800 font-sans shadow-2xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 15,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="softEmeraldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            horizontal={true}
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-800/60"
          />

          <XAxis
            dataKey="name"
            axisLine={{ stroke: "currentColor", strokeOpacity: 0.1 }}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 600 }}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `$${value}`}
            dx={-5}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#10b981",
              strokeWidth: 1.5,
              strokeOpacity: 0.3,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#softEmeraldFill)"
            activeDot={{
              r: 5,
              stroke: "#10b981",
              strokeWidth: 2,
              fill: "#ffffff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};