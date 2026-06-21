"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Info, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Mantenido por compatibilidad, pero forzaremos alto contraste
  bgColor?: string; // Mantenido por compatibilidad
  borderColor?: string; // Mantenido por compatibilidad
  trend?: { value: number; isPositive: boolean; period?: string };
  comparison?: { label: string; value: string };
  description?: string;
  onClick?: () => void;
  loading?: boolean;
  badge?: string;
  sparkline?: number[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title, value, icon: Icon,
  trend, comparison, description, onClick, loading = false, badge, sparkline
}) => {

  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end gap-1 h-10 mt-6 border-b border-black dark:border-white pb-1">
        {sparkline.map((point, index) => {
          const height = Math.max(((point - min) / range) * 100, 5); // Asegura un mínimo de altura
          return (
            <div 
              key={index} 
              style={{ height: `${height}%` }}
              className={cn(
                "flex-1 border border-black dark:border-white transition-all duration-300",
                trend?.isPositive 
                  ? "bg-black dark:bg-white" 
                  : "bg-gray-300 dark:bg-gray-700"
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
        "h-full flex flex-col bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transition-all duration-200",
        onClick ? "cursor-pointer hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none" : ""
      )}
    >
      <div className="p-6 md:p-8 flex-1 flex flex-col relative">
        
        {/* Etiqueta Superior */}
        {badge && (
          <div className="absolute top-4 right-4 z-20">
            <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
              {badge}
            </span>
          </div>
        )}

        {/* Cabecera de Tarjeta (Icono y Tendencia) */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
            <Icon className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          
          {trend && (
            <div className={cn(
              "border border-black dark:border-white px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest",
              trend.isPositive 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} /> {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Bloque de Datos */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {title}
          </p>
          
          {loading ? (
            <div className="h-10 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse w-3/4" />
          ) : (
            <p className="text-4xl lg:text-5xl font-black tracking-tighter text-black dark:text-white leading-none">
              {value}
            </p>
          )}

          {comparison && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{comparison.label}:</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">{comparison.value}</span>
            </div>
          )}
          
          {trend?.period && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              VS. {trend.period}
            </p>
          )}
        </div>

        {/* Minigráfico Técnico */}
        {sparkline && renderSparkline()}
      </div>

      {/* Bloque Descriptivo Estructural */}
      {description && (
        <div className="border-t border-black dark:border-white bg-gray-50 dark:bg-[#050505] p-4 flex items-start gap-3 shrink-0">
          <Info className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={1.5} />
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
  const { title, value, icon: Icon, trend, onClick } = props;
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-5 flex items-center justify-between border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-all duration-200",
        onClick ? "cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" : ""
      )}
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
          <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-black tracking-tighter text-black dark:text-white leading-none">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div className={cn(
          "border border-black dark:border-white px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest shrink-0 ml-4",
          trend.isPositive 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} /> {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
  return (
    <div className={cn(
      "grid gap-6 md:gap-8",
      columns === 1 ? "grid-cols-1" : "", 
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
      columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
    )}>
      {children}
    </div>
  );
};