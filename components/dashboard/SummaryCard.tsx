/* eslint-disable react-doctor/no-multi-comp */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable deslop/unused-export */
"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Info, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
 title: string;
 value: string | number;
 icon: LucideIcon;
 color?: string; 
 bgColor?: string; 
 borderColor?: string; 
 trend?: { value: number; isPositive: boolean; period?: string };
 comparison?: { label: string; value: string };
 description?: string;
 onClick?: () => void;
 loading?: boolean;
 badge?: string;
 sparkline?: number[];
 breakdown?: { label: string; value: string; percentage?: string }[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
 title, value, icon: Icon,
 trend, comparison, description, onClick, loading = false, badge, sparkline, breakdown
}) => {
 const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

 const renderSparkline = () => {
 if (!sparkline || sparkline.length === 0) return null;
 const max = Math.max(...sparkline);
 const min = Math.min(...sparkline);
 const range = max - min || 1;
 
 return (
 <div className="flex items-end gap-[1px] h-10 mt-6 pt-2 border-t border-black/10 dark:border-white/10 w-full">
 {sparkline.map((point, index) => {
 const height = Math.max(((point - min) / range) * 100, 8); 
 return (
 <div 
 key={index} 
 style={{ height: `${height}%` }}
 className={cn(
 "flex-1 transition-all duration-300", 
 trend?.isPositive 
 ? "bg-black/20 dark:bg-white/20 group-hover:bg-black dark:group-hover:bg-white" 
 : "bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-500"
 )} 
 />
 );
 })}
 </div>
 );
 };

 return (
 <div 
 onClick={onClick}
 className={cn(
 "h-full flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm transition-all duration-300 group",
 "hover:-translate-y-1 hover:shadow-lg hover:border-emerald-100 dark:hover:border-gray-700",
 onClick ? "cursor-pointer" : "cursor-default"
 )}
 >
 <div className="p-6 md:p-8 flex-1 flex flex-col relative">
 
 {/* Etiqueta Superior Estricta */}
 {badge && (
 <div className="absolute top-6 right-6 z-20">
 <span className="inline-flex bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-semibold rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400 transition-colors">
 {badge}
 </span>
 </div>
 )}

 {/* Cabecera (Icono y Tendencia) */}
 <div className="flex items-start justify-between mb-8">
 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors shrink-0 shadow-sm border border-gray-100 dark:border-gray-800">
 <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" strokeWidth={2} />
 </div>
 
 {trend && (
 <div className={cn(
 "px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors duration-300",
 trend.isPositive 
 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
 : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
 )}>
 <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> {Math.abs(trend.value)}%
 </div>
 )}
 </div>

 {/* Bloque de Datos (Telemetría) */}
 <div className="space-y-2">
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors">
 {title}
 </p>
 
 {loading ? (
 <div className="h-10 rounded-xl bg-gray-100 dark:bg-[#050505] animate-pulse w-3/4 mt-2" />
 ) : (
 <p className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors leading-none">
 {value}
 </p>
 )}

 {comparison && (
 <div className="flex items-center gap-2 pt-2 transition-colors">
 <span className="text-xs font-semibold text-gray-500">{comparison.label}:</span>
 <span className="text-xs font-bold text-gray-900 dark:text-white">{comparison.value}</span>
 </div>
 )}
 
 {trend?.period && (
 <p className="text-xs font-semibold text-gray-500 transition-colors">
 VS. {trend.period}
 </p>
 )}
 </div>

  {/* Minigráfico Técnico */}
  {sparkline && renderSparkline()}

  {/* Desglose de ingresos (Breakdown) */}
 {breakdown && breakdown.length > 0 && (
 <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 w-full space-y-3">
 {breakdown.map((item, idx) => (
 <div key={idx} className="flex items-center justify-between transition-colors">
 <span className="text-sm font-semibold text-gray-500">
 {item.label}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-gray-900 dark:text-white">
 {item.value}
 </span>
 {item.percentage && (
 <span className="text-xs font-medium text-gray-400">
 ({item.percentage})
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
  </div>

 {/* Bloque Descriptivo Estructural (Legible) */}
 {description && (
 <div className="rounded-b-3xl border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-5 flex items-start gap-4 shrink-0 transition-colors">
 <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-[#0a0a0a] shadow-sm border border-gray-100">
 <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
 {description}
 </p>
 </div>
 )}
 </div>
 );
};

const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
 const { title, value, icon: Icon, trend, onClick } = props;
 const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

 return (
 <div 
 onClick={onClick}
 className={cn(
 "p-6 flex items-center justify-between rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm transition-all duration-300 group",
 "hover:-translate-y-1 hover:shadow-lg hover:border-emerald-100",
 onClick ? "cursor-pointer" : "cursor-default"
 )}
 >
 <div className="flex items-center gap-5">
 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] shadow-sm border border-gray-100 dark:border-gray-800 group-hover:bg-emerald-50 transition-colors shrink-0">
 <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-emerald-600" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors mb-1">
 {title}
 </p>
 <p className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors leading-none">
 {value}
 </p>
 </div>
 </div>

 {trend && (
 <div className={cn(
 "px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold shrink-0 ml-4 transition-colors duration-300",
 trend.isPositive 
 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400" 
 : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
 )}>
 <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> {Math.abs(trend.value)}%
 </div>
 )}
 </div>
 );
};

 const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
 return (
 <div className={cn(
 "grid gap-4", 
 columns === 1 ? "grid-cols-1" : "", 
 columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
 columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
 columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
 )}>
 {children}
 </div>
 );
};