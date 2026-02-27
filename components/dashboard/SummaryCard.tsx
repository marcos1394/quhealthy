"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Info, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  color = "text-medical-600 dark:text-medical-400",
  bgColor = "bg-medical-50 dark:bg-medical-500/10",
  borderColor = "border-slate-200 dark:border-slate-800",
  trend, comparison, description, onClick, loading = false, badge, sparkline
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTrendColor = () => trend ? (trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400") : "";
  const getTrendBgColor = () => trend ? (trend.isPositive ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10") : "";
  const getTrendBorderColor = () => trend ? (trend.isPositive ? "border-emerald-200 dark:border-emerald-500/20" : "border-red-200 dark:border-red-500/20") : "";
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    return (
      <div className="flex items-end gap-0.5 h-7 mt-2">
        {sparkline.map((point, index) => {
          const height = ((point - min) / range) * 100;
          return (
            <motion.div key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn("flex-1 rounded-t", trend?.isPositive ? "bg-emerald-500/30 dark:bg-emerald-500/20" : "bg-medical-500/30 dark:bg-medical-500/20")} />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
      onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="h-full" onClick={onClick}>
      <Card className={cn(
        "h-full shadow-sm transition-all duration-300 overflow-hidden relative group",
        "bg-white dark:bg-slate-900",
        borderColor,
        onClick ? "cursor-pointer" : "",
        isHovered ? "shadow-md" : "",
        loading ? "animate-pulse" : ""
      )}>
        {badge && (
          <div className="absolute top-3.5 right-3.5 z-20">
            <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 text-xs">{badge}</Badge>
          </div>
        )}
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3.5">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", bgColor)}>
              <Icon className={cn("w-5 h-5", color)} />
            </motion.div>
            {trend && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                <Badge variant="outline" className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5", getTrendBgColor(), getTrendBorderColor(), getTrendColor())}>
                  <TrendIcon className="w-3 h-3" />{Math.abs(trend.value)}%
                </Badge>
              </motion.div>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide uppercase">{title}</p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              {loading ? (
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                <p className="font-semibold text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight">{value}</p>
              )}
            </motion.div>
            {comparison && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>{comparison.label}:</span><span className="font-medium text-slate-700 dark:text-slate-300">{comparison.value}</span>
              </div>
            )}
            {trend?.period && <p className="text-xs text-slate-400 font-light">vs. {trend.period}</p>}
            {sparkline && renderSparkline()}
          </div>
          <AnimatePresence>
            {isHovered && description && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-2.5">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">{description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
  const { title, value, icon: Icon, color = "text-medical-600 dark:text-medical-400", bgColor = "bg-medical-50 dark:bg-medical-500/10", trend } = props;
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3.5 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("w-4 h-4", color)} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-medium">{title}</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <Badge variant="outline"
            className={cn("flex items-center gap-1 text-xs",
              trend.isPositive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20")}>
            <TrendIcon className="w-3 h-3" />{Math.abs(trend.value)}%
          </Badge>
        )}
      </div>
    </Card>
  );
};

export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
  return (
    <div className={cn("grid gap-5",
      columns === 1 ? "grid-cols-1" : "", columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
      columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
    )}>{children}</div>
  );
};