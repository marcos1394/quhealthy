"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

export const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
  const { title, value, icon: Icon, trend, onClick } = props;
  const TrendIcon = trend?.isPositive
    ? TrendingUp
    : trend
    ? TrendingDown
    : Minus;

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
        "p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all duration-200 flex items-center justify-between shadow-2xs font-sans select-none",
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