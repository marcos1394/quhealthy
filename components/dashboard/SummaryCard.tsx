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
        "h-full flex flex-col bg-white dark:bg-[#0a0a0a] border-b border-r border-gray-200 dark:border-gray-800 transition-colors group",
        onClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505]" : ""
      )}
    >
      <div className="p-6 md:p-8 flex-1 flex flex-col relative">
        
        {/* Etiqueta Superior Estricta */}
        {badge && (
          <div className="absolute top-6 right-6 z-20">
            <span className="border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
              {badge}
            </span>
          </div>
        )}

        {/* Cabecera (Icono y Tendencia) */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          
          {trend && (
            <div className={cn(
              "border px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest",
              trend.isPositive 
                ? "border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400" 
                : "border-red-500/30 bg-red-50/50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
            )}>
              <TrendIcon className="w-3 h-3" strokeWidth={2} /> {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Bloque de Datos (Telemetría) */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {title}
          </p>
          
          {loading ? (
            <div className="h-10 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] animate-pulse w-3/4 mt-2" />
          ) : (
            <p className="text-3xl md:text-4xl font-semibold tracking-tight text-black dark:text-white leading-none">
              {value}
            </p>
          )}

          {comparison && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{comparison.label}:</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">{comparison.value}</span>
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

      {/* Bloque Descriptivo Estructural (Legible) */}
      {description && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-5 flex items-start gap-4 shrink-0">
          <div className="w-6 h-6 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 bg-white dark:bg-[#0a0a0a]">
            <Info className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          {/* Se mantiene Sentence Case y peso ligero para máxima legibilidad */}
          <p className="text-xs font-light text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
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
        "p-6 flex items-center justify-between border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-colors group",
        onClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505]" : ""
      )}
    >
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white leading-none">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div className={cn(
          "border px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest shrink-0 ml-4",
          trend.isPositive 
            ? "border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400" 
            : "border-red-500/30 bg-red-50/50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
        )}>
          <TrendIcon className="w-3 h-3" strokeWidth={2} /> {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
  return (
    // Estructura Blueprint Grid: gap-0 con bordes Top e Izquierdo en el contenedor padre
    <div className={cn(
      "grid gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]", 
      columns === 1 ? "grid-cols-1" : "", 
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
      columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
    )}>
      {children}
    </div>
  );
};