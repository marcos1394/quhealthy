"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, ClipboardList } from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear } from "date-fns";

// ShadCN UI
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Componentes Personalizados (Rutas Correctas)
import { HistoryHeader } from "@/components/dashboard/history/HistoryHeader";
import { HistoryFilters, FilterOptions } from "@/components/dashboard/history/HistoryFilters";
import { HistoryTable, HistoryEntry } from "@/components/dashboard/history/HistoryTable";
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";

// Tipos
type UserRole = "paciente" | "proveedor";

// Mock Data (Simulando API)
const DUMMY_HISTORY: HistoryEntry[] = [
    { 
        id: 1, 
        date: new Date().toISOString(), 
        type: "Consulta General", 
        status: "completed", 
        duration: "30 min",
        notes: "Paciente presentó síntomas leves de gripe. Se recetó descanso.", 
        client: { name: "Ana López", history: "Paciente regular desde 2021" },
        provider: { name: "Dr. Juan Pérez", specialty: "Medicina General" }
    },
    { 
        id: 2, 
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // Hace 3 días
        type: "Fisioterapia", 
        status: "completed", 
        duration: "45 min",
        notes: "Sesión de rehabilitación de hombro.", 
        client: { name: "Carlos Rivera", history: "Post-operatorio" },
        provider: { name: "Fisio María Gómez", specialty: "Fisioterapia" }
    },
    { 
        id: 3, 
        date: new Date(Date.now() - 86400000 * 10).toISOString(), // Hace 10 días
        type: "Limpieza Dental", 
        status: "cancelled", 
        duration: "60 min",
        notes: "Cancelada por el paciente con 24h de antelación.", 
        client: { name: "Marta Sánchez", history: "Primera visita" },
        provider: { name: "Dr. Luis Martínez", specialty: "Odontología" }
    },
    { 
        id: 4, 
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // Futuro (Reprogramada)
        type: "Seguimiento", 
        status: "rescheduled", 
        duration: "15 min",
        notes: "Reprogramada por conflicto de horario.", 
        client: { name: "Ana López", history: "Paciente regular" },
        provider: { name: "Dr. Juan Pérez", specialty: "Medicina General" }
    }
];

export default function ProviderHistoryPage() {
  const role: UserRole = "proveedor"; // En esta página el rol es fijo
  
  // Estados
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all', 
    type: 'all', 
    status: 'all'
  });

  // Obtener tipos de servicio únicos para el filtro
  const serviceTypes = useMemo(() => 
    Array.from(new Set(DUMMY_HISTORY.map(item => item.type))), 
  []);

  // Carga inicial simulada
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory(DUMMY_HISTORY);
      setLoading(false);
    }, 800);
  }, []);

  // Lógica de Filtrado
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // 1. Buscador (Texto)
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.type.toLowerCase().includes(lowerSearch) ||
        entry.client?.name.toLowerCase().includes(lowerSearch) ||
        entry.notes?.toLowerCase().includes(lowerSearch);

      // 2. Filtro de Fecha
      const matchesDateRange = () => {
        if (filters.dateRange === 'all') return true;
        const entryDate = parseISO(entry.date);
        const now = new Date();
        
        if (filters.dateRange === 'today') return isToday(entryDate);
        if (filters.dateRange === 'week') return isAfter(entryDate, startOfWeek(now));
        if (filters.dateRange === 'month') return isAfter(entryDate, startOfMonth(now));
        if (filters.dateRange === 'year') return isAfter(entryDate, startOfYear(now));
        return true;
      };

      // 3. Filtros Select
      const matchesType = filters.type === 'all' || entry.type === filters.type;
      const matchesStatus = filters.status === 'all' || entry.status === filters.status;

      return matchesSearch && matchesDateRange() && matchesType && matchesStatus;
    });
  }, [history, searchTerm, filters]);

  const handleExport = () => {
    // Lógica simple de exportación CSV (mock)
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Fecha,Cliente,Servicio,Estado\n"
        + filteredHistory.map(e => `${e.id},${e.date},${e.client?.name},${e.type},${e.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_servicios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-[80vh] bg-gray-950">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">Cargando historial...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <div className="max-w-7xl mx-auto space-y-6">
            
            <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-gray-800 p-0">
                    
                    {/* Header Component */}
                    <div className="p-6 pb-4">
                        <HistoryHeader 
                            role={role} 
                            entryCount={filteredHistory.length} 
                            onExport={handleExport} 
                        />
                    </div>

                    {/* Filters Component */}
                    <div className="px-6 pb-6">
                        <HistoryFilters 
                            searchTerm={searchTerm} 
                            filters={filters} 
                            serviceTypes={serviceTypes}
                            onSearchTermChange={setSearchTerm}
                            onFiltersChange={setFilters}
                        />
                    </div>

                </CardHeader>
                
                <CardContent className="p-0">
                    {filteredHistory.length > 0 ? (
                        <HistoryTable 
                            entries={filteredHistory} 
                            role={role} 
                            onViewDetails={setSelectedEntry}
                        />
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No se encontraron resultados</p>
                            <p className="text-sm">Intenta ajustar tus filtros de búsqueda.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>

        {/* Modal Detalle */}
        <HistoryDetailModal 
            entry={selectedEntry}
            role={role}
            onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
        />

    </div>
  );
}