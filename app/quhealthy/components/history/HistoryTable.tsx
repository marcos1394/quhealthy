"use client";
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { HistoryEntry, UserRole } from '@/app/quhealthy/types/history';

interface HistoryTableProps {
  entries: HistoryEntry[];
  role: UserRole;
  onViewDetails: (entry: HistoryEntry) => void;
}

const getStatusBadge = (status: HistoryEntry['status']) => {
  const statusConfig = {
    completed: { className: "bg-green-500/20 text-green-400", label: "Completado" },
    cancelled: { className: "bg-red-500/20 text-red-400", label: "Cancelado" },
    rescheduled: { className: "bg-yellow-500/20 text-yellow-400", label: "Reprogramado" }
  };
  const config = statusConfig[status];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
    ))}
  </div>
);

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails }) => (
  <div className="overflow-x-auto">
    <Table className="min-w-full table-auto border-collapse">
      <TableHeader className="bg-gray-700">
        <TableRow>
          <TableHead className="text-gray-300 px-4 py-2">Fecha</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">{role === "paciente" ? "Proveedor" : "Cliente"}</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">Tipo</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">Estado</TableHead>
          <TableHead className="text-gray-300 px-4 py-2">{role === "paciente" ? "Calificación" : "Duración"}</TableHead>
          <TableHead className="text-gray-300 px-4 py-2 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <TableRow key={entry.id} className={`hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}>
            <TableCell className="px-4 py-2">{format(parseISO(entry.date), "dd/MM/yyyy")}</TableCell>
            <TableCell className="px-4 py-2">
              <div className="flex flex-col">
                <span className="font-medium">{role === "paciente" ? entry.provider?.name : entry.client?.name}</span>
                <span className="text-sm text-gray-400">{role === "paciente" ? entry.provider?.specialty : `Historial: ${entry.client?.history}`}</span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-2">{entry.type}</TableCell>
            <TableCell className="px-4 py-2">{getStatusBadge(entry.status)}</TableCell>
            <TableCell className="px-4 py-2">{role === "paciente" ? (entry.rating ? getRatingStars(entry.rating) : 'N/A') : entry.duration}</TableCell>
            <TableCell className="px-4 py-2 text-right">
              <Button variant="ghost" size="sm" className="hover:bg-gray-700" onClick={() => onViewDetails(entry)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);