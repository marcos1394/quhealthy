"use client";

import dynamic from "next/dynamic";
import { QhSpinner } from "@/components/ui/QhSpinner";

const DynamicMap = dynamic(
  () => import("@/components/intelligence/NationalHealthcareMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] border border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400 animate-pulse">
          Sintetizando cartografía epidemiológica...
        </span>
      </div>
    ),
  },
);

export function MapWrapper() {
  return <DynamicMap />;
}