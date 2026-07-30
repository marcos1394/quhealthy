"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Info,
} from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { GrowthMeasurementResponse, WhoGrowthStandard } from "@/types/growth";
import { cn } from "@/lib/utils";

interface ParentGrowthHistoryProps {
  history: GrowthMeasurementResponse[];
  standards: WhoGrowthStandard[];
  sex: "MALE" | "FEMALE";
}

type IndicatorType =
  | "WEIGHT_FOR_AGE"
  | "LENGTH_FOR_AGE"
  | "HEAD_CIRCUMFERENCE_FOR_AGE"
  | "BMI";

export default function ParentGrowthHistory({
  history,
  standards,
  sex,
}: ParentGrowthHistoryProps) {
  const t = useTranslations("Growth.ParentHistory");
  const [activeIndicator, setActiveIndicator] =
    useState<IndicatorType>("WEIGHT_FOR_AGE");

  const chartData = useMemo(() => {
    const std = standards.find(
      (s) => s.indicator === activeIndicator && s.sex === sex
    );
    const hasStandards = !!std && !!std.lmsData;

    // Crear datos base desde los estándares si existen
    const mergedData = hasStandards
      ? std.lmsData.map((data: any) => ({
          month: data.month,
          P50: data.percentiles?.P50 || null,
          healthyRange:
            data.percentiles?.P3 && data.percentiles?.P97
              ? [data.percentiles.P3, data.percentiles.P97]
              : null,
          Paciente: null as number | null,
          isMeasurement: false,
        }))
      : [];

    // Inyectar mediciones en su edad exacta en meses
    history.forEach((m) => {
      let patientValue = null;
      if (activeIndicator === "WEIGHT_FOR_AGE") patientValue = m.weightKg;
      else if (activeIndicator === "LENGTH_FOR_AGE") patientValue = m.heightCm;
      else if (activeIndicator === "HEAD_CIRCUMFERENCE_FOR_AGE")
        patientValue = m.headCircumferenceCm;
      else if (activeIndicator === "BMI") {
        if (m.weightKg && m.heightCm) {
          const heightM = m.heightCm / 100;
          patientValue = m.weightKg / (heightM * heightM);
        }
      }

      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(
        (d) => Math.abs(d.month - exactMonth) < 0.01
      );

      if (existingPoint) {
        existingPoint.Paciente = patientValue;
        existingPoint.isMeasurement = true;
      } else {
        let healthyRange = null;
        let p50 = null;

        if (hasStandards) {
          const lower = std.lmsData
            .filter((d: any) => d.month <= exactMonth)
            .pop();
          const upper = std.lmsData.find((d: any) => d.month > exactMonth);
          if (lower && upper) {
            const fraction =
              (exactMonth - lower.month) / (upper.month - lower.month);
            const p3 =
              lower.percentiles.P3 +
              (upper.percentiles.P3 - lower.percentiles.P3) * fraction;
            const p97 =
              lower.percentiles.P97 +
              (upper.percentiles.P97 - lower.percentiles.P97) * fraction;
            p50 =
              lower.percentiles.P50 +
              (upper.percentiles.P50 - lower.percentiles.P50) * fraction;
            healthyRange = [p3, p97];
          }
        }

        mergedData.push({
          month: exactMonth,
          P50: p50,
          healthyRange,
          Paciente: patientValue,
          isMeasurement: true,
        });
      }
    });

    mergedData.sort((a, b) => a.month - b.month);
    return mergedData;
  }, [standards, history, sex, activeIndicator]);

  const yAxisLabel =
    activeIndicator === "WEIGHT_FOR_AGE"
      ? t("y_axis_weight")
      : activeIndicator === "LENGTH_FOR_AGE"
      ? t("y_axis_height")
      : activeIndicator === "HEAD_CIRCUMFERENCE_FOR_AGE"
      ? t("y_axis_head")
      : t("y_axis_bmi");

  const indicatorTitle =
    activeIndicator === "WEIGHT_FOR_AGE"
      ? t("indicator_weight")
      : activeIndicator === "LENGTH_FOR_AGE"
      ? t("indicator_height")
      : activeIndicator === "HEAD_CIRCUMFERENCE_FOR_AGE"
      ? t("indicator_head")
      : t("indicator_bmi");

  const showReference =
    activeIndicator === "WEIGHT_FOR_AGE" ||
    activeIndicator === "LENGTH_FOR_AGE";

  const renderStatusBadge = (status?: string) => {
    if (!status)
      return <span className="text-gray-400 font-mono">—</span>;

    if (status === "NORMAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("status_stable")}</span>
        </span>
      );
    }

    if (status === "VIGILANCIA") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-2xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t("status_follow")}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>{t("status_alert")}</span>
      </span>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const patientData = payload.find((p: any) => p.dataKey === "Paciente");
      const p50Data = payload.find((p: any) => p.dataKey === "P50");

      return (
        <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-xl font-sans text-xs space-y-1.5">
          <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1 font-mono">
            {t("tooltip_age", { age: Number(label).toFixed(1) })}
          </p>
          {patientData && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {t("patient")}:
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {Number(patientData.value).toFixed(2)}
              </span>
            </div>
          )}
          {showReference && p50Data && (
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("ideal_median")}:
                </span>
              </div>
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                {Number(p50Data.value).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6 font-sans transition-colors select-none">
      {/* ── SECCIÓN DE GRÁFICO ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Activity className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("evolution_title", { indicator: indicatorTitle })}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span>
                  {showReference
                    ? t("healthy_range_info")
                    : t("historical_info")}
                </span>
              </p>
            </div>
          </div>

          {/* Píldoras de Filtro */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
            {[
              { id: "WEIGHT_FOR_AGE", label: t("tab_weight") },
              { id: "LENGTH_FOR_AGE", label: t("tab_height") },
              { id: "HEAD_CIRCUMFERENCE_FOR_AGE", label: t("tab_head") },
              { id: "BMI", label: t("tab_bmi") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveIndicator(tab.id as IndicatorType)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-2xs",
                  activeIndicator === tab.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ÁREA DE GRÁFICO RECHARTS */}
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -15, bottom: 15 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:opacity-10 opacity-40"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="month"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontWeight: "700" }}
              />

              {/* Área del Rango Saludable */}
              {showReference && (
                <Area
                  type="monotone"
                  dataKey="healthyRange"
                  fill="#10b981"
                  fillOpacity={0.08}
                  stroke="none"
                  name={t("healthy_range")}
                  connectNulls
                />
              )}

              {/* Línea Mediana */}
              {showReference && (
                <Line
                  type="monotone"
                  dataKey="P50"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name={t("ideal_median")}
                  connectNulls
                />
              )}

              {/* Línea Paciente */}
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── SECCIÓN DE TABLA DE HISTORIAL ──────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xs space-y-0">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("history_title")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-gray-500 uppercase bg-gray-50/40 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">{t("th_date")}</th>
                <th className="px-5 py-3.5">{t("th_age")}</th>
                <th className="px-5 py-3.5">{t("th_weight")}</th>
                <th className="px-5 py-3.5">{t("th_height")}</th>
                <th className="px-5 py-3.5">{t("th_bmi")}</th>
                <th className="px-5 py-3.5">{t("th_status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {[...history]
                .sort(
                  (a, b) =>
                    new Date(b.measurementDate).getTime() -
                    new Date(a.measurementDate).getTime()
                )
                .map((measurement) => {
                  let bmi = null;
                  if (measurement.weightKg && measurement.heightCm) {
                    const h = measurement.heightCm / 100;
                    bmi = (measurement.weightKg / (h * h)).toFixed(1);
                  }

                  return (
                    <tr
                      key={measurement.id}
                      className="hover:bg-gray-50/40 dark:hover:bg-[#050505] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        {format(
                          new Date(measurement.measurementDate),
                          "dd MMM yyyy",
                          { locale: es }
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                        {t("months_unit", {
                          months: measurement.ageInMonths,
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        {measurement.weightKg
                          ? `${measurement.weightKg} kg`
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        {measurement.heightCm
                          ? `${measurement.heightCm} cm`
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        {bmi ? bmi : "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(measurement.clinicalStatus)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}