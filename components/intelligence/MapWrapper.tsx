"use client";

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('@/components/intelligence/NationalHealthcareMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">
        Cargando mapa interactivo...
      </div>
    ) 
  }
);

export function MapWrapper() {
  return <DynamicMap />;
}
