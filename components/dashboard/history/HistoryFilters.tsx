"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Filter, ListFilter, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [isFocused, setIsFocused] = useState(false);
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
      dateRange: { all: t("filter_period_all"), today: t("filter_period_today"), week: t("filter_period_week"), month: t("filter_period_month"), year: t("filter_period_year") },
      status: { all: t("filter_status_all"), completed: t("filter_status_completed"), cancelled: t("filter_status_cancelled"), rescheduled: t("filter_status_rescheduled") }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className={cn(
          "grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm",
          isFocused ? "border-medical-300 dark:border-medical-500/30 shadow-md" : ""
        )}>

        {/* Search */}
        <div className="relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none", isFocused || searchTerm ? "text-medical-600 dark:text-medical-400" : "text-slate-400")} />
          <Input
            placeholder={t("search_placeholder")}
            className={cn(
              "pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-10 rounded-xl transition-all",
              "focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20",
              searchTerm && "border-medical-300 dark:border-medical-500/30"
            )}
            value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)}
            onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Date Range */}
        <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}>
          <SelectTrigger className={cn(
            "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl transition-all text-slate-900 dark:text-white",
            filters.dateRange !== "all" ? "border-medical-300 dark:border-medical-500/30 bg-medical-50 dark:bg-medical-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <Calendar className={cn("w-4 h-4", filters.dateRange !== "all" ? "text-medical-600 dark:text-medical-400" : "text-slate-400")} />
              <SelectValue placeholder={t("filter_period")} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem value="all">{t("filter_period_all")}</SelectItem>
            <SelectItem value="today">{t("filter_period_today")}</SelectItem>
            <SelectItem value="week">{t("filter_period_week")}</SelectItem>
            <SelectItem value="month">{t("filter_period_month")}</SelectItem>
            <SelectItem value="year">{t("filter_period_year")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Service Type */}
        <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
          <SelectTrigger className={cn(
            "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl transition-all text-slate-900 dark:text-white",
            filters.type !== "all" ? "border-medical-300 dark:border-medical-500/30 bg-medical-50 dark:bg-medical-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <ListFilter className={cn("w-4 h-4", filters.type !== "all" ? "text-medical-600 dark:text-medical-400" : "text-slate-400")} />
              <SelectValue placeholder={t("filter_service")} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem value="all">{t("filter_service_all")}</SelectItem>
            {serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
          <SelectTrigger className={cn(
            "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl transition-all text-slate-900 dark:text-white",
            filters.status !== "all" ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <Filter className={cn("w-4 h-4", filters.status !== "all" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
              <SelectValue placeholder={t("filter_status")} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem value="all">{t("filter_status_all")}</SelectItem>
            <SelectItem value="completed">✓ {t("filter_status_completed")}</SelectItem>
            <SelectItem value="cancelled">✗ {t("filter_status_cancelled")}</SelectItem>
            <SelectItem value="rescheduled">↻ {t("filter_status_rescheduled")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Active Filters Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {activeFiltersCount > 0 && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{t("active_filters")}</span>
              </div>
              <AnimatePresence>
                {searchTerm && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 gap-1 text-xs">
                      <Search className="w-2.5 h-2.5" />
                      <span className="max-w-[100px] truncate">{searchTerm}</span>
                      <button onClick={handleClearSearch} className="ml-1 hover:text-medical-700 dark:hover:text-medical-300"><X className="w-2.5 h-2.5" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.dateRange !== "all" && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 gap-1 text-xs">
                      <Calendar className="w-2.5 h-2.5" />
                      {getFilterLabel("dateRange", filters.dateRange)}
                      <button onClick={() => onFiltersChange({ ...filters, dateRange: "all" })} className="ml-1 hover:text-medical-700 dark:hover:text-medical-300"><X className="w-2.5 h-2.5" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.type !== "all" && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 gap-1 text-xs">
                      <ListFilter className="w-2.5 h-2.5" />
                      {filters.type}
                      <button onClick={() => onFiltersChange({ ...filters, type: "all" })} className="ml-1 hover:text-medical-700 dark:hover:text-medical-300"><X className="w-2.5 h-2.5" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.status !== "all" && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 gap-1 text-xs">
                      <Filter className="w-2.5 h-2.5" />
                      {getFilterLabel("status", filters.status)}
                      <button onClick={() => onFiltersChange({ ...filters, status: "all" })} className="ml-1 hover:text-emerald-700 dark:hover:text-emerald-300"><X className="w-2.5 h-2.5" /></button>
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button variant="ghost" size="sm" onClick={handleResetFilters}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white h-7 px-2.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <RotateCcw className="w-3 h-3 mr-1" />{t("clear_filters")}
              </Button>
            </>
          )}
        </div>
        {resultCount !== undefined && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">{resultCount}</span> {resultCount !== 1 ? t("results") : t("result")}
          </motion.div>
        )}
      </div>
    </div>
  );
};