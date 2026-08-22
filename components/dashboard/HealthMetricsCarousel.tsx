"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Heart,
  Scale,
  Droplet,
  Thermometer,
  Moon,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthMetricDto {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  metricKey: string;
  lastUpdated: string;
  recommendedFrequency: string;
}

interface HealthMetricsCarouselProps {
  metrics: HealthMetricDto[];
  isLoading: boolean;
  onMetricClick?: (metricKey: string) => void;
}

const getIconData = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "heart.fill":
      return {
        icon: Heart,
        colorClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white dark:to-[#0a0a0a] border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400",
        iconBg: "bg-rose-500 text-white shadow-md shadow-rose-500/20",
      };
    case "drop.fill":
      return {
        icon: Droplet,
        colorClass: "text-cyan-600 dark:text-cyan-400",
        bgClass: "bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-white dark:to-[#0a0a0a] border-cyan-200/80 dark:border-cyan-900/40 hover:border-cyan-400",
        iconBg: "bg-cyan-500 text-white shadow-md shadow-cyan-500/20",
      };
    case "figure.walk":
      return {
        icon: Activity,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-[#0a0a0a] border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400",
        iconBg: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
      };
    case "scalemass":
      return {
        icon: Scale,
        colorClass: "text-indigo-600 dark:text-indigo-400",
        bgClass: "bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white dark:to-[#0a0a0a] border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-400",
        iconBg: "bg-indigo-500 text-white shadow-md shadow-indigo-500/20",
      };
    case "thermometer":
      return {
        icon: Thermometer,
        colorClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-[#0a0a0a] border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400",
        iconBg: "bg-amber-500 text-white shadow-md shadow-amber-500/20",
      };
    case "moon.fill":
      return {
        icon: Moon,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-white dark:to-[#0a0a0a] border-violet-200/80 dark:border-violet-900/40 hover:border-violet-400",
        iconBg: "bg-violet-500 text-white shadow-md shadow-violet-500/20",
      };
    default:
      return {
        icon: Activity,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-[#0a0a0a] border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400",
        iconBg: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
      };
  }
};

export function HealthMetricsCarousel({
  metrics,
  isLoading,
  onMetricClick,
}: HealthMetricsCarouselProps) {
  const t = useTranslations("PatientDashboard.telemetry");

  return (
    <div className="w-full font-sans transition-colors select-none space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>{t("title")}</span>
        </h3>
      </div>

      {/* Contenedor Grid Soft Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          /* Skeleton Loader */
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[170px] animate-pulse p-5 sm:p-6 shadow-2xs space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#111]" />
                <div className="w-16 h-3 rounded-full bg-gray-100 dark:bg-[#111]" />
                <div className="w-24 h-8 rounded-full bg-gray-100 dark:bg-[#111]" />
              </div>
            ))}
          </>
        ) : (
          <>
            {metrics.map((metric, index) => {
              const { icon: Icon, colorClass, bgClass, iconBg } = getIconData(metric.icon);
              const isEmpty = !metric.value || metric.value === "";

              return (
                <div
                  key={`${metric.title}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onMetricClick && onMetricClick(metric.metricKey)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onMetricClick) {
                      onMetricClick(metric.metricKey);
                    }
                  }}
                  className={cn(
                    "group cursor-pointer rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 select-none overflow-hidden",
                    bgClass,
                    isEmpty ? "opacity-75" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        iconBg
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>

                    <div className="w-7 h-7 rounded-xl bg-white/80 dark:bg-[#141414]/80 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shadow-2xs">
                      <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-gray-600 dark:text-gray-400 truncate">
                      {metric.title}
                    </p>
                    <h4
                      className={cn(
                        "text-2xl font-black font-mono tracking-tight truncate",
                        isEmpty
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {isEmpty ? t("not_registered") : metric.value}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                      {metric.subtitle}
                    </p>
                    {metric.lastUpdated && !isEmpty && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-semibold pt-1 text-right">
                        {t("updated_prefix")} {metric.lastUpdated}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}