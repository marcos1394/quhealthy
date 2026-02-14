"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Calendar, 
  User, 
  FileText, 
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  Download,
  Share2,
  X,
  CheckCircle2,
  Video,
  Phone
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';

/**
 * HistoryDetailModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Header con contexto temporal
 *    - Información principal destacada
 *    - Metadata secundaria en gris
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos para cada campo
 *    - Colores distintivos por rol
 *    - Rating visual con estrellas
 * 
 * 3. FEEDBACK VISUAL
 *    - Animaciones de entrada
 *    - Estados hover claros
 *    - Confirmación de acciones
 * 
 * 4. MINIMIZAR CARGA COGNITIVA
 *    - Información agrupada lógicamente
 *    - Una sección a la vez
 *    - Escaneo visual fácil
 * 
 * 5. CREDIBILIDAD
 *    - Rating visible
 *    - Notas textuales
 *    - Información completa del servicio
 * 
 * 6. AFFORDANCE
 *    - Botones con iconos
 *    - Acciones secundarias disponibles
 *    - Close button visible
 */

// Importamos tipos del componente tabla
import { HistoryEntry } from './HistoryTable';

type UserRole = "paciente" | "proveedor";

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  role: UserRole;
  onOpenChange: (open: boolean) => void;
  onDownloadReceipt?: (entry: HistoryEntry) => void;
  onShare?: (entry: HistoryEntry) => void;
}

// Helper para estrellas - RECONOCIMIENTO VISUAL
const getRatingStars = (rating: number, interactive = false) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, index) => (
      <motion.div
        key={index}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: index * 0.05,
          type: "spring",
          stiffness: 200
        }}
      >
        <Star 
          className={cn(
            "w-5 h-5 transition-all duration-200",
            index < rating 
              ? "text-amber-400 fill-amber-400" 
              : "text-gray-600",
            interactive ? "cursor-pointer hover:scale-110" : ""
          )} 
        />
      </motion.div>
    ))}
  </div>
);

// Helper para badge de estado - PRIMING
const getStatusBadge = (status?: string) => {
  if (!status) return null;

  const configs: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
    completed: {
      text: "Completado",
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle2 className="w-3 h-3" />
    },
    cancelled: {
      text: "Cancelado",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: <X className="w-3 h-3" />
    },
    pending: {
      text: "Pendiente",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: <Clock className="w-3 h-3" />
    }
  };

  const config = configs[status] || configs.completed;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1", config.className)}>
      {config.icon}
      <span>{config.text}</span>
    </Badge>
  );
};

// Helper para tipo de servicio - RECONOCIMIENTO
const getServiceIcon = (type: string) => {
  const normalized = type.toLowerCase();
  
  if (normalized.includes('video') || normalized.includes('teleconsulta')) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }
  if (normalized.includes('presencial') || normalized.includes('consulta')) {
    return <User className="w-5 h-5 text-blue-400" />;
  }
  if (normalized.includes('llamada') || normalized.includes('telefónica')) {
    return <Phone className="w-5 h-5 text-emerald-400" />;
  }
  
  return <FileText className="w-5 h-5 text-gray-400" />;
};

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ 
  entry, 
  role, 
  onOpenChange,
  onDownloadReceipt,
  onShare
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!entry) return null;

  // Handlers con feedback - FEEDBACK INMEDIATO
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadReceipt?.(entry);
      toast.success('Comprobante descargado correctamente');
    } catch (error) {
      toast.error('No se pudo descargar el comprobante');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    onShare?.(entry);
    toast.success('Enlace copiado al portapapeles');
  };

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header mejorado - JERARQUÍA VISUAL */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon container */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 shadow-lg"
              >
                {getServiceIcon(entry.type)}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <DialogTitle className="text-2xl font-black text-white">
                    Detalle del Servicio
                  </DialogTitle>
                  {getStatusBadge(entry.status)}
                </div>
                
                <DialogDescription className="text-gray-400 flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {format(parseISO(entry.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="default"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Sección Principal - CHUNKING */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Información de la persona */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> 
                {role === "paciente" ? "Especialista" : "Paciente"}
              </p>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-2">
                <p className="text-lg font-bold text-white">
                  {role === "paciente" ? entry.provider?.name : entry.client?.name}
                </p>
                {role === "paciente" && entry.provider?.specialty && (
                  <p className="text-sm text-purple-400 font-medium">
                    {entry.provider.specialty}
                  </p>
                )}
                {entry.provider?.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {entry.provider.location}
                  </p>
                )}
              </div>
            </div>

            {/* Información del servicio */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> 
                Tipo de Servicio
              </p>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-2">
                <p className="text-lg font-bold text-white">{entry.type}</p>
                {entry.duration && (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" /> 
                    <span className="font-medium">{entry.duration}</span>
                  </p>
                )}
                {entry.cost && (
                  <p className="text-sm text-emerald-400 flex items-center gap-2 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    ${entry.cost}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <Separator className="bg-gray-800" />

          {/* Rating Section - CREDIBILIDAD */}
          {entry.rating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-3.5 h-3.5" /> 
                {role === "paciente" ? "Tu Calificación" : "Calificación Recibida"}
              </p>
              <div className="bg-gradient-to-r from-amber-500/5 to-amber-600/5 p-5 rounded-xl border border-amber-500/20 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">
                    {entry.rating} de 5 estrellas
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.rating >= 4.5 ? "Excelente experiencia" : 
                     entry.rating >= 3.5 ? "Buena experiencia" : 
                     "Puede mejorar"}
                  </p>
                </div>
                {getRatingStars(entry.rating)}
              </div>
            </motion.div>
          )}

          {/* Notes Section - FEEDBACK VISUAL */}
          {entry.notes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> 
                Notas del Servicio
              </p>
              <div className="relative bg-gray-950/50 p-5 rounded-xl border border-gray-800">
                {/* Quote decoration */}
                <div className="absolute top-3 left-3 text-6xl text-purple-500/10 font-serif leading-none">
                  "
                </div>
                <p className="relative text-sm text-gray-300 italic leading-relaxed pl-6">
                  {entry.notes}
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Actions - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {onDownloadReceipt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Descargando...' : 'Descargar Comprobante'}
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            )}
          </motion.div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer con acciones - JERARQUÍA CLARA */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all duration-200"
          >
            Cerrar
          </Button>
          
          {role === "paciente" && !entry.rating && (
            <Button 
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Star className="w-4 h-4 mr-2" />
              Calificar Servicio
            </Button>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

/**
 * Variante compacta para vista móvil
 */
export const HistoryDetailModalCompact: React.FC<HistoryDetailModalProps> = (props) => {
  return <HistoryDetailModal {...props} />;
};