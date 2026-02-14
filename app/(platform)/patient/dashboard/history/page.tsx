"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Star,
  Eye,
  BarChart3,
  Sparkles
} from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";

// ShadCN UI
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

/**
 * PatientHistoryPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Visual timeline
 *    - Status badges
 *    - Provider avatars
 *    - Quick filters
 * 
 * 2. JERARQUÍA VISUAL
 *    - Stats dashboard first
 *    - Recent appointments prominent
 *    - Color-coded statuses
 *    - Clear sections
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Real-time filtering
 *    - Loading states
 *    - Export confirmation
 *    - Search results count
 * 
 * 4. CREDIBILIDAD
 *    - Professional stats
 *    - Provider ratings
 *    - Complete history
 *    - Export capability
 * 
 * 5. SATISFICING
 *    - Quick date filters
 *    - One-click export
 *    - Easy search
 *    - View details button
 * 
 * 6. PRIMING
 *    - Success badges
 *    - Rating displays
 *    - Achievement stats
 *    - Positive messaging
 */

// Types
import type { HistoryEntry } from "@/components/dashboard/history/HistoryTable";

type FilterOptions = {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  type: string;
  status: string;
};

// Mock Data
const DUMMY_HISTORY: HistoryEntry[] = [
  {
      id: 1,
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: "Limpieza Dental",
      status: "completed",
      rating: 5,
      notes: "Excelente atención, no sentí dolor.",
      provider: {
          name: "Dr. Roberto Casas", specialty: "Odontología",
          location: ""
      },
      client: { name: "Yo" },
      priceAtBooking: 800,
      cost: 800,
      duration: undefined
  },
  {
      id: 2,
      date: new Date(Date.now() - 86400000 * 15).toISOString(),
      type: "Nutrición",
      status: "completed",
      rating: 4,
      notes: "Me entregó el plan alimenticio a tiempo.",
      provider: { name: "Dra. Elena Gómez", specialty: "Nutrióloga" },
      client: { name: "Yo" },
      priceAtBooking: 650,
      cost: 650,
      duration: undefined
  },
  {
      id: 3,
      date: new Date(Date.now() - 86400000 * 45).toISOString(),
      type: "Dermatología",
      status: "cancelled",
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
      provider: { name: "Dra. Ana Torres", specialty: "Medicina General" },
      client: { name: "Yo" },
      priceAtBooking: 500,
      cost: 500,
      duration: undefined
  },
  {
      id: 5,
      date: new Date(Date.now() - 86400000 * 90).toISOString(),
      type: "Psicología",
      status: "completed",
      rating: 5,
      notes: "Sesión muy productiva.",
      provider: { name: "Dra. María López", specialty: "Psicología Clínica" },
      client: { name: "Yo" },
      priceAtBooking: 700,
      cost: 700,
      duration: undefined
  }
  // If you had any entries with status: "no_show", remove or change them to a valid status
];

export default function PatientHistoryPage() {
  // States
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all', 
    type: 'all', 
    status: 'all'
  });

  // Service types
  const serviceTypes = useMemo(() => 
    Array.from(new Set(DUMMY_HISTORY.map(item => item.type))), 
  []);

  // Load data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory(DUMMY_HISTORY);
      setLoading(false);
    }, 800);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.type.toLowerCase().includes(lowerSearch) ||
        entry.provider.name.toLowerCase().includes(lowerSearch) ||
        entry.provider.specialty.toLowerCase().includes(lowerSearch) ||
        entry.notes?.toLowerCase().includes(lowerSearch)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        const now = new Date();
        
        if (filters.dateRange === 'today') return isToday(entryDate);
        if (filters.dateRange === 'week') return isAfter(entryDate, startOfWeek(now));
        if (filters.dateRange === 'month') return isAfter(entryDate, startOfMonth(now));
        if (filters.dateRange === 'year') return isAfter(entryDate, startOfYear(now));
        return true;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredHistory(filtered);
  }, [history, searchTerm, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = history.filter(h => h.status === 'completed');
    const totalRating = completed.reduce((sum, h) => sum + (h.rating || 0), 0);
    const avgRating = completed.length > 0 ? (totalRating / completed.length).toFixed(1) : '0';
    const totalSpent = completed.reduce((sum, h) => sum + (h.priceAtBooking || 0), 0);

    return {
      total: history.length,
      completed: completed.length,
      cancelled: history.filter(h => h.status === 'cancelled').length,
      avgRating,
      totalSpent
    };
  }, [history]);

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Fecha,Especialista,Especialidad,Servicio,Estado,Calificación,Precio,Notas\n"
        + filteredHistory.map(e => 
            `${e.id},${format(parseISO(e.date), 'dd/MM/yyyy', { locale: es })},${e.provider.name},${e.provider.specialty},${e.type},${e.status},${e.rating || 'N/A'},${e.priceAtBooking || 'N/A'},"${e.notes || ''}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `historial_medico_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Historial exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar el historial");
    } finally {
      setIsExporting(false);
    }
  };

  // Status config
  const getStatusConfig = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completada',
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
      case 'rescheduled':
        return {
          label: 'Reprogramada',
          icon: Clock,
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      // case 'no_show':
      //   return {
      //     label: 'No asistió',
      //     icon: XCircle,
      //     className: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      //   };
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      dateRange: 'all',
      type: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = searchTerm || filters.dateRange !== 'all' || filters.type !== 'all' || filters.status !== 'all';

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400">Cargando tu historial médico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-purple-500" />
              Historial Médico
            </h1>
            <p className="text-gray-400 mt-1">
              Revisa tus consultas pasadas y estadísticas
            </p>
          </div>
          
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredHistory.length === 0}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Citas</p>
                  <p className="text-2xl font-black text-purple-400">
                    {stats.total}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Completadas</p>
                  <p className="text-2xl font-black text-emerald-400">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Calificación</p>
                  <p className="text-2xl font-black text-yellow-400 flex items-center gap-1">
                    {stats.avgRating}
                    <Star className="w-5 h-5 fill-yellow-400" />
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Canceladas</p>
                  <p className="text-2xl font-black text-red-400">
                    {stats.cancelled}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Gastado</p>
                  <p className="text-xl font-black text-blue-400">
                    ${stats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por proveedor, servicio o especialidad..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Date Range */}
              <Select 
                value={filters.dateRange} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="w-full lg:w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>

              {/* Service Type */}
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-full lg:w-48 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full lg:w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="rescheduled">Reprogramadas</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Results Count */}
            {filteredHistory.length > 0 && (
              <div className="mt-3 text-sm text-gray-400">
                Mostrando {filteredHistory.length} de {history.length} citas
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Timeline */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Historial de Consultas
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <AnimatePresence mode="popLayout">
              {filteredHistory.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {filteredHistory.map((entry, index) => {
                    const statusConfig = getStatusConfig(entry.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          
                          {/* Date Column */}
                          <div className="flex-shrink-0 lg:w-32">
                            <div className="text-center lg:text-left">
                              <p className="text-3xl font-black text-white">
                                {format(parseISO(entry.date), 'd', { locale: es })}
                              </p>
                              <p className="text-sm font-semibold text-purple-400 uppercase">
                                {format(parseISO(entry.date), 'MMM', { locale: es })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(entry.date), 'yyyy', { locale: es })}
                              </p>
                            </div>
                          </div>

                          {/* Details Column */}
                          <div className="flex-1 space-y-3">
                            {/* Service & Status */}
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors">
                                  {entry.type}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {entry.provider.specialty}
                                </p>
                              </div>
                              <Badge variant="outline" className={cn("border", statusConfig.className)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {/* Provider Info */}
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                                <AvatarImage src={entry.provider.image} />
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-bold">
                                  {entry.provider.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-bold text-white">
                                  {entry.provider.name}
                                </p>
                                {entry.rating && (
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "w-3 h-3",
                                          i < entry.rating!
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-600"
                                        )}
                                      />
                                    ))}
                                    <span className="text-xs text-gray-400 ml-1">
                                      ({entry.rating}/5)
                                    </span>
                                  </div>
                                )}
                              </div>
                              {entry.priceAtBooking && (
                                <div className="text-right">
                                  <p className="text-sm font-black text-purple-400">
                                    ${entry.priceAtBooking}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {entry.notes && (
                              <p className="text-sm text-gray-400 italic">
                                "{entry.notes}"
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2 lg:justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                              className="flex-1 lg:flex-none border-gray-700 hover:bg-gray-800"
                            >
                              <Eye className="w-4 h-4 lg:mr-2" />
                              <span className="hidden lg:inline">Ver Detalles</span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-20" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    {hasActiveFilters ? 'No se encontraron resultados' : 'No tienes historial aún'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {hasActiveFilters 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Tus citas pasadas aparecerán aquí'}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-purple-500/30 text-purple-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <HistoryDetailModal 
        entry={selectedEntry}
        role="paciente"
        onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
      />
    </div>
  );
}