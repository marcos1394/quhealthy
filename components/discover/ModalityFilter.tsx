"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";

import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";
import { cn } from "@/lib/utils";

export function ModalityFilter() {
  const t = useTranslations("Discover.ModalityFilter");
  const { filters, setFilter } = useDiscoverFilters();

  const options = [
    { label: t("opt_any"), value: "" },
    { label: t("opt_in_person"), value: "IN_PERSON" },
    { label: t("opt_online"), value: "ONLINE" },
    { label: t("opt_hybrid"), value: "HYBRID" },
  ];

  return (
    <div className="space-y-3 font-sans transition-colors">
      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
        {t("title")}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive =
            filters.modality === opt.value ||
            (!filters.modality && opt.value === "");
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter("modality", opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs",
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}