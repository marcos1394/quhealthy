"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useFinancialData } from "@/hooks/useFinancialData";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Tooltip Personalizado con Estética Neo-Brutalista
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-4 rounded-none">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-2 mb-2">
          {label}
        </p>
        <p className="text-xl font-black tracking-tighter text-black dark:text-white leading-none flex items-end gap-1">
          ${payload[0].value.toLocaleString()} 
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">MXN</span>
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = () => {
  const t = useTranslations("Dashboard"); // Preparado para futuras traducciones
  const { data, isLoading, error } = useFinancialData(6);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] mt-6 flex flex-col items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
        <QhSpinner size="md" className="text-black dark:text-white mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          EXTRAYENDO HISTÓRICO FINANCIERO...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] mt-6 flex flex-col items-center justify-center border border-red-500 bg-red-50 dark:bg-red-900/10 shadow-[4px_4px_0_0_#ef4444]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
          ERROR DE LECTURA
        </span>
        <p className="text-sm font-bold text-red-700 dark:text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-6 text-black dark:text-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          {/* PATRÓN TÉCNICO EN LUGAR DE GRADIENTE */}
          <defs>
            <pattern id="brutalistHatch" patternUnits="userSpaceOnUse" width="8" height="8">
              <path 
                d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                className="text-gray-300 dark:text-gray-800" 
              />
            </pattern>
          </defs>

          {/* CUADRÍCULA RÍGIDA */}
          <CartesianGrid 
            strokeDasharray="2 2" 
            vertical={true} 
            stroke="currentColor" 
            className="text-gray-200 dark:text-gray-800" 
          />
          
          <XAxis
            dataKey="name"
            axisLine={{ stroke: 'currentColor', strokeWidth: 1.5 }}
            tickLine={{ stroke: 'currentColor', strokeWidth: 1.5 }}
            tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 'bold', fontFamily: 'monospace' }}
            dy={15}
          />
          
          <YAxis
            axisLine={{ stroke: 'currentColor', strokeWidth: 1.5 }}
            tickLine={{ stroke: 'currentColor', strokeWidth: 1.5 }}
            tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 'bold', fontFamily: 'monospace' }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          {/* LÍNEA DE DATOS ARQUITECTÓNICA */}
          <Area
            type="linear" // Trazos rectos y agresivos en lugar de 'monotone'
            dataKey="revenue"
            stroke="currentColor"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#brutalistHatch)"
            activeDot={{ r: 5, stroke: 'currentColor', strokeWidth: 2, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};