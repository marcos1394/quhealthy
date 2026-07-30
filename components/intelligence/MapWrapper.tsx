"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { QhSpinner } from "@/components/ui/QhSpinner";

function MapLoadingFallback() {
  const t = useTranslations("Intelligence.MapWrapper");

  return (
    <div className="w-full h-[500px] border border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 font-sans shadow-2xs">
      <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 animate-pulse">
        {t("loading")}
      </span>
    </div>
  );
}

const DynamicMap = dynamic(
  () => import("@/components/intelligence/NationalHealthcareMap"),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
);

export function MapWrapper() {
  return <DynamicMap />;
}