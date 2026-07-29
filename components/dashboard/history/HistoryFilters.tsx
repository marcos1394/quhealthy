"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Filter,
  ListFilter,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOptions {
  dateRange: string;
  type: string;
  status: string;
}

interface HistoryFiltersProps {
  searchTerm: string;
  filters: FilterOptions;
  serviceTypes: string[];
  onSearchTermChange: (term: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount?: number;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  searchTerm,
  filters,
  serviceTypes,
  onSearchTermChange,
  onFiltersChange,
  resultCount,
}) => {
  const t = useTranslations("DashboardHistory");

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange && filters.dateRange !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const handleResetFilters = () => {
    onFiltersChange({ dateRange: "all", type: "all", status: "all" });
    onSearchTermChange("");
  };

  const handleClearSearch = () => onSearchTermChange("");

  const getFilterLabel = (key: keyof FilterOptions, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      dateRange: {
        all: t("filter_period_all"),
        today: t("filter_period_today"),
        week: t("filter_period_week"),
        month: t("filter_period_month"),
        year: t("filter_period_year"),
      },
      status: {
        all: t("filter_status_all"),
        completed: t("filter_status_completed"),
        cancelled: t("filter_status_cancelled"),
        rescheduled: t("filter_status_rescheduled"),
      },
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="flex flex-col w-full space-y-3 font-sans transition-colors">
      {/* ── PANEL DE FILTROS EN GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            placeholder={t("search_placeholder")}
            className="w-full h-11 pl-10 pr-10 bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Rango de Fechas */}
        <div>
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, dateRange: value })
            }
          >
            <SelectTrigger className="w-full h-11 bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-emerald-500/20 shadow-2xs">
              <div className="flex items-center gap-2.5 truncate">
                <Calendar
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  strokeWidth={2}
                />
                <SelectValue placeholder={t("filter_period")} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden font-sans">
              <SelectItem value="all" className="text-xs font-semibold cursor-pointer">
                {t("filter_period_all")}
              </SelectItem>
              <SelectItem value="today" className="text-xs font-semibold cursor-pointer">
                {t("filter_period_today")}
              </SelectItem>
              <SelectItem value="week" className="text-xs font-semibold cursor-pointer">
                {t("filter_period_week")}
              </SelectItem>
              <SelectItem value="month" className="text-xs font-semibold cursor-pointer">
                {t("filter_period_month")}
              </SelectItem>
              <SelectItem value="year" className="text-xs font-semibold cursor-pointer">
                {t("filter_period_year")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Servicio */}
        <div>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
          >
            <SelectTrigger className="w-full h-11 bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-emerald-500/20 shadow-2xs">
              <div className="flex items-center gap-2.5 truncate">
                <ListFilter
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  strokeWidth={2}
                />
                <SelectValue placeholder={t("filter_service")} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden font-sans">
              <SelectItem value="all" className="text-xs font-semibold cursor-pointer">
                {t("filter_service_all")}
              </SelectItem>
              {serviceTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-xs font-semibold cursor-pointer"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value })
            }
          >
            <SelectTrigger className="w-full h-11 bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-emerald-500/20 shadow-2xs">
              <div className="flex items-center gap-2.5 truncate">
                <Filter
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  strokeWidth={2}
                />
                <SelectValue placeholder={t("filter_status")} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden font-sans">
              <SelectItem value="all" className="text-xs font-semibold cursor-pointer">
                {t("filter_status_all")}
              </SelectItem>
              <SelectItem value="completed" className="text-xs font-semibold cursor-pointer">
                {t("filter_status_completed")}
              </SelectItem>
              <SelectItem value="cancelled" className="text-xs font-semibold cursor-pointer">
                {t("filter_status_cancelled")}
              </SelectItem>
              <SelectItem value="rescheduled" className="text-xs font-semibold cursor-pointer">
                {t("filter_status_rescheduled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── BARRA DE ESTADO DE FILTROS ACTIVOS ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("active_filters")}:</span>
          </div>

          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-2xs">
                  <Search className="w-3 h-3" strokeWidth={2} />
                  <span className="max-w-[150px] truncate">{searchTerm}</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}

            {filters.dateRange !== "all" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-2xs">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  <span>{getFilterLabel("dateRange", filters.dateRange)}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange({ ...filters, dateRange: "all" })
                    }
                    className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}

            {filters.type !== "all" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-2xs">
                  <ListFilter className="w-3 h-3" strokeWidth={2} />
                  <span className="max-w-[150px] truncate">{filters.type}</span>
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, type: "all" })}
                    className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}

            {filters.status !== "all" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-2xs">
                  <Filter className="w-3 h-3" strokeWidth={2} />
                  <span>{getFilterLabel("status", filters.status)}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange({ ...filters, status: "all" })
                    }
                    className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-7 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={2} />
                <span>{t("clear_filters")}</span>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Contador de Resultados */}
        {resultCount !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:block font-mono"
          >
            <span className="text-gray-900 dark:text-white font-bold">
              {resultCount}
            </span>{" "}
            {resultCount !== 1 ? t("results") : t("result")}
          </motion.div>
        )}
      </div>
    </div>
  );
};