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
          bgClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30",
          label: t("event_appointment"),
        };
      case "PRESCRIPTION":
        return {
          icon: Pill,
          colorClass: "text-cyan-600 dark:text-cyan-400",
          bgClass: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/30",
          label: t("event_prescription"),
        };
      case "DOCUMENT":
        return {
          icon: FileText,
          colorClass: "text-indigo-600 dark:text-indigo-400",
          bgClass: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/30",
          label: t("event_document"),
        };
      case "ORDER":
        return {
          icon: ShoppingBag,
          colorClass: "text-purple-600 dark:text-purple-400",
          bgClass: "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/30",
          label: t("event_order"),
        };
      default:
        return {
          icon: Activity,
          colorClass: "text-gray-600 dark:text-gray-400",
          bgClass: "bg-gray-50 dark:bg-[#141414] border-gray-100 dark:border-gray-800",
          label: "Actividad",
        };
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 p-6 sm:p-7 shadow-2xs font-sans select-none space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("section_title")}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{t("view_all_history")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3.5 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-[#141414] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-1/3 h-3 bg-gray-100 dark:bg-[#141414] rounded-full" />
                <div className="w-1/2 h-2.5 bg-gray-100 dark:bg-[#141414] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
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
                  "py-3.5 flex items-center justify-between gap-4 transition-colors rounded-2xl",
                  item.link ? "hover:bg-gray-50/70 dark:hover:bg-[#111] px-2.5 -mx-2.5 cursor-pointer group" : ""
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                      visuals.bgClass,
                      visuals.colorClass
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>

                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {visuals.label}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mx-auto">
            <Activity className="w-5 h-5 stroke-1" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
            {t("empty_title")}
          </h4>
          <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
            {t("empty_desc")}
          </p>
        </div>
      )}
    </div>
  );
}
