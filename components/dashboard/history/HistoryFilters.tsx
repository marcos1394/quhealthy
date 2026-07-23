"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Filter, ListFilter, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
  resultCount
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
        all: t("filter_period_all", { defaultValue: "Todos los periodos" }), 
        today: t("filter_period_today", { defaultValue: "Hoy" }), 
        week: t("filter_period_week", { defaultValue: "Esta semana" }), 
        month: t("filter_period_month", { defaultValue: "Este mes" }), 
        year: t("filter_period_year", { defaultValue: "Este año" }) 
      },
      status: { 
        all: t("filter_status_all", { defaultValue: "Cualquier estado" }), 
        completed: t("filter_status_completed", { defaultValue: "Completado" }), 
        cancelled: t("filter_status_cancelled", { defaultValue: "Anulado" }), 
        rescheduled: t("filter_status_rescheduled", { defaultValue: "Reagendado" }) 
      }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="flex flex-col w-full space-y-3 font-sans">
      
      {/* PANEL DE FILTROS EN GRID CONTENIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Buscador (Input 1) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <Input
            placeholder={t("search_placeholder", { defaultValue: "Buscar por ID o concepto..." })}
            className="w-full h-11 pl-10 pr-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal shadow-sm"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Rango de Fechas (Select 2) */}
        <div>
          <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}>
            <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm">
              <div className="flex items-center gap-2.5 truncate">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <SelectValue placeholder={t("filter_period", { defaultValue: "Periodo" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <SelectItem value="all" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_period_all", { defaultValue: "Todos los periodos" })}</SelectItem>
              <SelectItem value="today" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_period_today", { defaultValue: "Hoy" })}</SelectItem>
              <SelectItem value="week" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_period_week", { defaultValue: "Esta semana" })}</SelectItem>
              <SelectItem value="month" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_period_month", { defaultValue: "Este mes" })}</SelectItem>
              <SelectItem value="year" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_period_year", { defaultValue: "Este año" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Servicio (Select 3) */}
        <div>
          <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
            <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm">
              <div className="flex items-center gap-2.5 truncate">
                <ListFilter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <SelectValue placeholder={t("filter_service", { defaultValue: "Concepto" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <SelectItem value="all" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_service_all", { defaultValue: "Todos los conceptos" })}</SelectItem>
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type} className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado (Select 4) */}
        <div>
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
            <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm">
              <div className="flex items-center gap-2.5 truncate">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <SelectValue placeholder={t("filter_status", { defaultValue: "Estado" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <SelectItem value="all" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_status_all", { defaultValue: "Cualquier estado" })}</SelectItem>
              <SelectItem value="completed" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_status_completed", { defaultValue: "Completado" })}</SelectItem>
              <SelectItem value="cancelled" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_status_cancelled", { defaultValue: "Anulado" })}</SelectItem>
              <SelectItem value="rescheduled" className="text-xs font-semibold rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400">{t("filter_status_rescheduled", { defaultValue: "Reagendado" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* BARRA DE ESTADO DE FILTROS ACTIVOS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("active_filters", { defaultValue: "Filtros activos" })}:</span>
          </div>
          
          <AnimatePresence>
            {searchTerm && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-sm">
                  <Search className="w-3 h-3" strokeWidth={2} />
                  <span className="max-w-[150px] truncate">{searchTerm}</span>
                  <button type="button" onClick={handleClearSearch} className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}
            
            {filters.dateRange !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-sm">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  <span>{getFilterLabel("dateRange", filters.dateRange)}</span>
                  <button type="button" onClick={() => onFiltersChange({ ...filters, dateRange: "all" })} className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}
            
            {filters.type !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-sm">
                  <ListFilter className="w-3 h-3" strokeWidth={2} />
                  <span className="max-w-[150px] truncate">{filters.type}</span>
                  <button type="button" onClick={() => onFiltersChange({ ...filters, type: "all" })} className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}
            
            {filters.status !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-sm">
                  <Filter className="w-3 h-3" strokeWidth={2} />
                  <span>{getFilterLabel("status", filters.status)}</span>
                  <button type="button" onClick={() => onFiltersChange({ ...filters, status: "all" })} className="ml-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 transition-colors">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              </motion.div>
            )}
            
            {activeFiltersCount > 0 && (
              <button 
                type="button"
                onClick={handleResetFilters}
                className="h-7 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={2} />
                <span>{t("clear_filters", { defaultValue: "Limpiar todo" })}</span>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Contador de Resultados */}
        {resultCount !== undefined && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:block">
            <span className="text-gray-900 dark:text-white font-bold">{resultCount}</span> {resultCount !== 1 ? t("results", { defaultValue: "registros encontrados" }) : t("result", { defaultValue: "registro encontrado" })}
          </motion.div>
        )}
      </div>

    </div>
  );
};