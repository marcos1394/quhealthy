"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(
  () => import("@/components/intelligence/NationalHealthcareMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          SINTETIZANDO CARTOGRAFÍA...
        </p>
      </div>
    ),
  },
);

export function MapWrapper() {
  return <DynamicMap />;
}
