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
  Info
} from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('SettingsActivity');

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
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">{t('badges.success')}</Badge>;
      case "error":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20">{t('badges.error')}</Badge>;
      case "warning":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20">{t('badges.warning')}</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20">{t('badges.info')}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm hidden sm:block">
              <Activity className="w-8 h-8 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm">
            <Download className="w-4 h-4 mr-2" /> {t('export')}
          </Button>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Buscador */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <Input
                  placeholder={t('search_placeholder')}
                  className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-medical-500 focus-visible:border-medical-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro */}
              <div className="w-full md:w-56">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-medical-500 focus:border-medical-500">
                    <SelectValue placeholder={t('filter.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all">{t('filter.all')}</SelectItem>
                    <SelectItem value="success">{t('filter.success')}</SelectItem>
                    <SelectItem value="error">{t('filter.error')}</SelectItem>
                    <SelectItem value="warning">{t('filter.warning')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 px-6">{t('table.activity')}</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 px-6">{t('table.status')}</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 px-6 hidden md:table-cell">{t('table.location_ip')}</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 px-6 hidden md:table-cell">{t('table.device')}</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 px-6 text-right whitespace-nowrap">{t('table.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex justify-center items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
                          <Loader2 className="animate-spin w-6 h-6 text-medical-500" /> {t('loading')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const DeviceIcon = getDeviceIcon(log.device);
                      return (
                        <TableRow key={log.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <TableCell className="font-medium text-slate-900 dark:text-white py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${log.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                {log.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              </div>
                              <span className="font-semibold">{log.activity}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {getStatusBadge(log.type)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400 text-sm py-4 px-6">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {log.location}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-80">{log.ip}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400 text-sm py-4 px-6">
                            <div className="flex items-center gap-2 font-medium">
                              <DeviceIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              {log.device}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-500 dark:text-slate-400 text-sm font-mono whitespace-nowrap py-4 px-6">
                            {log.timestamp}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                          <Info className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
                          <p className="font-medium">{t('empty')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}