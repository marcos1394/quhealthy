"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { ModalityFilter } from "./ModalityFilter";
import { PriceFilter } from "./PriceFilter";
import { DistanceFilter } from "./DistanceFilter";
import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function FilterPanel({
  isCollapsed = false,
  onToggle,
}: FilterPanelProps) {
  const t = useTranslations("Discover.FilterPanel");
  const searchParams = useSearchParams();
  const searchType = searchParams.get("type") || "STORE";

  const { filters, clearFilters } = useDiscoverFilters();

  const hasActiveFilters = Object.keys(filters).some((k) => {
    const val = filters[k as keyof typeof filters];
    return val !== undefined && val !== false && val !== "";
  });

  return (
    <div
      role={isCollapsed && onToggle ? "button" : undefined}
      tabIndex={isCollapsed && onToggle ? 0 : undefined}
      onClick={isCollapsed && onToggle ? onToggle : undefined}
      onKeyDown={(e) => {
        if (isCollapsed && onToggle && (e.key === "Enter" || e.key === " ")) {
          onToggle();
        }
      }}
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xs rounded-3xl sticky top-24 transition-all duration-300 font-sans select-none shrink-0",
        isCollapsed
          ? "p-3 w-[60px] flex flex-col items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] hover:border-emerald-500/30"
          : "p-5 sm:p-6 w-[280px] sm:w-[300px] space-y-5"
      )}
    >
      {/* ── HEADER DEL PANEL ────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              if (!isCollapsed) {
                e.stopPropagation();
                onToggle?.();
              }
            }}
            aria-label={isCollapsed ? t("show_filters") : t("hide_filters")}
            title={isCollapsed ? t("show_filters") : t("hide_filters")}
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-50/50 dark:bg-[#050505] hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30 text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </button>
          {!isCollapsed && (
            <h2 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
          )}
        </div>

        {!isCollapsed && hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("clear")}</span>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Divisor Separador */}
          <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />

          {/* Filtro de Modalidad: Solo Cursos, Servicios y Paquetes */}
          {["COURSE", "SERVICE", "PACKAGE"].includes(searchType) && (
            <>
              <ModalityFilter />
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />
            </>
          )}

          {/* Filtro de Precio: Todo excepto Tiendas */}
          {searchType !== "STORE" && (
            <>
              <PriceFilter />
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />
            </>
          )}

          {/* Ubicación y Distancia */}
          <div className="space-y-4">
            <DistanceFilter />
            <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("location")}
              </span>
              <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                {t("city_search_soon")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}