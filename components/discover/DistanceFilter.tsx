"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const PRESETS = [5, 10, 20, 50];

export function DistanceFilter() {
  const t = useTranslations("Discover.DistanceFilter");
  const { filters, setFilter } = useDiscoverFilters();
  const [radiusKm, setRadiusKm] = useState<number>(filters.radiusKm || 50);

  useEffect(() => {
    if (filters.radiusKm !== undefined) {
      setRadiusKm(filters.radiusKm);
    } else {
      setRadiusKm(50);
    }
  }, [filters.radiusKm]);

  return (
    <div className="space-y-4 font-sans transition-colors">
      {/* Etiqueta del Filtro */}
      <div className="flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
          {t("title")}
        </span>
      </div>

      {/* Presets Rápidos */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const isSelected = filters.radiusKm === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setRadiusKm(p);
                setFilter("radiusKm", p);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer shadow-2xs",
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
              )}
            >
              {t("km_unit", { radius: p })}
            </button>
          );
        })}
      </div>

      {/* Contrenedor de Slider */}
      <div className="pt-3 pb-1 px-1 space-y-2">
        <Slider
          value={[radiusKm]}
          max={100}
          step={5}
          onValueChange={(val) => {
            setRadiusKm(val[0]);
          }}
          onValueCommit={(val) => {
            setFilter("radiusKm", val[0]);
          }}
          className="w-full"
        />

        <div className="flex justify-between items-center text-[11px] font-mono font-bold text-gray-400">
          <span>{t("zero_km")}</span>
          <span className="text-emerald-600 dark:text-emerald-400 text-xs">
            {t("km_unit", { radius: radiusKm })}
          </span>
          <span>{t("max_km")}</span>
        </div>
      </div>
    </div>
  );
}