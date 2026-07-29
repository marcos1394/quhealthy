"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function AppointmentHeader({
  appointmentId,
  statusLabel,
  badgeClass,
}: {
  appointmentId: number | string;
  statusLabel: string;
  badgeClass: string;
}) {
  const router = useRouter();
  const t = useTranslations("AppointmentDetails.header");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800 font-sans">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center shrink-0"
          title={t("back")}
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[10px] font-bold font-mono">
              {t("folio", { id: appointmentId })}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                badgeClass
              )}
            >
              {statusLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h1>
        </div>
      </div>
    </div>
  );
}