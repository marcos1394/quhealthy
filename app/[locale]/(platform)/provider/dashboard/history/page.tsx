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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-200 dark:border-medical-500/20">
              <History className="w-7 h-7 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("subtitle")}</p>
            </div>
          </div>
          <HistoryHeader role={role} entryCount={filteredHistory.length} onExport={handleExport} />
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("records"), value: filteredHistory.length, icon: ClipboardList, color: "text-medical-600 dark:text-medical-400", bg: "bg-medical-50 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/20" },
            { label: t("status_completed"), value: completedCount, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
            { label: t("status_cancelled"), value: cancelledCount, icon: FileDown, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" },
            { label: t("status_rescheduled"), value: rescheduledCount, icon: FileDown, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl border ${stat.bg} transition-colors`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
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