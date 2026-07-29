"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ClipboardList, History, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { useTranslations } from "next-intl";

import { HistoryHeader } from "@/components/dashboard/history/HistoryHeader";
import { HistoryFilters, FilterOptions } from "@/components/dashboard/history/HistoryFilters";
import { HistoryTable, HistoryEntry } from "@/components/dashboard/history/HistoryTable";
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { useCatalog } from "@/hooks/useCatalog";
import { useHistory } from "@/hooks/useHistory";
import { cn } from "@/lib/utils";

type UserRole = "paciente" | "proveedor";

export default function ProviderHistoryPage() {
  const role: UserRole = "proveedor";
  const t = useTranslations("DashboardHistory");

  const { 
    services, 
    packages, 
    products, 
    courses, 
    fetchInventory, 
    isLoading: catalogLoading 
  } = useCatalog();
  const { historyData, isLoadingHistory, fetchHistory } = useHistory();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({ dateRange: "all", type: "all", status: "all" });

  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, [fetchInventory, fetchHistory]);

  const serviceTypes = useMemo(() => {
    const allNames = [
      ...services.map((s) => s.name),
      ...packages.map((p) => p.name),
      ...products.map((p) => p.name),
      ...courses.map((c) => c.name),
    ];
    return Array.from(new Set(allNames));
  }, [services, packages, products, courses]);

  const filteredHistory = useMemo(() => {
    return (historyData || []).filter((entry) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        entry.type?.toLowerCase().includes(lowerSearch) ||
        entry.client?.name?.toLowerCase().includes(lowerSearch) ||
        entry.notes?.toLowerCase().includes(lowerSearch);

      const matchesDateRange = () => {
        if (filters.dateRange === "all") return true;
        if (!entry.date) return false;
        const entryDate = parseISO(entry.date);
        const now = new Date();
        if (filters.dateRange === "today") return isToday(entryDate);
        if (filters.dateRange === "week") return isAfter(entryDate, startOfWeek(now));
        if (filters.dateRange === "month") return isAfter(entryDate, startOfMonth(now));
        if (filters.dateRange === "year") return isAfter(entryDate, startOfYear(now));
        return true;
      };

      const matchesType = filters.type === "all" || entry.type === filters.type;
      const matchesStatus = filters.status === "all" || entry.status === filters.status;
      return matchesSearch && matchesDateRange() && matchesType && matchesStatus;
    });
  }, [historyData, searchTerm, filters]);

  const handleExport = useCallback(() => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Date,Client,Service,Status\n" +
      filteredHistory
        .map((e) => `${e.id},${e.date},${e.client?.name},${e.type},${e.status}`)
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "historial_atenciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredHistory]);

  const completedCount = filteredHistory.filter((e) => e.status === "completed").length;
  const cancelledCount = filteredHistory.filter((e) => e.status === "cancelled").length;
  const rescheduledCount = filteredHistory.filter((e) => e.status === "rescheduled").length;

  if (isLoadingHistory || catalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  const statCards = [
    { 
      label: t("records"), 
      value: filteredHistory.length, 
      icon: ClipboardList, 
      iconBg: "bg-gray-100 dark:bg-gray-800/60", 
      iconColor: "text-gray-600 dark:text-gray-300",
      valColor: "text-gray-900 dark:text-white" 
    },
    { 
      label: t("filter_status_completed"), 
      value: completedCount, 
      icon: CheckCircle2, 
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30", 
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valColor: "text-emerald-600 dark:text-emerald-400" 
    },
    { 
      label: t("filter_status_cancelled"), 
      value: cancelledCount, 
      icon: XCircle, 
      iconBg: "bg-rose-50 dark:bg-rose-950/30", 
      iconColor: "text-rose-600 dark:text-rose-400",
      valColor: "text-rose-600 dark:text-rose-400" 
    },
    { 
      label: t("filter_status_rescheduled"), 
      value: rescheduledCount, 
      icon: RefreshCw, 
      iconBg: "bg-amber-50 dark:bg-amber-950/30", 
      iconColor: "text-amber-600 dark:text-amber-400",
      valColor: "text-amber-600 dark:text-amber-400" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">

        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <History className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <HistoryHeader
              role={role}
              entryCount={filteredHistory.length}
              onExport={handleExport}
            />
          </div>
        </div>

        {/* ── MÉTRICAS KPI CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">
                  {stat.label}
                </span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", stat.iconBg)}>
                  <stat.icon className={cn("w-4 h-4", stat.iconColor)} strokeWidth={2} />
                </div>
              </div>
              <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight leading-none font-mono", stat.valColor)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── BARRA DE FILTROS Y BÚSQUEDA ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-3 sm:p-4 shadow-sm overflow-hidden">
          <HistoryFilters
            searchTerm={searchTerm} 
            filters={filters} 
            serviceTypes={serviceTypes}
            onSearchTermChange={setSearchTerm} 
            onFiltersChange={setFilters} 
            resultCount={filteredHistory.length}
          />
        </div>

        {/* ── TABLA O ESTADO VACÍO ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          {filteredHistory.length > 0 ? (
            <HistoryTable
              entries={filteredHistory}
              role={role}
              onViewDetails={setSelectedEntry}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 sm:p-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                <ClipboardList className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {t("no_results")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                {t("no_results_hint")}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL DETALLE DE EXPEDIENTE ──────────────────────────────────── */}
      <HistoryDetailModal
        entry={selectedEntry}
        role={role}
        onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
      />
    </div>
  );
}