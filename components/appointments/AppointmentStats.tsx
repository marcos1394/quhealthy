"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Calendar, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppointmentStatsProps {
  stats: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export function AppointmentStats({ stats }: AppointmentStatsProps) {
  const t = useTranslations("PatientAppointments");

  const statCards = [
    {
      id: "total",
      label: t("stat_total"),
      value: stats.total,
      icon: Calendar,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
    },
    {
      id: "upcoming",
      label: t("stat_upcoming"),
      value: stats.upcoming,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
    },
    {
      id: "completed",
      label: t("stat_completed"),
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
    },
    {
      id: "cancelled",
      label: t("stat_cancelled"),
      value: stats.cancelled,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
      {statCards.map((card) => (
        <div
          key={card.id}
          className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md hover:border-emerald-500/30 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105",
                card.bg,
                card.color
              )}
            >
              <card.icon className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-500">
              {card.label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}