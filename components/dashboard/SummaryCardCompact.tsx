"use client";

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
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-6 flex items-center justify-between border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all duration-300 group",
        "hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white transition-colors shrink-0">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-1">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div className={cn(
          "border px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest shrink-0 ml-4 transition-colors duration-300",
          trend.isPositive 
            ? "border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white" 
            : "border-red-500/30 bg-red-50/50 text-red-600 dark:bg-red-900/10 dark:text-red-400 group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white"
        )}>
          <TrendIcon className="w-3 h-3" strokeWidth={2} /> {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};
