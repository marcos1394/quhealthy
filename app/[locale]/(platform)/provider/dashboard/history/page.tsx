"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, History, TrendingUp, FileDown } from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { useTranslations } from "next-intl";

import { HistoryHeader } from "@/components/dashboard/history/HistoryHeader";
import { HistoryFilters, FilterOptions } from "@/components/dashboard/history/HistoryFilters";
import { HistoryTable, HistoryEntry } from "@/components/dashboard/history/HistoryTable";
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";
import { QhSpinner } from '@/components/ui/QhSpinner';

// 🚀 1. Importamos nuestro hook del catálogo
import { useCatalog } from "@/hooks/useCatalog";
// 🚀 1. Importamos el nuevo Hook
import { useHistory } from "@/hooks/useHistory";

type UserRole = "paciente" | "proveedor";

export default function ProviderHistoryPage() {
  const role: UserRole = "proveedor";
  const t = useTranslations("DashboardHistory");

  // 🚀 2. Hooks de carga de datos
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

  // 🚀 3. Disparamos la carga de todo
  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, [fetchInventory, fetchHistory]);

  // 🚀 4. REEMPLAZO MAGISTRAL: Construimos las opciones del filtro dinámicamente
  // Juntamos los nombres de TODOS tus items (Servicios, Productos, Paquetes, Cursos)
  const serviceTypes = useMemo(() => {
    const allNames = [
      ...services.map(s => s.name),
      ...packages.map(p => p.name),
      ...products.map(p => p.name),
      ...courses.map(c => c.name)
    ];
    // Quitamos duplicados por si acaso
    return Array.from(new Set(allNames));
  }, [services, packages, products, courses]);

  // Lógica de filtrado (Se queda igual)
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

  // Stats
  const completedCount = filteredHistory.filter(e => e.status === "completed").length;
  const cancelledCount = filteredHistory.filter(e => e.status === "cancelled").length;
  const rescheduledCount = filteredHistory.filter(e => e.status === "rescheduled").length;

  // 🚀 5. Esperamos a que ambas cosas carguen (Catálogo + Historial)
  if (isLoadingHistory || catalogLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-50 dark:bg-slate-950 transition-colors">
        <QhSpinner size="md" />
        <p className="text-slate-500 dark:text-slate-400 font-light mt-4">{t("loading", { defaultValue: "Cargando tu historial..." })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 dark:bg-slate-800/50 rounded-full blur-3xl -mr-20 -mt-20 transition-colors duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-105 duration-300">
                <History className="w-10 h-10 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t("subtitle")}</p>
              </div>
            </div>
            <HistoryHeader role={role} entryCount={filteredHistory.length} onExport={handleExport} />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t("records"), value: filteredHistory.length, icon: ClipboardList, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50" },
            { label: t("status_completed"), value: completedCount, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50" },
            { label: t("status_cancelled"), value: cancelledCount, icon: FileDown, color: "text-red-600 dark:text-red-400", bg: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50" },
            { label: t("status_rescheduled"), value: rescheduledCount, icon: FileDown, color: "text-amber-600 dark:text-amber-400", bg: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50" },
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${stat.bg} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <HistoryFilters
          searchTerm={searchTerm} filters={filters} serviceTypes={serviceTypes}
          onSearchTermChange={setSearchTerm} onFiltersChange={setFilters} resultCount={filteredHistory.length}
        />

        {/* Table / Empty */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
          {filteredHistory.length > 0 ? (
            <HistoryTable entries={filteredHistory} role={role} onViewDetails={setSelectedEntry} />
          ) : (
            <div className="text-center py-20">
              <ClipboardList className="w-14 h-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t("no_results")}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("no_results_hint")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <HistoryDetailModal entry={selectedEntry} role={role} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)} />
    </div>
  );
}