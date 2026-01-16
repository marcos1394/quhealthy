"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, ClipboardList } from "lucide-react";
import { parseISO, isAfter, isToday, startOfWeek, startOfMonth, startOfYear } from "date-fns";

// ShadCN UI
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Componentes Personalizados (Reutilizamos los mismos)
import { HistoryHeader } from "@/components/dashboard/history/HistoryHeader";
import { HistoryFilters, FilterOptions } from "@/components/dashboard/history/HistoryFilters";
import { HistoryTable, HistoryEntry } from "@/components/dashboard/history/HistoryTable";
import { HistoryDetailModal } from "@/components/dashboard/history/HistoryDetailModal";

// Tipos
type UserRole = "paciente" | "proveedor";

// Mock Data (Perspectiva del Paciente)
const DUMMY_HISTORY: HistoryEntry[] = [
    { 
        id: 1, 
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // Hace 2 días
        type: "Limpieza Dental", 
        status: "completed", 
        rating: 5,
        notes: "Excelente atención, no sentí dolor.", 
        provider: { name: "Dr. Roberto Casas", specialty: "Odontología" },
        client: { name: "Yo" } 
    },
    { 
        id: 2, 
        date: new Date(Date.now() - 86400000 * 15).toISOString(), // Hace 15 días
        type: "Nutrición", 
        status: "completed", 
        rating: 4,
        notes: "Me entregó el plan alimenticio a tiempo.", 
        provider: { name: "Dra. Elena Gómez", specialty: "Nutrióloga" },
        client: { name: "Yo" }
    },
    { 
        id: 3, 
        date: new Date(Date.now() - 86400000 * 45).toISOString(), 
        type: "Dermatología", 
        status: "cancelled", 
        notes: "Tuve que cancelar por viaje de trabajo.", 
        provider: { name: "Dr. Luis Martínez", specialty: "Dermatología" },
        client: { name: "Yo" }
    },
    { 
        id: 4, 
        date: new Date(Date.now() + 86400000 * 5).toISOString(), // Futuro
        type: "Consulta General", 
        status: "rescheduled", 
        notes: "Reprogramada para la próxima semana.", 
        provider: { name: "Dra. Ana Torres", specialty: "Medicina General" },
        client: { name: "Yo" }
    }
];

export default function PatientHistoryPage() {
  const role: UserRole = "paciente"; // Rol fijo para esta página
  
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

  // Tipos de servicio únicos
  const serviceTypes = useMemo(() => 
    Array.from(new Set(DUMMY_HISTORY.map(item => item.type))), 
  []);

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    // Simulación de API
    setTimeout(() => {
      setHistory(DUMMY_HISTORY);
      setLoading(false);
    }, 800);
  }, []);

  // Lógica de Filtrado
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // 1. Buscador (Texto) - Busca nombre del doctor o servicio
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.type.toLowerCase().includes(lowerSearch) ||
        entry.provider?.name.toLowerCase().includes(lowerSearch) ||
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
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Fecha,Especialista,Servicio,Estado,Calificación\n"
        + filteredHistory.map(e => `${e.id},${e.date},${e.provider?.name},${e.type},${e.status},${e.rating || 'N/A'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mi_historial_medico.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-[80vh] bg-gray-950">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">Cargando tu historial...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <div className="max-w-7xl mx-auto space-y-6">
            
            <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-gray-800 p-0">
                    
                    {/* Header: Muestra "Historial de Consultas" */}
                    <div className="p-6 pb-4">
                        <HistoryHeader 
                            role={role} 
                            entryCount={filteredHistory.length} 
                            onExport={handleExport} 
                        />
                    </div>

                    {/* Filters */}
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
                            <p className="text-lg font-medium">No tienes historial aún</p>
                            <p className="text-sm">Tus citas pasadas aparecerán aquí.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>

        {/* Modal: Muestra detalles del especialista y tu calificación */}
        <HistoryDetailModal 
            entry={selectedEntry}
            role={role}
            onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
        />

    </div>
  );
}