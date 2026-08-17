"use client";

/* eslint-disable react-doctor/no-multi-comp */

import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon, TrendingUp, TrendingDown, Info, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type SummaryCardColorVariant =
  | "emerald"
  | "sky"
  | "indigo"
  | "amber"
  | "rose"
  | "violet";

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  colorVariant?: SummaryCardColorVariant;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  trend?: { value: number; isPositive: boolean; period?: string };
  comparison?: { label: string; value: string };
  statusTag?: {
    label: string;
    variant?: "success" | "warning" | "info" | "neutral";
  };
  progress?: {
    value: number;
    max?: number;
    color?: string;
  };
  description?: string;
  onClick?: () => void;
  loading?: boolean;
  badge?: string;
  sparkline?: number[];
  breakdown?: { label: string; value: string; percentage?: string }[];
}

const colorVariantStyles: Record<
  SummaryCardColorVariant,
  {
    iconBg: string;
    iconText: string;
    iconBorder: string;
    glow: string;
  }
> = {
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-100 dark:border-emerald-900/40",
    glow: "group-hover:border-emerald-300 dark:group-hover:border-emerald-800/60",
  },
  sky: {
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconText: "text-sky-600 dark:text-sky-400",
    iconBorder: "border-sky-100 dark:border-sky-900/40",
    glow: "group-hover:border-sky-300 dark:group-hover:border-sky-800/60",
  },
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconText: "text-indigo-600 dark:text-indigo-400",
    iconBorder: "border-indigo-100 dark:border-indigo-900/40",
    glow: "group-hover:border-indigo-300 dark:group-hover:border-indigo-800/60",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-100 dark:border-amber-900/40",
    glow: "group-hover:border-amber-300 dark:group-hover:border-amber-800/60",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconText: "text-rose-600 dark:text-rose-400",
    iconBorder: "border-rose-100 dark:border-rose-900/40",
    glow: "group-hover:border-rose-300 dark:group-hover:border-rose-800/60",
  },
  violet: {
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconText: "text-violet-600 dark:text-violet-400",
    iconBorder: "border-violet-100 dark:border-violet-900/40",
    glow: "group-hover:border-violet-300 dark:group-hover:border-violet-800/60",
  },
};

const statusTagStyles = {
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
  info:
    "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-900/40",
  neutral:
    "bg-gray-50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200 dark:border-gray-800",
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  colorVariant = "emerald",
  trend,
  comparison,
  statusTag,
  progress,
  description,
  onClick,
  loading = false,
  badge,
  sparkline,
  breakdown,
}) => {
  const t = useTranslations("Dashboard.SummaryCard");
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;
  const variant = colorVariantStyles[colorVariant] || colorVariantStyles.emerald;

  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-1 h-8 mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 w-full">
        {sparkline.map((point, index) => {
          const height = Math.max(((point - min) / range) * 100, 15);
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
        "h-full flex flex-col justify-between bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm transition-all duration-300 group font-sans select-none overflow-hidden",
        variant.glow,
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
          : "cursor-default"
      )}
    >
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative">
        {/* Badge Superior Absoluto (si existe) */}
        {badge && (
          <div className="absolute top-5 right-5 z-10">
            <span className="inline-flex bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full shadow-2xs">
              {badge}
            </span>
          </div>
        )}

        {/* Cabecera: Ícono + Trend/Status Tag */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform duration-300",
              variant.iconBg,
              variant.iconText,
              variant.iconBorder
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>

          {trend && (
            <div
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-mono font-bold shadow-2xs border shrink-0",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
              )}
            >
              <TrendIcon className="w-3 h-3 shrink-0" strokeWidth={2.5} />
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}

          {statusTag && !trend && (
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border shadow-2xs shrink-0",
                statusTagStyles[statusTag.variant || "neutral"]
              )}
            >
              {statusTag.label}
            </span>
          )}
        </div>

        {/* Bloque Principal de Título y Valor */}
        <div className="space-y-1">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 line-clamp-1">
            {title}
          </p>

          {loading ? (
            <div className="h-8 rounded-xl bg-gray-100 dark:bg-[#050505] animate-pulse w-3/4 my-1" />
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white leading-tight">
                {value}
              </span>
              {unit && (
                <span className="text-xs sm:text-sm font-bold text-gray-400 font-sans">
                  {unit}
                </span>
              )}
            </div>
          )}

          {/* Subtítulo / Comparativa */}
          {subtitle && (
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1 pt-0.5">
              {subtitle}
            </p>
          )}

          {comparison && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-gray-400">
              <span>{comparison.label}:</span>
              <span className="font-bold font-mono text-gray-700 dark:text-gray-300">
                {comparison.value}
              </span>
            </div>
          )}

          {trend?.period && !subtitle && (
            <p className="text-[10px] font-medium text-gray-400 pt-0.5">
              {t("vs_period", { period: trend.period })}
            </p>
          )}
        </div>

        {/* Barra de Progreso (si aplica) */}
        {progress && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold font-mono text-gray-400">
              <span>Progreso</span>
              <span>{Math.round(progress.value)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress.color || "bg-emerald-500"
                )}
                style={{ width: `${Math.min(Math.max(progress.value, 0), 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Minigráfico Sparkline */}
        {sparkline && renderSparkline()}

        {/* Desglose (Breakdown) */}
        {breakdown && breakdown.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 w-full space-y-1.5">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <span className="font-medium text-gray-500 dark:text-gray-400 truncate text-[11px]">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
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
        <div className="rounded-b-3xl border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-3.5 sm:p-4 flex items-start gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-[#0a0a0a] shadow-2xs border border-gray-100 dark:border-gray-800 text-emerald-600 dark:text-emerald-400">
            <Info className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
  const { title, value, unit, icon: Icon, colorVariant = "emerald", trend, onClick } = props;
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;
  const variant = colorVariantStyles[colorVariant] || colorVariantStyles.emerald;

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
        "p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs transition-all duration-200 flex items-center justify-between font-sans select-none",
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-0.5"
          : "cursor-default"
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border",
            variant.iconBg,
            variant.iconText,
            variant.iconBorder
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl sm:text-2xl font-bold font-mono text-gray-900 dark:text-white tracking-tight leading-none truncate">
              {value}
            </p>
            {unit && (
              <span className="text-[10px] font-bold text-gray-400 font-sans">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono shrink-0 ml-3 shadow-2xs border",
            trend.isPositive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
          )}
        >
          <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
          <span>
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
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