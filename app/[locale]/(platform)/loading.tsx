"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function PlatformLoading() {
  const t = useTranslations("PlatformLayout");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] font-sans transition-colors duration-500 selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <QhSpinner size="lg" />

      {/* Texto de carga */}
      <div className="text-center mt-6 mb-10 space-y-1">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {t("loading_title")}
        </h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("loading_subtitle")}
        </p>
      </div>

      {/* Dashboard Skeleton */}
      <div className="w-full max-w-5xl px-6 md:px-8 pointer-events-none">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="h-7 w-48 bg-gray-200/70 dark:bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-gray-200/70 dark:bg-gray-800/60 rounded-2xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-200/70 dark:bg-gray-800/60 rounded-xl animate-pulse delay-75" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-32 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-8 w-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl" />
          </div>
          <div className="h-32 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse delay-75 flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-8 w-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl" />
          </div>
          <div className="h-32 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse delay-150 flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-8 w-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl" />
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="h-64 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse delay-300">
          <div className="h-5 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6" />
          <div className="space-y-3">
            <div className="h-14 w-full bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800" />
            <div className="h-14 w-full bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800" />
            <div className="h-14 w-full bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}