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
      <div className="flex items-end gap-[3px] h-10 mt-4 border-b border-black dark:border-white pb-1">
        {sparkline.map((point, index) => {
          const height = Math.max(((point - min) / range) * 100, 8); 
          return (
            <div 
              key={index} 
              style={{ height: `${height}%` }}
              className={cn(
                "flex-1 transition-all duration-300", // 🔥 Quitamos el border para limpiar el ruido visual
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
        "h-full flex flex-col bg-white dark:bg-[#0a0a0a] border border-black dark:border-white transition-all duration-200",
        // 🔥 Sombra reducida a 4px para métricas (reservar 8px para alertas críticas)
        onClick ? "cursor-pointer shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]" : ""
      )}
    >
      <div className="p-5 md:p-6 flex-1 flex flex-col relative">
        
        {/* Etiqueta Superior */}
        {badge && (
          <div className="absolute top-4 right-4 z-20">
            <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {badge}
            </span>
          </div>
        )}

        {/* Cabecera (Icono y Tendencia) */}
        <div className="flex items-start justify-between mb-6">
          {/* 🔥 Icono reducido (de 14 a 10) para mejor proporción */}
          <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
            <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          
          {trend && (
            <div className={cn(
              "border border-black dark:border-white px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold",
              trend.isPositive 
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            )}>
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} /> {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Bloque de Datos */}
        <div className="space-y-1.5">
          {/* 🔥 Tipografía más legible (xs en lugar de 10px, tracking normal en lugar de widest) */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>
          
          {loading ? (
            <div className="h-9 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse w-3/4 mt-2" />
          ) : (
            // 🔥 Tamaño de valor ligeramente reducido para que no rompa el grid en móviles
            <p className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white leading-none">
              {value}
            </p>
          )}

          {comparison && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-gray-500">{comparison.label}:</span>
              <span className="text-[11px] font-bold text-black dark:text-white">{comparison.value}</span>
            </div>
          )}
          
          {trend?.period && (
            // 🔥 Quitado el "VS." en mayúsculas y mejorado el tamaño para legibilidad
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              vs. {trend.period}
            </p>
          )}
        </div>

        {/* Minigráfico Técnico */}
        {sparkline && renderSparkline()}
      </div>

      {/* Bloque Descriptivo Estructural */}
      {description && (
        <div className="border-t border-black dark:border-white bg-gray-50 dark:bg-[#050505] p-4 flex items-start gap-3 shrink-0">
          <Info className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          {/* 🔥 ¡CRUCIAL! Mayúsculas sostenidas en párrafos largos = ilegible. Cambiado a Sentence case y tamaño 11px */}
          <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
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
        "p-4 md:p-5 flex items-center justify-between border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-all duration-200",
        onClick ? "cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]" : ""
      )}
    >
      <div className="flex items-center gap-4">
        {/* 🔥 Icono compacto acorde al diseño */}
        <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
          <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-black tracking-tight text-black dark:text-white leading-none">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div className={cn(
          "border border-black dark:border-white px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold shrink-0 ml-4",
          trend.isPositive 
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
        )}>
          <TrendIcon className="w-3 h-3" strokeWidth={2.5} /> {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
  return (
    <div className={cn(
      "grid gap-4 md:gap-6", // 🔥 Gap ligeramente menor para acomodar las sombras reducidas
      columns === 1 ? "grid-cols-1" : "", 
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
      columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
    )}>
      {children}
    </div>
  );
};