"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function OnboardingLoading() {
  const t = useTranslations("OnboardingLayout");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <QhSpinner size="lg" />

      {/* Texto de Carga */}
      <div className="mt-8 space-y-1.5 text-center z-10">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
          {t("loading_title")}
        </h3>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {t("loading_subtitle")}
        </p>
      </div>
    </div>
  );
}