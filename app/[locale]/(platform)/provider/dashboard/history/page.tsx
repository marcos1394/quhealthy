"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gray-50 dark:bg-[#050505] transition-colors">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
          {t("loading", { defaultValue: "EXTRAYENDO HISTORIAL OPERATIVO..." })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <History className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Auditoría Operativa
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                {t("title", { defaultValue: 'HISTORIAL DE SERVICIOS' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t("subtitle", { defaultValue: 'CONSULTA Y EXTRACCIÓN DE REGISTROS PASADOS.' })}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto">
            <HistoryHeader role={role} entryCount={filteredHistory.length} onExport={handleExport} />
          </div>
        </div>

        {/* MÉTRICAS (GRID BLUEPRINT) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
          {[
            { label: t("records", { defaultValue: 'TOTAL' }), value: filteredHistory.length, icon: ClipboardList, color: "text-black dark:text-white" },
            { label: t("status_completed", { defaultValue: 'COMPLETADOS' }), value: completedCount, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
            { label: t("status_cancelled", { defaultValue: 'ANULADOS' }), value: cancelledCount, icon: XCircle, color: "text-red-600 dark:text-red-400" },
            { label: t("status_rescheduled", { defaultValue: 'REAGENDADOS' }), value: rescheduledCount, icon: RefreshCw, color: "text-amber-600 dark:text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px] transition-colors hover:bg-gray-50 dark:hover:bg-[#111]">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {stat.label}
                </span>
              </div>
              <p className={cn("text-3xl md:text-4xl font-semibold tracking-tight leading-none mt-2", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* SISTEMA DE FILTROS */}
        <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-0 transition-colors">
          <HistoryFilters
            searchTerm={searchTerm} 
            filters={filters} 
            serviceTypes={serviceTypes}
            onSearchTermChange={setSearchTerm} 
            onFiltersChange={setFilters} 
            resultCount={filteredHistory.length}
          />
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white dark:bg-[#0a0a0a] transition-colors">
          {filteredHistory.length > 0 ? (
            <HistoryTable entries={filteredHistory} role={role} onViewDetails={setSelectedEntry} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
              <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                <ClipboardList className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                {t("no_results", { defaultValue: 'CERO REGISTROS' })}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                {t("no_results_hint", { defaultValue: 'MODIFIQUE LOS PARÁMETROS DE BÚSQUEDA PARA ENCONTRAR COINCIDENCIAS.' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DETALLES DEL EXPEDIENTE (MODAL) */}
      <HistoryDetailModal entry={selectedEntry} role={role} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)} />
    </div>
  );
}