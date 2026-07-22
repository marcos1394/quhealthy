"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useFinancialData } from "@/hooks/useFinancialData";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Tooltip Estricto / Blueprint Utilitario
const CustomTooltip = ({ active, payload, label }: any) => {
 if (active && payload && payload.length) {
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-lg">
 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
 {label}
 </p>
 <p className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-none flex items-end gap-1.5">
 ${payload[0].value.toLocaleString()} 
 <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">MXN</span>
 </p>
 </div>
 }
 return null;
};

export const RevenueChart = () => {
 const t = useTranslations("Dashboard");
 const { data, isLoading, error } = useFinancialData(6);

 return (
 <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] rounded-b-3xl">
 <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400 mb-4" />
 <span className="text-xs font-semibold text-gray-500 animate-pulse">
 CUALIFICANDO HISTÓRICO...
 </span>
 </div>
 );

 return (
 <div className="w-full h-[300px] flex flex-col items-center justify-center border-t border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-b-3xl">
 <span className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
 ERROR DE LECTURA
 </span>
 <p className="text-sm font-semibold text-red-700 dark:text-red-500">{error}</p>
 </div>
 );

 return (
 <div className="w-full h-[300px] text-gray-900 dark:text-white relative bg-white dark:bg-[#0a0a0a] pt-4 pr-4 rounded-b-3xl">
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
 <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
 <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
 </linearGradient>
 </defs>

 {/* CUADRÍCULA SUAVE */}
 <CartesianGrid 
 strokeDasharray="4 4" 
 vertical={false} 
 horizontal={true}
 stroke="currentColor" 
 strokeOpacity={0.05}
 />
 
 <XAxis
 dataKey="name"
 axisLine={{ stroke: 'currentColor', strokeOpacity: 0.1, strokeWidth: 1 }}
 tickLine={false}
 tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600, opacity: 0.6 }} 
 dy={10}
 />
 
 <YAxis
 axisLine={false} 
 tickLine={false}
 tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600, opacity: 0.6 }}
 tickFormatter={(value) => `$${value}`}
 dx={-5}
 />
 
 <Tooltip 
 content={<CustomTooltip />} 
 cursor={{ stroke: '#10b981', strokeWidth: 1, strokeOpacity: 0.2, strokeDasharray: '4 4' }} 
 />
 
 {/* LÍNEA DE DATOS SUAVE */}
 <Area
 type="monotone" // Trazos curvos y suaves
 dataKey="revenue"
 stroke="#10b981"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#blueprintFill)" 
 activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
};