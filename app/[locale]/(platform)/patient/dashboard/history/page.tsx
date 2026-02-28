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
  DollarSign,
  Lock,
  File as FileIcon,
  Eye,
  ShieldCheck,
  MoreVertical
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        <Tabs defaultValue="timeline" className="w-full mt-6">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm h-auto inline-flex">
              <TabsTrigger value="timeline" className="rounded-xl px-6 py-2.5 font-semibold text-sm transition-all data-[state=active]:bg-medical-50 data-[state=active]:text-medical-600 dark:data-[state=active]:bg-medical-500/10 dark:data-[state=active]:text-medical-400">
                <Calendar className="w-4 h-4 mr-2" />
                {t('timeline_tab') || "Past Visits"}
              </TabsTrigger>
              <TabsTrigger value="vault" className="rounded-xl px-6 py-2.5 font-semibold text-sm transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-800">
                <Lock className="w-4 h-4 mr-2" />
                {t('vault_tab') || "Secure File Vault"}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timeline" className="mt-0 focus-visible:ring-0">
            {/* Entries List - Elegant Timeline */}
            <div className="relative pt-4 pb-8 pl-4 sm:pl-8">
              {/* Vertical Line */}
              {filteredEntries.length > 0 && (
                <div className="absolute top-8 bottom-12 left-[31px] sm:left-[47px] w-0.5 bg-gradient-to-b from-medical-500/50 via-slate-200 dark:via-slate-800 to-transparent rounded-full" />
              )}

              <AnimatePresence mode="popLayout">
                {filteredEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEntries.map((entry, index) => {
                      const statusConfig = getStatusConfig(entry.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                          layout
                          className="relative pl-8 sm:pl-12"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-[-6px] sm:left-[0px] top-6 w-5 h-5 rounded-full bg-medical-500 border-4 border-slate-50 dark:border-slate-950 z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-125" />

                          <Card
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => { setSelectedEntry(entry); setIsDetailOpen(true); }}
                          >
                            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden">
                              {/* Status Accent Line */}
                              <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusConfig.className.split(" ")[0])} />

                              {/* Date */}
                              <div className="text-center sm:text-left min-w-[70px] pl-2">
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                  {formatInTimeZone(new Date(entry.date), 'UTC', "d", { locale: es })}
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                                  {formatInTimeZone(new Date(entry.date), 'UTC', "MMM yyyy", { locale: es })}
                                </p>
                              </div>

                              {/* Divider */}
                              <div className="hidden sm:block h-10 w-px bg-slate-100 dark:bg-slate-800" />

                              {/* Provider & Service */}
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                  <AvatarFallback className="bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-bold text-lg">
                                    {entry.provider.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors text-base">
                                    {entry.type}
                                  </h3>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                                    {entry.provider.name} <span className="text-slate-300 dark:text-slate-700">•</span> {entry.provider.specialty}
                                  </p>
                                </div>
                              </div>

                              {/* Rating */}
                              {entry.rating && (
                                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-500/20">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      className={cn(
                                        "w-3 h-3",
                                        i < (entry.rating || 0)
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-amber-200 dark:text-amber-900"
                                      )}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Status Badge */}
                              <Badge variant="outline" className={cn("border shrink-0 text-xs font-semibold py-1", statusConfig.className)}>
                                <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                                {statusConfig.label}
                              </Badge>

                              {/* Price */}
                              {entry.cost && (
                                <div className="text-right min-w-[80px]">
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Total</p>
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
            </div>
          </TabsContent>

          <TabsContent value="vault" className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[
                { name: "Resultados de Sangre (Hemograma)", date: "15 Oct 2023", size: "1.2 MB" },
                { name: "Radiografía Dental Panorámica", date: "22 Sep 2023", size: "4.5 MB" },
                { name: "Análisis de Perfil Lipídico", date: "10 Ago 2023", size: "850 KB" }
              ].map((file, i) => (
                <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-medical-500/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl">
                        <FileIcon className="w-7 h-7 text-medical-600 dark:text-medical-400" />
                      </div>
                      <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                        PDF
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors line-clamp-2 min-h-[48px]">{file.name}</h3>
                      <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <span>{file.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>{file.size}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Button variant="outline" className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors h-10">
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors h-10">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <ShieldCheck className="w-10 h-10 text-emerald-500/60 mb-3" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white text-center">Your files are secure</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">End-to-end encrypted storage.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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