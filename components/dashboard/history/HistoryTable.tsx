"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Star, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Tipos (Localizados para independencia)
export interface HistoryEntry {
  id: number;
  date: string;
  type: string; // Tipo de servicio
  status: 'completed' | 'cancelled' | 'rescheduled';
  duration?: string;
  rating?: number;
  notes?: string;
  provider?: { name: string; specialty: string };
  client?: { name: string; history?: string };
}

type UserRole = "paciente" | "proveedor";

interface HistoryTableProps {
  entries: HistoryEntry[];
  role: UserRole;
  onViewDetails: (entry: HistoryEntry) => void;
}

const getStatusBadge = (status: HistoryEntry['status']) => {
  switch (status) {
    case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Completado</Badge>;
    case 'cancelled': return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">Cancelado</Badge>;
    case 'rescheduled': return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">Reprogramado</Badge>;
    default: return <Badge variant="outline">Desconocido</Badge>;
  }
};

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        className={`w-3.5 h-3.5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
      />
    ))}
  </div>
);

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails }) => {
  if (entries.length === 0) {
    return (
        <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
            <p className="text-gray-500">No hay registros en el historial.</p>
        </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden shadow-lg">
      <Table>
        <TableHeader className="bg-gray-900">
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-400 font-medium pl-6">Fecha</TableHead>
            <TableHead className="text-gray-400 font-medium">{role === "paciente" ? "Especialista" : "Paciente"}</TableHead>
            <TableHead className="text-gray-400 font-medium">Servicio</TableHead>
            <TableHead className="text-gray-400 font-medium text-center">Estado</TableHead>
            <TableHead className="text-gray-400 font-medium text-center">{role === "paciente" ? "Calificación" : "Duración"}</TableHead>
            <TableHead className="text-right pr-6 text-gray-400 font-medium">Detalles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-gray-950">
          {entries.map((entry) => (
            <TableRow key={entry.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
              
              {/* Fecha */}
              <TableCell className="pl-6 font-medium text-white">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {format(parseISO(entry.date), "d MMM, yyyy", { locale: es })}
                </div>
              </TableCell>

              {/* Persona */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{role === "paciente" ? entry.provider?.name : entry.client?.name}</span>
                  <span className="text-xs text-gray-500">{role === "paciente" ? entry.provider?.specialty : 'Paciente Regular'}</span>
                </div>
              </TableCell>

              {/* Tipo */}
              <TableCell className="text-gray-300">{entry.type}</TableCell>

              {/* Estado */}
              <TableCell className="text-center">{getStatusBadge(entry.status)}</TableCell>

              {/* Rating / Duración */}
              <TableCell className="text-center">
                {role === "paciente" ? (
                    entry.rating ? getRatingStars(entry.rating) : <span className="text-xs text-gray-500 italic">Sin calificar</span>
                ) : (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                        <Clock className="w-3 h-3" /> {entry.duration}
                    </div>
                )}
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right pr-6">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-purple-500/10 hover:text-purple-300 text-gray-400" 
                    onClick={() => onViewDetails(entry)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};