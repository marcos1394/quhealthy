"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useFinancialData } from "@/hooks/useFinancialData";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Tooltip Personalizado con Estética Neo-Brutalista (Limpio y Legible)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-4">
        {/* 🔥 Tipografía agrandada y legible */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight text-black dark:text-white leading-none flex items-end gap-1.5">
          ${payload[0].value.toLocaleString()} 
          {/* 🔥 Moneda legible sin tracking excesivo */}
          <span className="text-[11px] font-bold text-gray-500 mb-1">MXN</span>
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = () => {
  const t = useTranslations("Dashboard");
  const { data, isLoading, error } = useFinancialData(6);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="md" className="text-black dark:text-white mb-4" />
        {/* 🔥 Eliminada la sombra del estado de carga para reducir peso visual */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 animate-pulse">
          EXTRAYENDO HISTÓRICO...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center border-2 border-red-500 bg-red-50 dark:bg-red-900/10 shadow-[4px_4px_0_0_#ef4444]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
          ERROR DE LECTURA
        </span>
        <p className="text-sm font-bold text-red-700 dark:text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] text-black dark:text-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 30, // 🔥 Evita que los valores grandes ($10,000) se corten a la izquierda
            bottom: 0,
          }}
        >
          {/* 🔥 PATRÓN SUSTITUIDO POR RELLENO SÓLIDO DE ALTO CONTRASTE */}
          {/* El patrón de rayas generaba "vibración visual" sobre la cuadrícula */}
          <defs>
            <linearGradient id="brutalistFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.15} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* 🔥 CUADRÍCULA ARQUITECTÓNICA LIMPIA */}
          <CartesianGrid 
            strokeDasharray="0" // 🔥 Líneas sólidas en lugar de punteadas (estilo blueprint)
            vertical={false}    // 🔥 Eliminamos líneas verticales (ruido innecesario)
            stroke="currentColor" 
            className="text-gray-200 dark:text-gray-800" 
          />
          
          <XAxis
            dataKey="name"
            axisLine={{ stroke: 'currentColor', strokeWidth: 1.5 }}
            tickLine={false} // 🔥 Quitamos la pequeña línea de la marca para limpieza
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }} // 🔥 11px mínimo para legibilidad
            dy={10}
          />
          
          <YAxis
            axisLine={false} // 🔥 El eje Y no necesita línea, la cuadrícula horizontal basta
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}
            tickFormatter={(value) => `$${value}`}
            dx={-5}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          {/* LÍNEA DE DATOS ARQUITECTÓNICA */}
          <Area
            type="linear" // Trazos rectos y agresivos (perfecto para brutalismo)
            dataKey="revenue"
            stroke="currentColor"
            strokeWidth={2.5} // 🔥 Ligeramente más fino para no tapar picos, pero still bold
            fillOpacity={1}
            fill="url(#brutalistFill)" // 🔥 Relleno limpio con gradiente sólido
            activeDot={{ r: 5, stroke: 'currentColor', strokeWidth: 2, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};