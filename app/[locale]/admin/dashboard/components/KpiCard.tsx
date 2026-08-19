"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  changePercent?: number;
  changePeriod?: string;
  icon: LucideIcon;
  variant?: "blue" | "emerald" | "purple" | "orange" | "rose" | "indigo" | "slate";
}

const colorMap = {
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    badge: "text-blue-700 bg-blue-50",
  },
  emerald: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    badge: "text-emerald-700 bg-emerald-50",
  },
  purple: {
    border: "border-l-purple-500",
    iconBg: "bg-purple-50 text-purple-600",
    badge: "text-purple-700 bg-purple-50",
  },
  orange: {
    border: "border-l-orange-500",
    iconBg: "bg-orange-50 text-orange-600",
    badge: "text-orange-700 bg-orange-50",
  },
  rose: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
    badge: "text-rose-700 bg-rose-50",
  },
  indigo: {
    border: "border-l-indigo-500",
    iconBg: "bg-indigo-50 text-indigo-600",
    badge: "text-indigo-700 bg-indigo-50",
  },
  slate: {
    border: "border-l-slate-400",
    iconBg: "bg-slate-100 text-slate-700",
    badge: "text-slate-700 bg-slate-100",
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  changePercent,
  changePeriod = "vs mes anterior",
  icon: Icon,
  variant = "slate",
}) => {
  const colors = colorMap[variant];

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${colors.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {changePercent !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                changePercent >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`}
            </span>
            <span className="text-slate-400">{changePeriod}</span>
          </div>
        ) : subtext ? (
          <span className="text-slate-500 font-medium">{subtext}</span>
        ) : null}
      </div>
    </div>
  );
};
