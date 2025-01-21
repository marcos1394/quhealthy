"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Loader2, 
  ClipboardList, 
  UserCheck, 
  Briefcase,
  Search,
  Calendar,
  Filter,
  FileDown,
  Eye,
  Star,
  MessageCircle
} from "lucide-react";
import axios from "axios";
import { format, parseISO, isAfter, isBefore, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface HistoryEntry {
  id: string;
  date: string;
  description: string;
  provider?: {
    id: string;
    name: string;
    rating: number;
    specialty: string;
  };
  client?: {
    id: string;
    name: string;
    history: string;
  };
  type: string;
  status: 'completed' | 'cancelled' | 'rescheduled';
  rating?: number;
  notes?: string;
  duration?: string;
  cost?: number;
  location?: string;
  followUp?: string;
}

interface HistoryProps {
  role: "paciente" | "proveedor";
}

interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  type: string;
  status: string;
}

export default function History({ role }: HistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    type: 'all',
    status: 'all'
  });

  const serviceTypes = useMemo(() => [
    'Consulta médica',
    'Tratamiento estético',
    'Terapia',
    'Procedimiento dental',
    'Masaje',
    'Spa',
    'Tratamiento facial',
    'Otro'
  ], []);

  useEffect(() => {
    // Comentamos la parte del backend y usamos datos dummy
    // const fetchHistory = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await axios.get("http://localhost:3001/profile/history", {
    //       params: { role },
    //     });
    //     setHistory(response.data);
    //     setError(null);
    //   } catch (err) {
    //     setError("No se pudo cargar el historial. Por favor, intente nuevamente.");
    //     console.error("Error fetching history:", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchHistory();

    // Datos dummy para pruebas
    setLoading(true);
    setTimeout(() => {
      setHistory([
        {
          id: "1",
          date: new Date().toISOString(),
          description: "Consulta médica general",
          provider: {
            id: "p1",
            name: "Dr. Juan Pérez",
            rating: 5,
            specialty: "Medicina General"
          },
          client: {
            id: "c1",
            name: "Ana López",
            history: "Consulta previa"
          },
          type: "Consulta médica",
          status: "completed",
          rating: 5,
          notes: "Paciente recuperada",
          duration: "30 minutos",
          cost: 500,
          location: "Clínica ABC",
          followUp: "Revisar en 6 meses"
        },
        {
          id: "2",
          date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
          description: "Sesión de fisioterapia",
          provider: {
            id: "p2",
            name: "Fisio María Gómez",
            rating: 4,
            specialty: "Fisioterapia"
          },
          client: {
            id: "c2",
            name: "Carlos Rivera",
            history: "Lesión deportiva"
          },
          type: "Terapia",
          status: "completed",
          rating: 4,
          notes: "Buena recuperación",
          duration: "45 minutos",
          cost: 700,
          location: "Centro de Fisioterapia XYZ",
          followUp: "Nueva cita en 2 semanas"
        },
        {
          id: "3",
          date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
          description: "Limpieza dental",
          provider: {
            id: "p3",
            name: "Dr. Luis Martínez",
            rating: 3,
            specialty: "Odontología"
          },
          client: {
            id: "c3",
            name: "Marta Sánchez",
            history: "Chequeo anual"
          },
          type: "Procedimiento dental",
          status: "cancelled",
          notes: "Paciente canceló la cita",
          duration: "1 hora",
          cost: 800,
          location: "Clínica Dental Dientes Felices"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [role]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { className: "bg-green-500/20 text-green-400", label: "Completado" },
      cancelled: { className: "bg-red-500/20 text-red-400", label: "Cancelado" },
      rescheduled: { className: "bg-yellow-500/20 text-yellow-400", label: "Reprogramado" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const matchesSearch = 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.provider?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.client?.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDateRange = () => {
        const entryDate = parseISO(entry.date);
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            return isToday(entryDate);
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return isAfter(entryDate, weekAgo);
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return isAfter(entryDate, monthAgo);
          case 'year':
            const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            return isAfter(entryDate, yearAgo);
          default:
            return true;
        }
      };

      const matchesType = filters.type === 'all' || entry.type === filters.type;
      const matchesStatus = filters.status === 'all' || entry.status === filters.status;

      return matchesSearch && matchesDateRange() && matchesType && matchesStatus;
    });
  }, [history, searchTerm, filters]);

  const exportHistory = () => {
    const csv = filteredHistory.map(entry => {
      return {
        Fecha: format(parseISO(entry.date), 'dd/MM/yyyy'),
        Tipo: entry.type,
        Estado: entry.status,
        [role === 'paciente' ? 'Proveedor' : 'Cliente']: 
          role === 'paciente' ? entry.provider?.name : entry.client?.name,
        Descripción: entry.description,
        Notas: entry.notes || '-'
      };
    });

    const csvString = [
      Object.keys(csv[0]).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_${role}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex justify-center items-center p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
          <span>Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex justify-center items-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex justify-center items-center p-4">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">No hay historial disponible por el momento.</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
          >
            Actualizar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-4 md:p-8">
      <Card className="max-w-6xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500/10 p-3 rounded-full">
                {role === "paciente" ? (
                  <UserCheck className="w-8 h-8 text-teal-400" />
                ) : (
                  <Briefcase className="w-8 h-8 text-teal-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-400">
                  Historial de {role === "paciente" ? "servicios recibidos" : "servicios brindados"}
                </h1>
                <p className="text-sm text-gray-400">
                  {filteredHistory.length} {filteredHistory.length === 1 ? 'registro' : 'registros'} encontrados
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Button 
                variant="outline"
                className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
                onClick={exportHistory}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por descripción, proveedor o cliente..."
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
  value={filters.dateRange}
  onValueChange={(value: 'all' | 'today' | 'week' | 'month' | 'year') =>
    setFilters({ ...filters, dateRange: value })
  }
>
  <SelectTrigger className="w-[180px] bg-gray-700/50 border-gray-600">
    <Calendar className="w-4 h-4 mr-2" />
    <SelectValue placeholder="Rango de fecha" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos</SelectItem>
    <SelectItem value="today">Hoy</SelectItem>
    <SelectItem value="week">Última semana</SelectItem>
    <SelectItem value="month">Último mes</SelectItem>
    <SelectItem value="year">Último año</SelectItem>
  </SelectContent>
</Select>


              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger className="w-[180px] bg-gray-700/50 border-gray-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[180px] bg-gray-700/50 border-gray-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="rescheduled">Reprogramados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
  <div className="overflow-x-auto">
    <Table className="min-w-full table-auto border-collapse">
      <TableHeader className="bg-gray-700">
        <TableRow>
          <TableHead className="text-gray-300 px-4 py-2">Fecha</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">
            {role === "paciente" ? "Proveedor" : "Cliente"}
          </TableHead>
          <TableHead className="text-gray-300 px-4 py-2">Tipo</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">Estado</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">
            {role === "paciente" ? "Calificación" : "Duración"}
          </TableHead>
          <TableHead className="text-gray-300 px-4 py-2 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredHistory.map((entry, index) => (
          <TableRow
            key={entry.id}
            className={`hover:bg-gray-700/50 transition-colors ${
              index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
            }`}
          >
            {/* Fecha */}
            <TableCell className="px-4 py-2">
              {format(parseISO(entry.date), "dd/MM/yyyy")}
            </TableCell>
            {/* Proveedor o Cliente */}
            <TableCell className="px-4 py-2">
              <div className="flex flex-col">
                <span className="font-medium">
                  {role === "paciente" ? entry.provider?.name : entry.client?.name}
                </span>
                <span className="text-sm text-gray-400">
                  {role === "paciente"
                    ? entry.provider?.specialty
                    : `Historial: ${entry.client?.history}`}
                </span>
              </div>
            </TableCell>
            {/* Tipo */}
            <TableCell className="px-4 py-2">{entry.type}</TableCell>
            {/* Estado */}
            <TableCell className="px-4 py-2">{getStatusBadge(entry.status)}</TableCell>
            {/* Calificación o Duración */}
            <TableCell className="px-4 py-2">
              {role === "paciente"
                ? entry.rating && getRatingStars(entry.rating)
                : entry.duration}
            </TableCell>
            {/* Acciones */}
            <TableCell className="px-4 py-2 text-right">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-700"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalles
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-teal-400">
                      Detalles del servicio
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {format(parseISO(entry.date), "PPP", { locale: es })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">
                          {role === "paciente" ? "Proveedor" : "Cliente"}
                        </h4>
                        <p className="text-white">
                          {role === "paciente"
                            ? entry.provider?.name
                            : entry.client?.name}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">
                          Tipo de servicio
                        </h4>
                        <p className="text-white">{entry.type}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Descripción</h4>
                      <p className="text-white">{entry.description}</p>
                    </div>
                    {entry.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Notas</h4>
                        <p className="text-white">{entry.notes}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {entry.duration && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Duración</h4>
                          <p className="text-white">{entry.duration}</p>
                        </div>
                      )}
                      {entry.cost && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Costo</h4>
                          <p className="text-white">${entry.cost.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {entry.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Ubicación</h4>
                        <p className="text-white">{entry.location}</p>
                      </div>
                    )}
                    {entry.followUp && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Seguimiento</h4>
                        <p className="text-white">{entry.followUp}</p>
                      </div>
                    )}
                    {role === "paciente" && entry.rating && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">
                          Calificación
                        </h4>
                        {getRatingStars(entry.rating)}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                      {role === "proveedor" && entry.status === "completed" && (
                        <Button
                          variant="outline"
                          className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contactar cliente
                        </Button>
                      )}
                      {role === "paciente" &&
                        !entry.rating &&
                        entry.status === "completed" && (
                          <Button
                            variant="outline"
                            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/20"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Calificar servicio
                          </Button>
                        )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</CardContent>

      </Card>
    </div>
  );
}