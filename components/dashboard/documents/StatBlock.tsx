"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatBlockProps {
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
  label,
  value,
  icon,
  trend,
  trendDirection,
  description,
  onClick,
  isLoading = false,
  color = "medical",
  size = "md",
  animationDelay = 0,
}) => {
  const getTrendInfo = () => {
    if (trend === undefined || trend === null) return null;

    let dir = trendDirection;
    if (!dir && typeof trend === "number") {
      dir = trend > 0 ? "up" : trend < 0 ? "down" : "neutral";
    } else if (!dir && typeof trend === "string") {
      dir = trend.includes("+")
        ? "up"
        : trend.includes("-")
        ? "down"
        : "neutral";
    }

    const configs = {
      up: {
        icon: <TrendingUp className="w-3 h-3" strokeWidth={2.5} />,
        className:
          "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40",
        label: typeof trend === "number" ? `+${trend}%` : trend,
      },
      down: {
        icon: <TrendingDown className="w-3 h-3" strokeWidth={2.5} />,
        className:
          "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40",
        label: typeof trend === "number" ? `${trend}%` : trend,
      },
      neutral: {
        icon: <Minus className="w-3 h-3" strokeWidth={2.5} />,
        className:
          "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        label: typeof trend === "number" ? `${trend}%` : trend,
      },
    };

    return configs[dir || "neutral"];
  };

  const trendInfo = getTrendInfo();

  const colorConfigs = {
    medical: {
      icon: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
    },
    emerald: {
      icon: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
    },
    blue: {
      icon: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
    },
    amber: {
      icon: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
    },
  };

  const cc = colorConfigs[color];

  const sizeConfigs = {
    sm: { card: "p-4", value: "text-lg sm:text-xl", icon: "w-9 h-9 rounded-xl" },
    md: { card: "p-5 sm:p-6", value: "text-2xl sm:text-3xl", icon: "w-11 h-11 rounded-2xl" },
    lg: { card: "p-6 sm:p-7", value: "text-3xl sm:text-4xl", icon: "w-13 h-13 rounded-2xl" },
  };

  const sc = sizeConfigs[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay, ease: "easeOut" }}
      className="h-full font-sans"
    >
      <Card
        className={cn(
          "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl shadow-xs transition-all h-full overflow-hidden",
          onClick &&
            "cursor-pointer hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-0.5"
        )}
        onClick={onClick}
      >
        <CardContent className={cn("relative flex flex-col justify-between h-full", sc.card)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                {label}
              </p>

              <div className="flex items-baseline gap-2 flex-wrap">
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ) : (
                  <motion.h3
                    className={cn(
                      "font-bold text-gray-900 dark:text-white tracking-tight font-mono",
                      sc.value
                    )}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      delay: animationDelay + 0.1,
                    }}
                  >
                    {value}
                  </motion.h3>
                )}

                {trendInfo && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: animationDelay + 0.2 }}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs",
                      trendInfo.className
                    )}
                  >
                    {trendInfo.icon}
                    <span>{trendInfo.label}</span>
                  </motion.div>
                )}
              </div>

              {description && !isLoading && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 pt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: animationDelay + 0.1,
              }}
              className={cn(
                "border flex items-center justify-center shrink-0 shadow-xs",
                sc.icon,
                cc.bg
              )}
            >
              <div className={cc.icon}>{icon}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StatBlockGrid: React.FC<{
  stats: Array<Omit<StatBlockProps, "animationDelay">>;
  columns?: 1 | 2 | 3 | 4;
}> = ({ stats, columns = 4 }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 font-sans", gridCols[columns])}>
      {stats.map((s, i) => (
        <StatBlock key={s.label} {...s} animationDelay={i * 0.08} />
      ))}
    </div>
  );
};

export const StatBlockCompact: React.FC<StatBlockProps> = (props) => (
  <StatBlock {...props} size="sm" />
);