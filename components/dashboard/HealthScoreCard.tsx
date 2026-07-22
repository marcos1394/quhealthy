"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

interface HealthScoreCardProps {
  score?: number;
  title?: string;
  subtitle?: string;
  percentile?: number | null; // Recibirá el dato real del backend (ej. 15 para "Top 15%")
  statusLabel?: string; // Etiqueta superior (ej. "Óptimo", "Atención")
}

export const HealthScoreCard = ({
  score = 0,
  title = "QuHealthScore™",
  subtitle = "Calibrando telemetría...",
  percentile = null,
  statusLabel,
}: HealthScoreCardProps) => {
  // Cálculos matemáticos para el anillo de precisión
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Previene valores negativos o mayores a 100
  const safeScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Lógica dinámica para el estado superior si no se provee un statusLabel
  const getDynamicStatus = () => {
    if (statusLabel) return statusLabel;
    if (safeScore === 0) return "RECOPILANDO DATOS";
    if (safeScore >= 80) return "ESTADO ÓPTIMO";
    if (safeScore >= 50) return "ESTABLE";
    return "REQUIERE ATENCIÓN";
  };

  const StatusIcon =
    safeScore === 0
      ? Fingerprint
      : safeScore >= 50
        ? ShieldCheck
        : AlertTriangle;

  return (
    <div className="group relative w-full h-full min-h-[320px] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 z-0 hover:z-10 overflow-hidden cursor-pointer">
      {/* Cabecera Técnica */}
      <div className="flex justify-between w-full items-start mb-8 relative z-10">
        <div className="rounded-full px-4 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400 flex items-center transition-colors duration-300">
          <StatusIcon className="w-4 h-4 mr-2" strokeWidth={2} />
          {getDynamicStatus()}
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 transition-all duration-500 group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
          <Activity className="w-5 h-5" strokeWidth={1.5} />
        </div>
      </div>

      {/* Gráfico Geométrico Central */}
      <div className="relative flex items-center justify-center w-40 h-40 mb-8 z-10">
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          {/* Fondo del anillo */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Anillo de progreso animado */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="text-teal-500 dark:text-teal-400"
          />
        </svg>

        {/* Métrica Central */}
        <div className="absolute flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-full w-24 h-24 border border-gray-50 dark:border-gray-900 shadow-sm">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white leading-none"
          >
            {safeScore}
          </motion.span>
          <span className="text-[10px] font-bold text-gray-400 mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Tipografía Descriptiva */}
      <div className="relative z-10 mb-4 mt-2">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-500 max-w-[220px] mx-auto">
          {subtitle}
        </p>
      </div>

      {/* KPI Dinámico */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 w-full flex items-center justify-center relative z-10">
        {percentile && percentile > 0 ? (
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
            <span className="text-xs font-semibold">
              Top {percentile}% del ecosistema
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <Activity className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-xs font-medium">
              Acumulando datos comparativos
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
