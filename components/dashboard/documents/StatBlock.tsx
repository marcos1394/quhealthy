"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBlockProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string | number;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
  onClick?: () => void;
  isLoading?: boolean;
  color?: "medical" | "blue" | "emerald" | "amber";
  size?: "sm" | "md" | "lg";
  animationDelay?: number;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  label, value, icon, trend, trendDirection, description, onClick,
  isLoading = false, color = "medical", size = "md", animationDelay = 0
}) => {
  const getTrendInfo = () => {
    if (!trend) return null;
    let dir = trendDirection;
    if (!dir && typeof trend === "number") dir = trend > 0 ? "up" : trend < 0 ? "down" : "neutral";
    else if (!dir && typeof trend === "string") dir = trend.includes("+") ? "up" : trend.includes("-") ? "down" : "neutral";
    const configs = {
      up: { icon: <TrendingUp className="w-2.5 h-2.5" />, className: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: typeof trend === "number" ? `+${trend}%` : trend },
      down: { icon: <TrendingDown className="w-2.5 h-2.5" />, className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: typeof trend === "number" ? `${trend}%` : trend },
      neutral: { icon: <Minus className="w-2.5 h-2.5" />, className: "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700", label: typeof trend === "number" ? `${trend}%` : trend }
    };
    return configs[dir || "neutral"];
  };

  const trendInfo = getTrendInfo();

  const colorConfigs = {
    medical: { icon: "text-medical-600 dark:text-medical-400", bg: "bg-medical-50 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/20" },
    blue: { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" },
    emerald: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
    amber: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" }
  };

  const cc = colorConfigs[color];
  const sizeConfigs = {
    sm: { card: "p-3.5", value: "text-xl", icon: "p-2 w-9 h-9" },
    md: { card: "p-5", value: "text-2xl", icon: "p-2.5 w-10 h-10" },
    lg: { card: "p-6", value: "text-3xl", icon: "p-3 w-12 h-12" }
  };
  const sc = sizeConfigs[size];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: animationDelay }} className="h-full">
      <Card className={cn("bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all h-full", onClick && "cursor-pointer hover:border-medical-200 dark:hover:border-medical-500/20")} onClick={onClick}>
        <CardContent className={cn("relative", sc.card)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
              <div className="flex items-baseline gap-2 mb-1">
                {isLoading ? (
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : (
                  <motion.h3 className={cn("font-semibold text-slate-900 dark:text-white tracking-tight", sc.value)}
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: animationDelay + 0.2 }}>
                    {value}
                  </motion.h3>
                )}
                {trendInfo && !isLoading && (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: animationDelay + 0.3 }}
                    className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium border", trendInfo.className)}>
                    {trendInfo.icon}<span>{trendInfo.label}</span>
                  </motion.div>
                )}
              </div>
              {description && !isLoading && <p className="text-xs text-slate-400 font-light line-clamp-2">{description}</p>}
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: animationDelay + 0.1 }}
              className={cn("rounded-xl border flex items-center justify-center flex-shrink-0", sc.icon, cc.bg)}>
              <div className={cc.icon}>{icon}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StatBlockGrid: React.FC<{ stats: Array<Omit<StatBlockProps, "animationDelay">>; columns?: 1 | 2 | 3 | 4 }> = ({ stats, columns = 4 }) => {
  const gridCols = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" };
  return (<div className={cn("grid gap-3", gridCols[columns])}>{stats.map((s, i) => <StatBlock key={s.label} {...s} animationDelay={i * 0.1} />)}</div>);
};

export const StatBlockCompact: React.FC<StatBlockProps> = (props) => <StatBlock {...props} size="sm" />;