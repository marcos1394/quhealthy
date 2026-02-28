"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ClipboardList,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Download,
  Filter,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Star as StarIcon,
  DollarSign
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Components
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";
import { cn } from "@/lib/utils";

// Types
import type { HistoryEntry } from "@/components/dashboard/history/HistoryTable";

interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  type: string;
  status: string;
}

// Mock Data
const DUMMY_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: "Limpieza Dental",
    status: "completed",
    rating: 5,
    notes: "Excelente atención, no sentí dolor.",
    provider: { name: "Dr. Roberto Casas", specialty: "Odontología" },
    client: { name: "Yo" },
    priceAtBooking: 800,
    cost: 800,
    duration: undefined
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
    type: "Consulta Nutricional",
    status: "completed",
    rating: 4,
    notes: "Buen plan alimenticio, pero la cita fue corta.",
    provider: { name: "Dra. Elena Gómez", specialty: "Nutrición" },
    client: { name: "Yo" },
    priceAtBooking: 650,
    cost: 650,
    duration: undefined
  },
  {
    id: 3,
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    type: "Consulta Dermatológica",
    status: "cancelled",
    rating: undefined,
    notes: "Tuve que cancelar por viaje de trabajo.",
    provider: { name: "Dr. Luis Martínez", specialty: "Dermatología" },
    client: { name: "Yo" },
    priceAtBooking: 900,
    cost: 900,
    duration: undefined
  },
  {
    id: 4,
    date: new Date(Date.now() - 86400000 * 60).toISOString(),
    type: "Consulta General",
    status: "completed",
    rating: 5,
    notes: "Muy profesional y puntual.",
    provider: { name: "Dra. Ana López", specialty: "Medicina General" },
    client: { name: "Yo" },
    priceAtBooking: 700,
    cost: 700,
    duration: undefined
  }
];

export default function PatientHistoryPage() {
  const t = useTranslations('PatientHistory');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    setTimeout(() => {
      setEntries(DUMMY_HISTORY);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    const now = new Date();

    // Date range
    if (filters.dateRange !== 'all') {
      const ranges: Record<string, number> = {
        today: 1, week: 7, month: 30, year: 365
      };
      const days = ranges[filters.dateRange] || 0;
      const cutoff = new Date(now.getTime() - days * 86400000);
      filtered = filtered.filter(e => new Date(e.date) >= cutoff);
    }

    // Type
    if (filters.type !== 'all') {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    // Status
    if (filters.status !== 'all') {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.provider.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, filters, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: entries.length,
    completed: entries.filter(e => e.status === 'completed').length,
    cancelled: entries.filter(e => e.status === 'cancelled').length,
    totalSpent: entries.filter(e => e.status === 'completed').reduce((sum, e) => sum + (e.cost || 0), 0)
  }), [entries]);

  // Export handler
  const handleExport = () => {
    const csvContent = filteredEntries.map(e =>
      `${e.date},${e.type},${e.provider.name},${e.status},${e.cost || 0}`
    ).join('\n');
    const blob = new Blob([`Fecha,Servicio,Proveedor,Estado,Costo\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_medico.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status config
  const getStatusConfig = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: t('status_completed'),
          icon: CheckCircle2,
          className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
        };
      case 'cancelled':
        return {
          label: t('status_canceled'),
          icon: XCircle,
          className: 'bg-rose-50 dark:bg-red-500/10 text-rose-700 dark:text-red-400 border-rose-200 dark:border-red-500/20'
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400'
        };
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ dateRange: 'all', type: 'all', status: 'all' });
    setSearchQuery('');
  };

  const uniqueTypes = useMemo(() =>
    [...new Set(entries.map(e => e.type))],
    [entries]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
        <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <ClipboardList className="w-8 h-8 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport} className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Download className="w-4 h-4 mr-2" /> {t('btn_export')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_total')}</p>
                  <p className="text-2xl font-bold text-medical-600 dark:text-medical-400">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-medical-300 dark:text-medical-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_completed')}</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-300 dark:text-emerald-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_cancelled')}</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-red-400">{stats.cancelled}</p>
                </div>
                <XCircle className="w-8 h-8 text-rose-300 dark:text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_invested')}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-slate-300 dark:text-slate-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <Select value={filters.dateRange} onValueChange={(v) => setFilters(prev => ({ ...prev, dateRange: v as FilterOptions['dateRange'] }))}>
                <SelectTrigger className="w-full md:w-36 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter_all')}</SelectItem>
                  <SelectItem value="today">{t('filter_today')}</SelectItem>
                  <SelectItem value="week">{t('filter_week')}</SelectItem>
                  <SelectItem value="month">{t('filter_month')}</SelectItem>
                  <SelectItem value="year">{t('filter_year')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(v) => setFilters(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="w-full md:w-48 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder={t('filter_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter_all_types')}</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="w-full md:w-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder={t('filter_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter_all_statuses')}</SelectItem>
                  <SelectItem value="completed">{t('status_completed')}</SelectItem>
                  <SelectItem value="canceled">{t('status_canceled')}</SelectItem>
                </SelectContent>
              </Select>

              {(filters.dateRange !== 'all' || filters.type !== 'all' || filters.status !== 'all' || searchQuery) && (
                <Button variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <X className="w-4 h-4 mr-1" /> {t('btn_clear_filters')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entries List */}
        <AnimatePresence mode="popLayout">
          {filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => {
                const statusConfig = getStatusConfig(entry.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    layout
                  >
                    <Card
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => { setSelectedEntry(entry); setIsDetailOpen(true); }}
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Date */}
                        <div className="text-center sm:text-left min-w-[70px]">
                          <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatInTimeZone(new Date(entry.date), 'UTC', "d", { locale: es })}
                          </p>
                          <p className="text-xs font-semibold text-medical-600 dark:text-medical-400 uppercase">
                            {formatInTimeZone(new Date(entry.date), 'UTC', "MMM yyyy", { locale: es })}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-12 w-px bg-slate-200 dark:bg-slate-700" />

                        {/* Provider & Service */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10 border-2 border-medical-200 dark:border-medical-500/20">
                            <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold text-sm">
                              {entry.provider.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                              {entry.type}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {entry.provider.name} • {entry.provider.specialty}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        {entry.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={cn(
                                  "w-3.5 h-3.5",
                                  i < (entry.rating || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 dark:text-slate-700"
                                )}
                              />
                            ))}
                          </div>
                        )}

                        {/* Status Badge */}
                        <Badge variant="outline" className={cn("border shrink-0", statusConfig.className)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>

                        {/* Price */}
                        {entry.cost && (
                          <div className="text-right min-w-[70px]">
                            <p className="font-bold text-slate-900 dark:text-white">${entry.cost}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
              <ClipboardList className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('empty_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{t('empty_desc')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail Modal */}
        {selectedEntry && (
          <HistoryDetailModal
            entry={selectedEntry}
            role="paciente"
            onOpenChange={(open) => { if (!open) { setIsDetailOpen(false); setSelectedEntry(null); } }}
          />
        )}
      </div>
    </div>
  );
}