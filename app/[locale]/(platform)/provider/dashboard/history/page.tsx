"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useMemo } from "react";
import { ClipboardList, History, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { useTranslations } from "next-intl";

import { HistoryHeader } from "@/components/dashboard/history/HistoryHeader";
import { HistoryFilters, FilterOptions } from "@/components/dashboard/history/HistoryFilters";
import { HistoryTable, HistoryEntry } from "@/components/dashboard/history/HistoryTable";
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";
import { QhSpinner } from '@/components/ui/QhSpinner';

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
      ...services.map(s => s.name),
      ...packages.map(p => p.name),
      ...products.map(p => p.name),
      ...courses.map(c => c.name)
    ];
    return Array.from(new Set(allNames));
  }, [services, packages, products, courses]);

  const filteredHistory = useMemo(() => {
    return historyData.filter(entry => {
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

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Date,Client,Service,Status\n"
      + filteredHistory.map(e => `${e.id},${e.date},${e.client?.name},${e.type},${e.status}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "service_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = filteredHistory.filter(e => e.status === "completed").length;
  const cancelledCount = filteredHistory.filter(e => e.status === "cancelled").length;
  const rescheduledCount = filteredHistory.filter(e => e.status === "rescheduled").length;

  if (isLoadingHistory || catalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">
          {t("loading", { defaultValue: "Sincronizando historial operativo..." })}
        </p>
      </div>
    );
  }

  const statCards = [
    { 
      label: t("records", { defaultValue: 'Total Registros' }), 
      value: filteredHistory.length, 
      icon: ClipboardList, 
      iconBg: "bg-gray-100 dark:bg-[#111]", 
      iconColor: "text-gray-600 dark:text-gray-300",
      valColor: "text-gray-900 dark:text-white" 
    },
    { 
      label: t("status_completed", { defaultValue: 'Completados' }), 
      value: completedCount, 
      icon: CheckCircle2, 
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30", 
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valColor: "text-emerald-600 dark:text-emerald-400" 
    },
    { 
      label: t("status_cancelled", { defaultValue: 'Anulados' }), 
      value: cancelledCount, 
      icon: XCircle, 
      iconBg: "bg-red-50 dark:bg-red-950/30", 
      iconColor: "text-red-600 dark:text-red-400",
      valColor: "text-red-600 dark:text-red-400" 
    },
    { 
      label: t("status_rescheduled", { defaultValue: 'Reagendados' }), 
      value: rescheduledCount, 
      icon: RefreshCw, 
      iconBg: "bg-amber-50 dark:bg-amber-950/30", 
      iconColor: "text-amber-600 dark:text-amber-400",
      valColor: "text-amber-600 dark:text-amber-400" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Auditoría Operativa
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                {t("title", { defaultValue: 'Historial de Servicios' })}
              </h1>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <HistoryHeader role={role} entryCount={filteredHistory.length} onExport={handleExport} />
          </div>
        </div>

        {/* --- METRICAS (KPI CARDS) --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500">
                  {stat.label}
                </span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", stat.iconBg)}>
                  <stat.icon className={cn("w-4 h-4", stat.iconColor)} strokeWidth={2} />
                </div>
              </div>
              <p className={cn("text-2xl md:text-3xl font-bold tracking-tight leading-none", stat.valColor)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* --- CONTENEDOR DE FILTROS --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-2 md:p-4 shadow-sm overflow-hidden">
          <HistoryFilters
            searchTerm={searchTerm} 
            filters={filters} 
            serviceTypes={serviceTypes}
            onSearchTermChange={setSearchTerm} 
            onFiltersChange={setFilters} 
            resultCount={filteredHistory.length}
          />
        </div>

        {/* --- TABLA O EMPTY STATE --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden min-w-0">
          {filteredHistory.length > 0 ? (
            <HistoryTable entries={filteredHistory} role={role} onViewDetails={setSelectedEntry} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
                <ClipboardList className="w-6 h-6 text-gray-400" strokeWidth={2} />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {t("no_results", { defaultValue: 'Cero Registros' })}
              </p>
              <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                {t("no_results_hint", { defaultValue: 'Modifique los parámetros de búsqueda o filtros para encontrar coincidencias.' })}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL DETALLE DE EXPEDIENTE --- */}
      <HistoryDetailModal entry={selectedEntry} role={role} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)} />
    </div>
  );
}