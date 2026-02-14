"use client";

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { 
  Eye, 
  Star, 
  Calendar, 
  Clock,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  User,
  FileText
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * HistoryTable Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Headers destacados
 *    - Datos principales bold
 *    - Metadata secundaria en gris
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por cada campo
 *    - Colores distintivos por estado
 *    - Rating visual con estrellas
 * 
 * 3. PRIMING
 *    - Verde = completado (positivo)
 *    - Rojo = cancelado (negativo)
 *    - Amarillo = reprogramado (pendiente)
 * 
 * 4. AFFORDANCE
 *    - Hover states en rows
 *    - Botones con iconos claros
 *    - Cursor pointer en clickeable
 * 
 * 5. MINIMIZAR CARGA COGNITIVA
 *    - Información organizada por columnas
 *    - Empty state claro
 *    - Datos esenciales visibles
 * 
 * 6. FEEDBACK VISUAL
 *    - Row hover effect
 *    - Loading states
 *    - Animaciones suaves
 */

// Tipos
export type HistoryEntry = {
  duration: ReactNode;
  id: number;
  date: string;
  type: string;
  status: 'completed' | 'cancelled' | 'rescheduled'; // add other statuses if needed
  rating?: number;
  notes?: string;
  provider: {
    name: string;
    specialty: string;
    image?: string;
    location?: string;
  };
  client: {
    name: string;
  };
  priceAtBooking?: number; // <-- Add this line
  cost?: number;
};

type UserRole = "paciente" | "proveedor";

interface HistoryTableProps {
  entries: HistoryEntry[];
  role: UserRole;
  onViewDetails: (entry: HistoryEntry) => void;
  isLoading?: boolean;
  highlightRecent?: boolean;
}

// Helper para badges de estado - PRIMING
const getStatusBadge = (status: HistoryEntry['status']) => {
  const configs = {
    completed: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      text: "Completado",
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
    },
    cancelled: {
      icon: <XCircle className="w-3 h-3" />,
      text: "Cancelado",
      className: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
    },
    rescheduled: {
      icon: <RefreshCw className="w-3 h-3" />,
      text: "Reprogramado",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
    }
  };

  const config = configs[status];

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 font-medium", config.className)}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

// Helper para rating - RECONOCIMIENTO VISUAL
const getRatingStars = (rating: number, showNumber = false) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.03, type: "spring", stiffness: 200 }}
        >
          <Star 
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              index < rating 
                ? "text-amber-400 fill-amber-400" 
                : "text-gray-600"
            )} 
          />
        </motion.div>
      ))}
    </div>
    {showNumber && (
      <span className="text-xs text-gray-400 font-medium">({rating}/5)</span>
    )}
  </div>
);

export const HistoryTable: React.FC<HistoryTableProps> = ({ 
  entries, 
  role, 
  onViewDetails,
  isLoading = false,
  highlightRecent = true
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Empty state - FEEDBACK VISUAL
  if (!isLoading && entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-5 bg-gray-800/50 rounded-2xl">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-400">No hay registros en el historial</p>
            <p className="text-sm text-gray-600">
              {role === "paciente" 
                ? "Cuando realices consultas, aparecerán aquí" 
                : "Cuando brindes servicios, aparecerán aquí"}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-400 font-semibold pl-6">Fecha</TableHead>
              <TableHead className="text-gray-400 font-semibold">
                {role === "paciente" ? "Especialista" : "Paciente"}
              </TableHead>
              <TableHead className="text-gray-400 font-semibold">Servicio</TableHead>
              <TableHead className="text-gray-400 font-semibold text-center">Estado</TableHead>
              <TableHead className="text-gray-400 font-semibold text-center">
                {role === "paciente" ? "Calificación" : "Duración"}
              </TableHead>
              <TableHead className="text-right pr-6 text-gray-400 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-gray-950">
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-gray-800">
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6" : ""}>
                    <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Helper para detectar si es reciente (últimos 7 días)
  const isRecent = (date: string) => {
    if (!highlightRecent) return false;
    const entryDate = parseISO(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-800 overflow-hidden shadow-lg bg-gray-950"
    >
      <Table>
        {/* Header - JERARQUÍA VISUAL */}
        <TableHeader className="bg-gray-900/80 backdrop-blur-sm">
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold pl-6 uppercase text-xs tracking-wider">
              Fecha
            </TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-xs tracking-wider">
              {role === "paciente" ? "Especialista" : "Paciente"}
            </TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-xs tracking-wider">
              Servicio
            </TableHead>
            <TableHead className="text-gray-400 font-bold text-center uppercase text-xs tracking-wider">
              Estado
            </TableHead>
            <TableHead className="text-gray-400 font-bold text-center uppercase text-xs tracking-wider">
              {role === "paciente" ? "Calificación" : "Duración"}
            </TableHead>
            <TableHead className="text-right pr-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Body - AFFORDANCE */}
        <TableBody className="bg-gray-950">
          <AnimatePresence>
            {entries.map((entry, index) => {
              const recent = isRecent(entry.date);
              
              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onMouseEnter={() => setHoveredRow(entry.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "border-gray-800 transition-all duration-200 cursor-pointer group",
                    hoveredRow === entry.id ? "bg-gray-900/60 border-l-4 border-l-purple-500" : "",
                    recent ? "bg-purple-500/5" : ""
                  )}
                  onClick={() => onViewDetails(entry)}
                >
                  
                  {/* Fecha - RECONOCIMIENTO */}
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <div className="text-white font-semibold">
                          {format(parseISO(entry.date), "d MMM", { locale: es })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(parseISO(entry.date), "yyyy", { locale: es })}
                        </div>
                      </div>
                      {recent && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Persona - JERARQUÍA */}
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-gray-800 rounded-lg mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white truncate">
                          {role === "paciente" ? entry.provider?.name : entry.client?.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {role === "paciente" ? entry.provider?.specialty : 'Paciente Regular'}
                        </span>
                        {role === "paciente" && entry.provider?.location && (
                          <span className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {entry.provider.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Tipo - CHUNKING */}
                  <TableCell>
                    <span className="text-gray-300 font-medium">{entry.type}</span>
                  </TableCell>

                  {/* Estado - PRIMING */}
                  <TableCell className="text-center">
                    {getStatusBadge(entry.status)}
                  </TableCell>

                  {/* Rating / Duración - RECONOCIMIENTO */}
                  <TableCell className="text-center">
                    {role === "paciente" ? (
                      entry.rating ? (
                        <div className="flex justify-center">
                          {getRatingStars(entry.rating, true)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Sin calificar</span>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-medium">{entry.duration}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Acciones - AFFORDANCE */}
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "hover:bg-purple-500/10 hover:text-purple-300 text-gray-400 transition-all duration-200",
                        hoveredRow === entry.id ? "bg-purple-500/10 text-purple-400" : ""
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(entry);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-1 transition-transform duration-200",
                        hoveredRow === entry.id ? "translate-x-1" : ""
                      )} />
                    </Button>
                  </TableCell>

                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </motion.div>
  );
};

/**
 * Variante compacta para vista móvil o sidebar
 */
export const HistoryTableCompact: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-900/30 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-500">Sin registros</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onViewDetails(entry)}
          className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-purple-500/30 hover:bg-gray-900/80 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {role === "paciente" ? entry.provider?.name : entry.client?.name}
                </span>
                {getStatusBadge(entry.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(entry.date), "d MMM", { locale: es })}
                </span>
                <span>•</span>
                <span>{entry.type}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};