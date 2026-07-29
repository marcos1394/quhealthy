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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaz para la métrica basada en el backend
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

// Mapeo semántico de íconos y paleta cromática Soft Health Tech
const getIconData = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "heart.fill":
      return {
        icon: Heart,
        colorClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30",
      };
    case "drop.fill":
      return {
        icon: Droplet,
        colorClass: "text-cyan-600 dark:text-cyan-400",
        bgClass: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/30",
      };
    case "figure.walk":
      return {
        icon: Activity,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
      };
    case "scalemass":
      return {
        icon: Scale,
        colorClass: "text-indigo-600 dark:text-indigo-400",
        bgClass: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30",
      };
    case "thermometer":
      return {
        icon: Thermometer,
        colorClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
      };
    case "moon.fill":
      return {
        icon: Moon,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/30",
      };
    default:
      return {
        icon: Activity,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
      };
  }
};

export function HealthMetricsCarousel({
  metrics,
  isLoading,
  onMetricClick,
}: HealthMetricsCarouselProps) {
  const t = useTranslations("PatientDashboard.telemetry");

  if (!isLoading && (!metrics || metrics.length === 0)) {
    return null;
  }

  return (
    <div className="w-full font-sans transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-1 tracking-tight">
        {t("title")}
      </h3>

      {/* Contenedor Grid Soft Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          /* Skeleton Loader */
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[160px] animate-pulse p-5 sm:p-6 shadow-2xs space-y-4"
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
              const { icon: Icon, colorClass, bgClass } = getIconData(metric.icon);
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
                    "group cursor-pointer rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex flex-col justify-between min-h-[160px] shadow-2xs transition-all duration-200 hover:shadow-md hover:border-emerald-500/30 select-none",
                    isEmpty ? "opacity-60" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 border shadow-2xs",
                        bgClass,
                        colorClass
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    {metric.recommendedFrequency && (
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
                        {metric.recommendedFrequency}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
                      {metric.title}
                    </p>
                    <h4
                      className={cn(
                        "text-2xl font-bold font-mono tracking-tight truncate",
                        isEmpty
                          ? "text-gray-300 dark:text-gray-600"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {isEmpty ? t("not_registered") : metric.value}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium truncate">
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