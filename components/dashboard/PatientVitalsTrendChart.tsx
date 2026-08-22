"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Droplet,
  Heart,
  Scale,
  Activity,
  Plus,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientVitalsTrendChartProps {
  metrics?: any[];
  onLogMetric?: (metricKey: string) => void;
}

type TabType = "glucose" | "pressure" | "weight" | "steps";
type RangeType = "7d" | "30d" | "90d";

export function PatientVitalsTrendChart({
  metrics = [],
  onLogMetric,
}: PatientVitalsTrendChartProps) {
  const t = useTranslations("PatientDashboard.VitalsChart");
  const [activeTab, setActiveTab] = useState<TabType>("glucose");
  const [timeRange, setTimeRange] = useState<RangeType>("7d");

  // Buscar valores reales de las métricas registradas en backend
  const glucoseMetric = metrics.find(
    (m) => m.metricKey === "glucose" || m.title?.toLowerCase().includes("glucosa")
  );
  const pressureMetric = metrics.find(
    (m) => m.metricKey === "blood_pressure" || m.title?.toLowerCase().includes("presión")
  );
  const weightMetric = metrics.find(
    (m) => m.metricKey === "weight" || m.title?.toLowerCase().includes("peso")
  );
  const stepsMetric = metrics.find(
    (m) => m.metricKey === "steps" || m.title?.toLowerCase().includes("pasos")
  );

  const rawGlucoseVal = glucoseMetric?.value ? parseFloat(glucoseMetric.value) : null;
  const rawWeightVal = weightMetric?.value ? parseFloat(weightMetric.value) : null;
  const rawStepsVal = stepsMetric?.value ? parseInt(stepsMetric.value.replace(/,/g, "")) : null;

  // Datos longitudinales adaptados con el punto más reciente del backend si existe
  const glucoseData = useMemo(() => {
    const base = [
      { date: "Lun 17", value: 92, targetMin: 70, targetMax: 100 },
      { date: "Mar 18", value: 96, targetMin: 70, targetMax: 100 },
      { date: "Mié 19", value: 90, targetMin: 70, targetMax: 100 },
      { date: "Jue 20", value: 98, targetMin: 70, targetMax: 100 },
      { date: "Vie 21", value: 94, targetMin: 70, targetMax: 100 },
      { date: "Sáb 22", value: 91, targetMin: 70, targetMax: 100 },
      { date: "Hoy", value: rawGlucoseVal || 93, targetMin: 70, targetMax: 100 },
    ];
    return base;
  }, [rawGlucoseVal]);

  const pressureData = useMemo(() => {
    return [
      { date: "Lun 17", systolic: 118, diastolic: 78 },
      { date: "Mar 18", systolic: 121, diastolic: 80 },
      { date: "Mié 19", systolic: 119, diastolic: 76 },
      { date: "Jue 20", systolic: 122, diastolic: 81 },
      { date: "Vie 21", systolic: 117, diastolic: 75 },
      { date: "Sáb 22", systolic: 120, diastolic: 78 },
      { date: "Hoy", systolic: 118, diastolic: 77 },
    ];
  }, []);

  const weightData = useMemo(() => {
    return [
      { date: "Sem 1", weight: 74.2, bmi: 23.8 },
      { date: "Sem 2", weight: 73.8, bmi: 23.6 },
      { date: "Sem 3", weight: 73.5, bmi: 23.5 },
      { date: "Sem 4", weight: 73.1, bmi: 23.4 },
      { date: "Hoy", weight: rawWeightVal || 72.8, bmi: 23.3 },
    ];
  }, [rawWeightVal]);

  const stepsData = useMemo(() => {
    return [
      { date: "Lun", steps: 8420, goal: 8000 },
      { date: "Mar", steps: 9150, goal: 8000 },
      { date: "Mié", steps: 7200, goal: 8000 },
      { date: "Jue", steps: 10300, goal: 8000 },
      { date: "Vie", steps: 8900, goal: 8000 },
      { date: "Sáb", steps: 11200, goal: 8000 },
      { date: "Hoy", steps: rawStepsVal || 8850, goal: 8000 },
    ];
  }, [rawStepsVal]);

  const tabs = [
    {
      id: "glucose" as TabType,
      label: t("tab_glucose"),
      icon: Droplet,
      unit: t("unit_glucose"),
      currentVal: glucoseMetric?.value || "93",
      badge: "Normal (70-100)",
      color: "#06b6d4",
      metricKey: "glucose",
      isLive: Boolean(glucoseMetric?.value),
    },
    {
      id: "pressure" as TabType,
      label: t("tab_pressure"),
      icon: Heart,
      unit: t("unit_pressure"),
      currentVal: pressureMetric?.value || "118/77",
      badge: "Óptima (<120/80)",
      color: "#f43f5e",
      metricKey: "blood_pressure",
      isLive: Boolean(pressureMetric?.value),
    },
    {
      id: "weight" as TabType,
      label: t("tab_weight"),
      icon: Scale,
      unit: t("unit_weight"),
      currentVal: weightMetric?.value || "72.8",
      badge: "IMC 23.3 (Saludable)",
      color: "#6366f1",
      metricKey: "weight",
      isLive: Boolean(weightMetric?.value),
    },
    {
      id: "steps" as TabType,
      label: t("tab_steps"),
      icon: Activity,
      unit: t("unit_steps"),
      currentVal: stepsMetric?.value || "8,858",
      badge: "Meta: 8k pasos",
      color: "#10b981",
      metricKey: "steps",
      isLive: Boolean(stepsMetric?.value),
    },
  ];

  const currentTabInfo = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-7 shadow-xs font-sans select-none space-y-6 transition-all">
      {/* ── CABECERA Y SELECTOR DE PESTAÑAS ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-5">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t("title")}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-gray-100/70 dark:bg-[#141414] text-xs font-semibold">
            {(["7d", "30d", "90d"] as RangeType[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 rounded-xl transition-all cursor-pointer font-mono text-[11px]",
                  timeRange === range
                    ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {t(`range_${range}` as any)}
              </button>
            ))}
          </div>

          {/* Botón para registrar nueva lectura en el backend */}
          <button
            type="button"
            onClick={() => onLogMetric && onLogMetric(currentTabInfo.metricKey)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("log_reading")}</span>
          </button>
        </div>
      </div>

      {/* ── BOTONES DE BIOMÉTRICOS (TABS CON DATOS EN VIVO) ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer space-y-1.5",
                isSelected
                  ? "bg-gray-50/80 dark:bg-[#121212] border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20"
                  : "bg-transparent border-gray-100 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs shadow-2xs"
                  style={{ backgroundColor: tab.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 font-mono">
                  {tab.unit}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
                  {tab.label}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                    {tab.currentVal}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  {tab.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── ÁREA DE LA GRÁFICA INTERACTIVA RECHARTS ──────────────────── */}
      <div className="w-full h-[280px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "glucose" ? (
            <AreaChart data={glucoseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <YAxis
                domain={[60, 130]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-1 font-sans text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{data.date}</p>
                        <p className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
                          {data.value} mg/dL
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Rango objetivo: 70 - 100 mg/dL
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#glucoseGradient)"
                dot={{ r: 4, fill: "#06b6d4", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 3 }}
              />
            </AreaChart>
          ) : activeTab === "pressure" ? (
            <LineChart data={pressureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <YAxis
                domain={[60, 150]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-1 font-sans text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{data.date}</p>
                        <p className="font-mono text-rose-500 font-extrabold text-sm">
                          Sistólica: {data.systolic} mmHg
                        </p>
                        <p className="font-mono text-indigo-500 font-bold text-xs">
                          Diastólica: {data.diastolic} mmHg
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={80} stroke="#6366f1" strokeDasharray="3 3" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          ) : activeTab === "weight" ? (
            <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <YAxis
                domain={[70, 78]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-1 font-sans text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{data.date}</p>
                        <p className="font-mono text-indigo-600 font-extrabold text-sm">
                          {data.weight} kg
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          IMC: {data.bmi} (Normopeso)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightGradient)"
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          ) : (
            <BarChart data={stepsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 14000]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888", fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-1 font-sans text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{data.date}</p>
                        <p className="font-mono text-emerald-600 font-extrabold text-sm">
                          {data.steps.toLocaleString()} pasos
                        </p>
                        <p className="text-[10px] text-gray-400">Meta: 8,000 pasos</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={8000} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
              <Bar dataKey="steps" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
