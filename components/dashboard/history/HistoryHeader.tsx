"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  UserCheck, 
  Briefcase, 
  FileDown, 
  History,
  TrendingUp,
  Calendar,
  Download,
  Loader2,
  CheckCircle2,
  Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';

/**
 * HistoryHeader Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Título prominente
 *    - Contador secundario
 *    - Acciones terciarias
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos distintivos por rol
 *    - Badges con información contextual
 *    - Colores consistentes
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Loading states en botones
 *    - Success confirmation
 *    - Toast notifications
 * 
 * 4. PRIMING
 *    - Colores sugieren categoría
 *    - Iconos preparan contexto
 *    - Números destacados
 * 
 * 5. AFFORDANCE
 *    - Botones con estados claros
 *    - Hover effects
 *    - Disabled states visibles
 * 
 * 6. CREDIBILIDAD
 *    - Stats visibles
 *    - Información actualizada
 *    - Contador en tiempo real
 */

// Tipos
export type UserRole = "paciente" | "proveedor";

interface HistoryHeaderProps {
  role: UserRole;
  entryCount: number;
  onExport: () => void;
  onShare?: () => void;
  lastUpdated?: Date;
  showStats?: boolean;
  periodStats?: {
    thisMonth: number;
    lastMonth: number;
  };
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ 
  role, 
  entryCount, 
  onExport,
  onShare,
  lastUpdated,
  showStats = false,
  periodStats
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Helper para info por rol - RECONOCIMIENTO
  const getRoleInfo = () => {
    if (role === "paciente") {
      return {
        icon: <UserCheck className="w-8 h-8 text-purple-400" />,
        title: "Historial de Consultas",
        subtitle: "Tus consultas y tratamientos",
        bgClass: "bg-purple-500/10 border-purple-500/20",
        accentColor: "text-purple-400"
      };
    }
    return {
      icon: <Briefcase className="w-8 h-8 text-blue-400" />,
      title: "Historial de Servicios",
      subtitle: "Servicios brindados a pacientes",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      accentColor: "text-blue-400"
    };
  };

  const roleInfo = getRoleInfo();

  // Helper para calcular tendencia - PRIMING
  const getTrendInfo = () => {
    if (!periodStats) return null;
    
    const change = periodStats.thisMonth - periodStats.lastMonth;
    const percentChange = periodStats.lastMonth > 0 
      ? Math.round((change / periodStats.lastMonth) * 100)
      : 0;

    return {
      change,
      percentChange,
      isPositive: change >= 0
    };
  };

  const trendInfo = getTrendInfo();

  // Handler para export - FEEDBACK INMEDIATO
  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await onExport();
      
      setExportSuccess(true);
      toast.success('Archivo CSV descargado correctamente', {
        icon: <span>"📊"</span>
      });

      // Reset success state después de 3s
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      toast.error('No se pudo exportar el archivo');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    onShare?.();
    toast.success('Enlace copiado al portapapeles');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left Section - JERARQUÍA VISUAL */}
        <div className="flex items-start gap-4 flex-1">
          
          {/* Icon Container - RECONOCIMIENTO */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={cn(
              "p-4 rounded-2xl border shadow-lg flex-shrink-0",
              roleInfo.bgClass
            )}
          >
            {roleInfo.icon}
          </motion.div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0 space-y-3">
            
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {roleInfo.title}
              </h1>
              <p className="text-sm text-gray-400">
                {roleInfo.subtitle}
              </p>
            </div>

            {/* Stats Row - CHUNKING */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Entry Count - PRIMING */}
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  <span className="font-bold text-white text-lg">{entryCount}</span>
                  {' '}{entryCount === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              {/* Trend Badge - FEEDBACK VISUAL */}
              {trendInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge 
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1 font-semibold",
                      trendInfo.isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}
                  >
                    <TrendingUp className={cn(
                      "w-3 h-3",
                      !trendInfo.isPositive ? "rotate-180" : ""
                    )} />
                    {trendInfo.isPositive ? '+' : ''}{trendInfo.percentChange}% este mes
                  </Badge>
                </motion.div>
              )}

              {/* Last Updated - CREDIBILIDAD */}
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Actualizado {lastUpdated.toLocaleDateString('es-MX', { 
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Period Stats - FEEDBACK CONTEXTUAL */}
            {showStats && periodStats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 pt-2 text-sm"
              >
                <div>
                  <span className="text-gray-500">Este mes: </span>
                  <span className="font-bold text-white">{periodStats.thisMonth}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mes pasado: </span>
                  <span className="font-semibold text-gray-400">{periodStats.lastMonth}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Section - Actions - AFFORDANCE */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          
          {/* Share Button (opcional) */}
          {onShare && (
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          )}

          {/* Export Button - FEEDBACK INMEDIATO */}
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || entryCount === 0}
            className={cn(
              "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200 min-w-[140px]",
              exportSuccess ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : ""
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                ¡Listo!
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar CSV
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const HistoryHeaderCompact: React.FC<HistoryHeaderProps> = (props) => {
  const roleInfo = props.role === "paciente" 
    ? { icon: <UserCheck className="w-6 h-6 text-purple-400" />, title: "Consultas" }
    : { icon: <Briefcase className="w-6 h-6 text-blue-400" />, title: "Servicios" };

  return (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          props.role === "paciente" 
            ? "bg-purple-500/10 border border-purple-500/20" 
            : "bg-blue-500/10 border border-blue-500/20"
        )}>
          {roleInfo.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{roleInfo.title}</h2>
          <p className="text-xs text-gray-400">{props.entryCount} registros</p>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={props.onExport}
        className="border-gray-700 hover:bg-gray-800"
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};