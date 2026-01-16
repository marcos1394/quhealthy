"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Importamos Axios para la llamada real
import { 
  Activity, 
  Shield, 
  AlertCircle, 
  Search, 
  MapPin, 
  Smartphone,
  Laptop,
  Download,
  Loader2,
} from "lucide-react";

// ShadCN UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Definimos la interfaz para tipado estricto
interface LogEntry {
  id: number;
  activity: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  userAgent?: string; // Campo opcional que suele venir del backend
}

// Datos Mock (Solo para fallback si falla la API)
const mockLogs: LogEntry[] = [
  { 
    id: 1, 
    activity: "Inicio de sesión exitoso", 
    type: "success", 
    timestamp: "2025-01-08 14:30", 
    ip: "189.203.10.5", 
    location: "CDMX, México", 
    device: "Chrome / Windows"
  },
  { 
    id: 2, 
    activity: "Intento de login fallido", 
    type: "error", 
    timestamp: "2025-01-08 13:15", 
    ip: "45.23.11.90", 
    location: "Bogotá, Colombia", 
    device: "Safari / iPhone"
  },
  { 
    id: 3, 
    activity: "Cambio de contraseña", 
    type: "warning", 
    timestamp: "2025-01-07 16:45", 
    ip: "189.203.10.5", 
    location: "CDMX, México", 
    device: "Chrome / Windows"
  },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]); // Estado inicial vacío
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch de Datos Real
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Llamada al endpoint real
        const response = await axios.get('/api/security/logs'); 
        
        // Asumiendo que el backend devuelve { data: logs[] } o logs[] directamente
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setLogs(data);
        
      } catch (error) {
        console.error("Error fetching logs:", error);
        // En desarrollo, si falla la API, cargamos los mocks para no romper la UI
        // En producción, podrías mostrar un error o lista vacía.
        setLogs(mockLogs); 
        // Opcional: Mostrar toast solo si es un error real y no 404 esperado en dev
        // toast.error("No se pudo cargar el historial en tiempo real");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Lógica de Filtrado (Client-Side por ahora)
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    
    const matchesType = filterType === "all" || log.type === filterType;

    return matchesSearch && matchesType;
  });

  // Helper para Iconos
  const getDeviceIcon = (deviceString: string) => {
    const lower = deviceString.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) return Smartphone;
    return Laptop;
  };

  // Helper para Badges
  const getStatusBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Exitoso</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">Fallido</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">Seguridad</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* Header de la Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            Historial de Actividad
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitorea los accesos y cambios de seguridad en tu cuenta.
          </p>
        </div>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Buscador */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input 
                placeholder="Buscar por IP, ubicación o actividad..." 
                className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro */}
            <div className="w-full md:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">Todos los eventos</SelectItem>
                  <SelectItem value="success">Exitosos</SelectItem>
                  <SelectItem value="error">Errores / Fallidos</SelectItem>
                  <SelectItem value="warning">Cambios Críticos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-900/50">
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Actividad</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400 hidden md:table-cell">Ubicación & IP</TableHead>
                <TableHead className="text-gray-400 hidden md:table-cell">Dispositivo</TableHead>
                <TableHead className="text-gray-400 text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex justify-center items-center gap-2 text-gray-400">
                            <Loader2 className="animate-spin w-5 h-5 text-purple-500" /> Cargando historial...
                        </div>
                    </TableCell>
                 </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const DeviceIcon = getDeviceIcon(log.device);
                  return (
                    <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-800 ${log.type === 'error' ? 'text-red-400' : 'text-purple-400'}`}>
                             {log.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </div>
                          {log.activity}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.type)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-400 text-sm">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-gray-300">
                              <MapPin className="w-3 h-3" /> {log.location}
                          </span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5">{log.ip}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                              <DeviceIcon className="w-3 h-3" />
                              {log.device}
                          </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-400 text-sm font-mono">
                        {log.timestamp}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    No se encontraron registros que coincidan con tu búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}