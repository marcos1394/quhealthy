"use client";

/* eslint-disable react-doctor/no-multi-comp */

import React from "react";
import { useTranslations } from "next-intl";
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
  title,
  value,
  icon: Icon,
  trend,
  comparison,
  description,
  onClick,
  loading = false,
  badge,
  sparkline,
  breakdown,
}) => {
  const t = useTranslations("Dashboard.SummaryCard");
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-1 h-10 mt-5 pt-2 border-t border-gray-100 dark:border-gray-800 w-full">
        {sparkline.map((point, index) => {
          const height = Math.max(((point - min) / range) * 100, 10);
          return (
            <div
              key={index}
              style={{ height: `${height}%` }}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-200",
                trend?.isPositive
                  ? "bg-emerald-200 dark:bg-emerald-900/40 group-hover:bg-emerald-500"
                  : "bg-gray-200 dark:bg-gray-800 group-hover:bg-gray-400"
              )}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
      className={cn(
        "h-full flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs transition-all duration-200 group font-sans select-none overflow-hidden",
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-0.5"
          : "cursor-default"
      )}
    >
      <div className="p-6 sm:p-8 flex-1 flex flex-col relative">
        {/* Badge Superior */}
        {badge && (
          <div className="absolute top-6 right-6 z-20">
            <span className="inline-flex bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full shadow-2xs">
              {badge}
            </span>
          </div>
        )}

        {/* Cabecera (Ícono y Tendencia) */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>

          {trend && (
            <div
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-mono font-bold shadow-2xs border",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
              )}
            >
              <TrendIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Bloque Principal de Valor */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>

          {loading ? (
            <div className="h-9 rounded-xl bg-gray-100 dark:bg-[#050505] animate-pulse w-3/4 my-1" />
          ) : (
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono tracking-tight text-gray-900 dark:text-white leading-none">
              {value}
            </p>
          )}

          {comparison && (
            <div className="flex items-center gap-1.5 pt-1 text-xs font-medium">
              <span className="text-gray-400">{comparison.label}:</span>
              <span className="font-bold font-mono text-gray-800 dark:text-gray-200">
                {comparison.value}
              </span>
            </div>
          )}

          {trend?.period && (
            <p className="text-[11px] font-semibold text-gray-400 pt-0.5 font-mono">
              {t("vs_period", { period: trend.period })}
            </p>
          )}
        </div>

        {/* Minigráfico Sparkline */}
        {sparkline && renderSparkline()}

        {/* Desglose (Breakdown) */}
        {breakdown && breakdown.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 w-full space-y-2">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 dark:text-gray-400 truncate">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                  {item.percentage && (
                    <span className="text-[10px] font-semibold text-gray-400">
                      ({item.percentage})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloque Descriptivo Inferior */}
      {description && (
        <div className="rounded-b-3xl border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 flex items-start gap-3 shrink-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-[#0a0a0a] shadow-2xs border border-gray-100 dark:border-gray-800 text-emerald-600 dark:text-emerald-400">
            <Info className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
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
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
      className={cn(
        "p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs transition-all duration-200 flex items-center justify-between font-sans select-none",
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-0.5"
          : "cursor-default"
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-gray-900 dark:text-white tracking-tight leading-none truncate">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono shrink-0 ml-3 shadow-2xs border",
            trend.isPositive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
          )}
        >
          <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{Math.abs(trend.value)}%</span>
        </span>
      )}
    </div>
  );
};

export const SummaryCardGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  className?: string;
}> = ({ children, columns = 4, className }) => {
  const columnClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 w-full font-sans",
        columnClasses[columns] || columnClasses[4],
        className
      )}
    >
      {children}
    </div>
  );
};