"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { Filter, X, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";

import { useBIStore } from "@/store/intelligence.store";

export function QueryBuilder() {
  const t = useTranslations("Intelligence.QueryBuilder");
  const { filters, groupBy, setFilter, setGroupBy, clearFilters } =
    useBIStore();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xs mb-8 flex flex-col font-sans transition-all select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* ── DIMENSIÓN DE AGRUPACIÓN (GROUP BY) ────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight whitespace-nowrap">
              {t("group_by_label")}
            </label>
          </div>

          <div className="relative flex-1 sm:w-64">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full h-11 pl-4 pr-10 appearance-none bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-2xs transition-all"
            >
              <option value="entidad" className="bg-white dark:bg-[#0a0a0a]">
                {t("opt_entidad")}
              </option>
              <option
                value="nombre_institucion"
                className="bg-white dark:bg-[#0a0a0a]"
              >
                {t("opt_institucion")}
              </option>
              <option
                value="nivel_atencion"
                className="bg-white dark:bg-[#0a0a0a]"
              >
                {t("opt_nivel")}
              </option>
              <option
                value="nombre_tipo_establecimiento"
                className="bg-white dark:bg-[#0a0a0a]"
              >
                {t("opt_tipo")}
              </option>
            </select>
            <ChevronDown
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* ── INSIGNIAS DE FILTROS ACTIVOS ───────────────────────────────── */}
        <div className="flex items-center gap-2.5 flex-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
          {activeFilterCount > 0 ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shrink-0 shadow-2xs">
                <Filter className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("active_filters", { count: activeFilterCount })}</span>
              </div>

              {filters.estado && (
                <Badge
                  label={t("badge_estado")}
                  value={filters.estado}
                  onRemove={() => setFilter("estado", undefined)}
                />
              )}
              {filters.institucion && (
                <Badge
                  label={t("badge_institucion")}
                  value={filters.institucion}
                  onRemove={() => setFilter("institucion", undefined)}
                />
              )}
              {filters.nivel && (
                <Badge
                  label={t("badge_nivel")}
                  value={filters.nivel}
                  onRemove={() => setFilter("nivel", undefined)}
                />
              )}
              {filters.tipo && (
                <Badge
                  label={t("badge_tipo")}
                  value={filters.tipo}
                  onRemove={() => setFilter("tipo", undefined)}
                />
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-auto lg:ml-2 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("clear_all")}</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 lg:ml-auto">
              {t("hint_no_filters")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap shrink-0 shadow-2xs">
      <span className="text-gray-400 font-medium">{label}:</span> {value}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" strokeWidth={2} />
      </button>
    </span>
  );
}