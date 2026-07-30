"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { Tag, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const PRESETS = [500, 1000, 2000, 5000];

export function PriceFilter() {
  const t = useTranslations("Discover.PriceFilter");
  const { filters, setFilter } = useDiscoverFilters();
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.maxPrice ? String(filters.maxPrice) : ""
  );

  useEffect(() => {
    if (filters.maxPrice !== undefined) {
      setMaxPrice(String(filters.maxPrice));
    } else {
      setMaxPrice("");
    }
  }, [filters.maxPrice]);

  return (
    <div className="space-y-4 font-sans transition-colors">
      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
        {t("title")}
      </span>

      {/* Presets Rápidos */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const isSelected = filters.maxPrice === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setMaxPrice(String(p));
                setFilter("maxPrice", p);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer shadow-2xs",
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
              )}
            >
              ${p.toLocaleString()}
            </button>
          );
        })}
      </div>

      {/* Control Deslizante (Slider) */}
      <div className="pt-3 pb-1 px-1 space-y-2">
        <Slider
          value={[maxPrice ? Number(maxPrice) : 5000]}
          max={10000}
          step={100}
          onValueChange={(val) => {
            setMaxPrice(String(val[0]));
          }}
          onValueCommit={(val) => {
            setFilter("maxPrice", val[0]);
          }}
          className="w-full"
        />
        <div className="flex justify-between items-center text-[11px] font-mono font-bold text-gray-400">
          <span>{t("zero_price")}</span>
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            ${Number(maxPrice || 5000).toLocaleString()}
          </span>
          <span>{t("max_price")}</span>
        </div>
      </div>

      {/* Casilla de Verificación: Solo Ofertas */}
      <label className="flex items-center gap-2.5 cursor-pointer group pt-1 select-none">
        <div
          className={cn(
            "w-4 h-4 rounded-md border flex items-center justify-center transition-all shadow-2xs shrink-0",
            filters.hasDiscount
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 group-hover:border-emerald-500/50"
          )}
        >
          <input
            type="checkbox"
            checked={!!filters.hasDiscount}
            onChange={(e) => setFilter("hasDiscount", e.target.checked)}
            className="sr-only"
          />
          {filters.hasDiscount && (
            <Check className="w-3 h-3 stroke-[3]" strokeWidth={3} />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("only_discounts")}
          </span>
        </div>
      </label>
    </div>
  );
}