"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageSearch } from "lucide-react";

export function EmptyPackages() {
  const t = useTranslations("PatientPackages");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-[#0a0a0a] text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-2xs font-sans transition-colors select-none">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
        <PackageSearch className="w-8 h-8" strokeWidth={2} />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
        {t("empty_title")}
      </h3>

      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
        {t("empty_desc")}
      </p>
    </div>
  );
}