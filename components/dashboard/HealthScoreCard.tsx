"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, TrendingUp, AlertTriangle, Fingerprint } from "lucide-react";

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
  statusLabel
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

  const StatusIcon = safeScore === 0 ? Fingerprint : (safeScore >= 50 ? ShieldCheck : AlertTriangle);

  return (
    <div className="group relative w-full h-full min-h-[320px] bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none p-8 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] z-0 hover:z-10 overflow-hidden">
      
      {/* Fondo Arquitectónico Sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Cabecera Técnica */}
      <div className="flex justify-between w-full items-start mb-8 relative z-10">
        <div className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center bg-white dark:bg-black transition-colors group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
          <StatusIcon className="w-3 h-3 mr-2" strokeWidth={2} /> 
          {getDynamicStatus()}
        </div>
        <div className="w-8 h-8 flex items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white transition-transform duration-500 group-hover:rotate-180">
          <Activity className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>

      {/* Gráfico Geométrico Central */}
      <div className="relative flex items-center justify-center w-40 h-40 mb-8 z-10">
        {/* Cruceta de calibración (Diseño Editorial) */}
        <div className="absolute inset-0 border border-gray-100 dark:border-gray-800 rounded-full" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100 dark:bg-gray-800" />
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-gray-100 dark:bg-gray-800" />
        
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          {/* Fondo del anillo */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Anillo de progreso animado */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} // Curva de aceleración técnica
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="square"
            className="text-black dark:text-white"
          />
        </svg>

        {/* Métrica Central */}
        <div className="absolute flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-full w-24 h-24 border border-gray-50 dark:border-gray-900 shadow-sm">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-black tracking-tighter text-black dark:text-white leading-none"
          >
            {safeScore}
          </motion.span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">/ 100</span>
        </div>
      </div>

      {/* Tipografía Descriptiva */}
      <div className="relative z-10 mb-4">
        <h3 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-[220px] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* KPI Dinámico (Solución al dato hardcodeado) */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 w-full flex items-center justify-center relative z-10">
        {percentile && percentile > 0 ? (
          <div className="flex items-center gap-3 text-black dark:text-white">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Top {percentile}% del ecosistema
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-600">
            <Activity className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Acumulando datos comparativos
            </span>
          </div>
        )}
      </div>
    </div>
  );
};