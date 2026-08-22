"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarCheck,
  FileText,
  Pill,
  ShoppingBag,
  Clock,
  ArrowRight,
  Activity,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string | number;
  type: "APPOINTMENT" | "PRESCRIPTION" | "DOCUMENT" | "ORDER";
  title: string;
  subtitle?: string;
  date: string;
  link?: string;
}

interface PatientActivityTimelineProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  locale?: string;
}

export function PatientActivityTimeline({
  activities = [],
  isLoading = false,
  locale = "es",
}: PatientActivityTimelineProps) {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.Timeline");
  const dateLocale = locale === "en" ? enUS : es;

  const getActivityVisuals = (type: ActivityItem["type"]) => {
    switch (type) {
      case "APPOINTMENT":
        return {
          icon: CalendarCheck,
          colorClass: "text-emerald-600 dark:text-emerald-400",
          bgClass: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
          cardBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
          label: t("event_appointment"),
        };
      case "PRESCRIPTION":
        return {
          icon: Pill,
          colorClass: "text-cyan-600 dark:text-cyan-400",
          bgClass: "bg-cyan-500 text-white shadow-md shadow-cyan-500/20",
          cardBg: "hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20",
          label: t("event_prescription"),
        };
      case "DOCUMENT":
        return {
          icon: FileText,
          colorClass: "text-indigo-600 dark:text-indigo-400",
          bgClass: "bg-indigo-500 text-white shadow-md shadow-indigo-500/20",
          cardBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
          label: t("event_document"),
        };
      case "ORDER":
        return {
          icon: ShoppingBag,
          colorClass: "text-purple-600 dark:text-purple-400",
          bgClass: "bg-purple-500 text-white shadow-md shadow-purple-500/20",
          cardBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
          label: t("event_order"),
        };
      default:
        return {
          icon: Activity,
          colorClass: "text-gray-600 dark:text-gray-400",
          bgClass: "bg-gray-600 text-white shadow-md",
          cardBg: "hover:bg-gray-50 dark:hover:bg-[#141414]",
          label: "Actividad",
        };
    }
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-gray-50/90 via-white to-gray-50/50 dark:from-[#0a0a0a] dark:via-[#0c0c0c] dark:to-[#070707] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs font-sans select-none space-y-6 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{t("section_title")}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs"
        >
          <span>{t("view_all_history")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-[#141414] shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-1/3 h-3 bg-gray-100 dark:bg-[#141414] rounded-full" />
                <div className="w-1/2 h-2.5 bg-gray-100 dark:bg-[#141414] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-2.5">
          {activities.map((item) => {
            const visuals = getActivityVisuals(item.type);
            const Icon = visuals.icon;

            let formattedDate = "";
            try {
              if (item.date) {
                formattedDate = formatDistanceToNow(new Date(item.date), {
                  addSuffix: true,
                  locale: dateLocale,
                });
              }
            } catch {
              formattedDate = item.date;
            }

            return (
              <div
                key={item.id}
                onClick={() => item.link && router.push(item.link as any)}
                className={cn(
                  "p-3 sm:p-4 flex items-center justify-between gap-4 transition-all duration-200 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-800 shadow-2xs",
                  visuals.cardBg,
                  item.link ? "cursor-pointer group hover:-translate-x-0.5" : ""
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                      visuals.bgClass
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        {visuals.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-mono bg-white/80 dark:bg-[#121212] px-2.5 py-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gray-100 dark:bg-[#141414] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 mx-auto">
            <Activity className="w-6 h-6 stroke-1" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            {t("empty_title")}
          </h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            {t("empty_desc")}
          </p>
        </div>
      )}
    </div>
  );
}
