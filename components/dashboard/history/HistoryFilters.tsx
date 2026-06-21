"use client";

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
  searchTerm, filters, serviceTypes, onSearchTermChange, onFiltersChange, resultCount
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
      dateRange: { all: t("filter_period_all", { defaultValue: "TODOS LOS PERIODOS" }), today: t("filter_period_today", { defaultValue: "HOY" }), week: t("filter_period_week", { defaultValue: "ESTA SEMANA" }), month: t("filter_period_month", { defaultValue: "ESTE MES" }), year: t("filter_period_year", { defaultValue: "ESTE AÑO" }) },
      status: { all: t("filter_status_all", { defaultValue: "CUALQUIER ESTADO" }), completed: t("filter_status_completed", { defaultValue: "COMPLETADO" }), cancelled: t("filter_status_cancelled", { defaultValue: "ANULADO" }), rescheduled: t("filter_status_rescheduled", { defaultValue: "REAGENDADO" }) }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="flex flex-col w-full">
      
      {/* PANEL DE FILTROS (GRID MATEMÁTICO) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">

        {/* Buscador (Celda 1) */}
        <div className="relative border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center transition-colors">
          <Search className="absolute left-4 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <Input
            placeholder={t("search_placeholder", { defaultValue: "BUSCAR POR ID O CONCEPTO..." })}
            className="w-full h-14 pl-12 pr-12 border-0 bg-transparent rounded-none focus-visible:ring-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
            value={searchTerm} 
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch} 
                className="absolute right-4 w-6 h-6 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-400 hover:text-black dark:hover:text-white transition-colors bg-gray-50 hover:bg-white dark:bg-[#050505] dark:hover:bg-[#0a0a0a]"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Rango de Fechas (Celda 2) */}
        <div className={cn(
          "border-b border-r border-black/20 dark:border-white/20 flex items-center transition-colors",
          filters.dateRange !== "all" ? "bg-gray-50 dark:bg-[#111]" : "bg-white dark:bg-[#0a0a0a]"
        )}>
          <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}>
            <SelectTrigger className="w-full h-14 border-0 bg-transparent rounded-none focus:ring-0 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <SelectValue placeholder={t("filter_period", { defaultValue: "PERIODO" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl">
              <SelectItem value="all" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_period_all", { defaultValue: "TODOS LOS PERIODOS" })}</SelectItem>
              <SelectItem value="today" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_period_today", { defaultValue: "HOY" })}</SelectItem>
              <SelectItem value="week" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_period_week", { defaultValue: "ESTA SEMANA" })}</SelectItem>
              <SelectItem value="month" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_period_month", { defaultValue: "ESTE MES" })}</SelectItem>
              <SelectItem value="year" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_period_year", { defaultValue: "ESTE AÑO" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Servicio (Celda 3) */}
        <div className={cn(
          "border-b border-r border-black/20 dark:border-white/20 flex items-center transition-colors",
          filters.type !== "all" ? "bg-gray-50 dark:bg-[#111]" : "bg-white dark:bg-[#0a0a0a]"
        )}>
          <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
            <SelectTrigger className="w-full h-14 border-0 bg-transparent rounded-none focus:ring-0 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
              <div className="flex items-center gap-3">
                <ListFilter className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <SelectValue placeholder={t("filter_service", { defaultValue: "CONCEPTO" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl">
              <SelectItem value="all" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_service_all", { defaultValue: "TODOS LOS CONCEPTOS" })}</SelectItem>
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type} className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado (Celda 4) */}
        <div className={cn(
          "border-b border-r border-black/20 dark:border-white/20 flex items-center transition-colors",
          filters.status !== "all" ? "bg-gray-50 dark:bg-[#111]" : "bg-white dark:bg-[#0a0a0a]"
        )}>
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
            <SelectTrigger className="w-full h-14 border-0 bg-transparent rounded-none focus:ring-0 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <SelectValue placeholder={t("filter_status", { defaultValue: "ESTADO" })} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl">
              <SelectItem value="all" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_status_all", { defaultValue: "CUALQUIER ESTADO" })}</SelectItem>
              <SelectItem value="completed" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_status_completed", { defaultValue: "COMPLETADO" })}</SelectItem>
              <SelectItem value="cancelled" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_status_cancelled", { defaultValue: "ANULADO" })}</SelectItem>
              <SelectItem value="rescheduled" className="text-[9px] font-bold uppercase tracking-widest rounded-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">{t("filter_status_rescheduled", { defaultValue: "REAGENDADO" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BARRA DE ESTADO DE FILTROS ACTIVOS */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-l border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t("active_filters", { defaultValue: "FILTROS ACTIVOS" })}:</span>
          </div>
          
          <AnimatePresence>
            {searchTerm && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="flex items-center gap-2 px-2 py-1 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                  <Search className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
                  <span className="max-w-[150px] truncate">{searchTerm}</span>
                  <button onClick={handleClearSearch} className="ml-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {filters.dateRange !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="flex items-center gap-2 px-2 py-1 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                  <Calendar className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
                  <span>{getFilterLabel("dateRange", filters.dateRange)}</span>
                  <button onClick={() => onFiltersChange({ ...filters, dateRange: "all" })} className="ml-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {filters.type !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="flex items-center gap-2 px-2 py-1 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                  <ListFilter className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
                  <span className="max-w-[150px] truncate">{filters.type}</span>
                  <button onClick={() => onFiltersChange({ ...filters, type: "all" })} className="ml-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {filters.status !== "all" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="flex items-center gap-2 px-2 py-1 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                  <Filter className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
                  <span>{getFilterLabel("status", filters.status)}</span>
                  <button onClick={() => onFiltersChange({ ...filters, status: "all" })} className="ml-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {activeFiltersCount > 0 && (
              <button 
                onClick={handleResetFilters}
                className="h-7 px-3 border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-500 hover:text-black dark:hover:text-white bg-transparent hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                {t("clear_filters", { defaultValue: "LIMPIAR" })}
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Contador de Resultados */}
        {resultCount !== undefined && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap hidden sm:block">
            <span className="text-black dark:text-white">{resultCount}</span> {resultCount !== 1 ? t("results", { defaultValue: "REGISTROS" }) : t("result", { defaultValue: "REGISTRO" })}
          </motion.div>
        )}
      </div>
    </div>
  );
};