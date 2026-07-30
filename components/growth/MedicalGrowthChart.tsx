"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { GrowthMeasurementResponse, WhoGrowthStandard } from "@/types/growth";
import { cn } from "@/lib/utils";

interface MedicalGrowthChartProps {
  measurements: GrowthMeasurementResponse[];
  standards: WhoGrowthStandard[];
  sex: "MALE" | "FEMALE";
  indicator: "WEIGHT_FOR_AGE" | "LENGTH_FOR_AGE" | "HEAD_CIRCUMFERENCE_FOR_AGE";
}

// Tooltip Personalizado con Diseño Soft Health Tech
const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-xl font-sans text-xs space-y-1.5">
        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1 font-mono">
          {t("axis_age")}: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 justify-between">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {entry.value !== null ? entry.value : "—"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MedicalGrowthChart({
  measurements,
  standards,
  sex,
  indicator,
}: MedicalGrowthChartProps) {
  const t = useTranslations("MedicalGrowthChart");

  const standardData = useMemo(() => {
    const std = standards.find(
      (s) => s.indicator === indicator && s.sex === sex
    );
    if (!std || !std.lmsData) return [];

    // Crear dataset base desde los estándares de la OMS
    const mergedData = std.lmsData.map((data: any) => ({
      month: data.month,
      P3: data.percentiles?.P3 || null,
      P50: data.percentiles?.P50 || null,
      P97: data.percentiles?.P97 || null,
      Paciente: null as number | null,
    }));

    // Inyectar mediciones reales del paciente
    measurements.forEach((m) => {
      const patientValue =
        indicator === "WEIGHT_FOR_AGE"
          ? m.weightKg
          : indicator === "LENGTH_FOR_AGE"
          ? m.heightCm
          : m.headCircumferenceCm;

      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(
        (d) => Math.abs(d.month - exactMonth) < 0.01
      );

      if (existingPoint) {
        existingPoint.Paciente = patientValue;
      } else {
        mergedData.push({
          month: exactMonth,
          P3: null,
          P50: null,
          P97: null,
          Paciente: patientValue,
        });
      }
    });

    mergedData.sort((a, b) => a.month - b.month);
    return mergedData;
  }, [standards, measurements, sex, indicator]);

  const chartTitle =
    indicator === "WEIGHT_FOR_AGE"
      ? t("title_weight")
      : indicator === "LENGTH_FOR_AGE"
      ? t("title_length")
      : t("title_head");

  const yAxisLabel =
    indicator === "WEIGHT_FOR_AGE"
      ? t("label_weight")
      : indicator === "LENGTH_FOR_AGE"
      ? t("label_length")
      : t("label_head");

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "NORMAL":
        return (
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs">
            {t("status_normal")}
          </span>
        );
      case "VIGILANCIA":
        return (
          <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs">
            {t("status_vigilancia")}
          </span>
        );
      default:
        return (
          <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs">
            {t("status_alerta")}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs font-sans transition-colors space-y-6 select-none">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {chartTitle}
      </h3>

      {/* Gráfico de Líneas Recharts */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={standardData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              className="dark:opacity-10 opacity-40"
            />
            <XAxis
              type="number"
              dataKey="month"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
            />

            {/* Curvas Estándar OMS */}
            <Line
              type="monotone"
              dataKey="P97"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name={t("percentile_97")}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="P50"
              stroke="#64748b"
              strokeWidth={1.5}
              dot={false}
              name={t("percentile_50")}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="P3"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name={t("percentile_3")}
              connectNulls
            />

            {/* Curva Paciente */}
            <Line
              type="monotone"
              dataKey="Paciente"
              stroke="#059669"
              strokeWidth={3}
              dot={{
                stroke: "#059669",
                strokeWidth: 2,
                r: 4,
                fill: "#ffffff",
              }}
              activeDot={{ r: 6, fill: "#059669" }}
              name={t("patient")}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de Datos Precisos */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-gray-500 uppercase bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3.5">{t("table_age")}</th>
              <th className="px-4 py-3.5">{t("table_measurement")}</th>
              <th className="px-4 py-3.5">{t("table_zscore")}</th>
              <th className="px-4 py-3.5">{t("table_status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {measurements.map((m) => {
              const val =
                indicator === "WEIGHT_FOR_AGE"
                  ? `${m.weightKg} kg`
                  : indicator === "LENGTH_FOR_AGE"
                  ? `${m.heightCm} cm`
                  : `${m.headCircumferenceCm} cm`;

              const zScore =
                indicator === "WEIGHT_FOR_AGE"
                  ? m.weightZScore
                  : indicator === "LENGTH_FOR_AGE"
                  ? m.heightZScore
                  : m.headCircumferenceZScore;

              return (
                <tr
                  key={m.id}
                  className="hover:bg-gray-50/40 dark:hover:bg-[#050505] transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                    {m.ageInMonths}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                    {val}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">
                    {zScore != null ? zScore.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(m.clinicalStatus)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}