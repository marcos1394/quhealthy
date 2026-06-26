"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useFinancialData } from "@/hooks/useFinancialData";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Tooltip Estricto / Blueprint Utilitario
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-4 rounded-none">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white leading-none flex items-end gap-1.5">
          ${payload[0].value.toLocaleString()} 
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">MXN</span>
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
      <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="md" className="text-black dark:text-white mb-4" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          EXTRAYENDO HISTÓRICO...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
          ERROR DE LECTURA
        </span>
        <p className="text-xs font-semibold text-red-700 dark:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] text-black dark:text-white relative bg-white dark:bg-[#0a0a0a] pt-4 pr-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10, 
            bottom: 0,
          }}
        >
          <defs>
            {/* Gradiente sutil para simular el sombreado sobre el plano arquitectónico */}
            <linearGradient id="blueprintFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.1} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* CUADRÍCULA ARQUITECTÓNICA (Malla tipo plano) */}
          <CartesianGrid 
            strokeDasharray="0" 
            vertical={true} 
            horizontal={true}
            stroke="currentColor" 
            strokeOpacity={0.08} // Sutil como papel milimetrado
          />
          
          <XAxis
            dataKey="name"
            axisLine={{ stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 1 }}
            tickLine={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
            tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 700, opacity: 0.5, fontFamily: 'monospace' }} 
            dy={10}
          />
          
          <YAxis
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 700, opacity: 0.5, fontFamily: 'monospace' }}
            tickFormatter={(value) => `$${value}`}
            dx={-5}
          />
          
          {/* Guía vertical sólida en el Tooltip para precisión extrema */}
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeOpacity: 0.3, strokeDasharray: '0' }} 
          />
          
          {/* LÍNEA DE DATOS TÉCNICA */}
          <Area
            type="linear" // Trazos rectos (matemáticos)
            dataKey="revenue"
            stroke="currentColor"
            strokeWidth={1.5} // Fina, técnica y precisa
            fillOpacity={1}
            fill="url(#blueprintFill)" 
            activeDot={{ r: 4, stroke: 'currentColor', strokeWidth: 1.5, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};