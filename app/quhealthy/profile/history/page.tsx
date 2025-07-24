"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardList } from "lucide-react";
import { format, parseISO, isAfter, isToday } from "date-fns";
import { HistoryEntry, FilterOptions, UserRole } from "@/app/quhealthy/types/history";

// Importa los nuevos componentes
import { HistoryHeader } from "@/app/quhealthy/components/history/HistoryHeader";
import { HistoryFilters } from "@/app/quhealthy/components/history/HistoryFilters";
import { HistoryTable } from "@/app/quhealthy/components/history/HistoryTable";
import { HistoryDetailModal } from "@/app/quhealthy/components/history/HistoryDetailModal";

// Datos dummy (reemplazar con llamada a la API)
const DUMMY_HISTORY: HistoryEntry[] = [
    { id: "1", date: new Date().toISOString(), description: "Consulta médica general", provider: { id: "p1", name: "Dr. Juan Pérez", rating: 5, specialty: "Medicina General" }, client: { id: "c1", name: "Ana López", history: "Consulta previa" }, type: "Consulta médica", status: "completed", rating: 5, notes: "Paciente recuperada", duration: "30 minutos", cost: 500, location: "Clínica ABC", followUp: "Revisar en 6 meses" },
    { id: "2", date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: "Sesión de fisioterapia", provider: { id: "p2", name: "Fisio María Gómez", rating: 4, specialty: "Fisioterapia" }, client: { id: "c2", name: "Carlos Rivera", history: "Lesión deportiva" }, type: "Terapia", status: "completed", rating: 4, notes: "Buena recuperación", duration: "45 minutos", cost: 700, location: "Centro de Fisioterapia XYZ", followUp: "Nueva cita en 2 semanas" },
    { id: "3", date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), description: "Limpieza dental", provider: { id: "p3", name: "Dr. Luis Martínez", rating: 3, specialty: "Odontología" }, client: { id: "c3", name: "Marta Sánchez", history: "Chequeo anual" }, type: "Procedimiento dental", status: "cancelled", notes: "Paciente canceló la cita", duration: "1 hora", cost: 800, location: "Clínica Dental Dientes Felices" }
];

export default function HistoryPage() {
  const [role, setRole] = useState<UserRole>("proveedor"); // Simulado
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all', type: 'all', status: 'all'
  });

  const serviceTypes = useMemo(() => Array.from(new Set(DUMMY_HISTORY.map(item => item.type))), []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory(DUMMY_HISTORY);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredHistory = useMemo(() => {
    // Esta función SIEMPRE devuelve un array, solucionando el error.
    return history.filter(entry => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.description.toLowerCase().includes(lowerSearchTerm) ||
        (entry.provider?.name.toLowerCase().includes(lowerSearchTerm)) ||
        (entry.client?.name.toLowerCase().includes(lowerSearchTerm));

      const matchesDateRange = () => {
        if (filters.dateRange === 'all') return true;
        const entryDate = parseISO(entry.date);
        const now = new Date();
        if (filters.dateRange === 'today') return isToday(entryDate);
        if (filters.dateRange === 'week') return isAfter(entryDate, new Date(now.setDate(now.getDate() - 7)));
        if (filters.dateRange === 'month') return isAfter(entryDate, new Date(now.setMonth(now.getMonth() - 1)));
        if (filters.dateRange === 'year') return isAfter(entryDate, new Date(now.setFullYear(now.getFullYear() - 1)));
        return true;
      };

      const matchesType = filters.type === 'all' || entry.type === filters.type;
      const matchesStatus = filters.status === 'all' || entry.status === filters.status;

      return matchesSearch && matchesDateRange() && matchesType && matchesStatus;
    });
  }, [history, searchTerm, filters]);

  const exportHistory = () => {
    // ... tu lógica de exportación existente ...
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black text-white p-4 md:p-8">
      <Card className="max-w-7xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700 p-6">
          <HistoryHeader role={role} entryCount={filteredHistory.length} onExport={exportHistory} />
          <HistoryFilters 
            searchTerm={searchTerm} 
            filters={filters} 
            serviceTypes={serviceTypes}
            onSearchTermChange={setSearchTerm}
            onFiltersChange={setFilters}
          />
        </CardHeader>
        <CardContent className="p-0">
          {filteredHistory.length > 0 ? (
            <HistoryTable 
              entries={filteredHistory} 
              role={role} 
              onViewDetails={setSelectedEntry}
            />
          ) : (
            <div className="text-center p-12 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-4" />
              <p>No se encontraron registros que coincidan con tus filtros.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <HistoryDetailModal 
        entry={selectedEntry}
        role={role}
        onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
      />
    </div>
  );
}