"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Eye, 
  Download, 
  FileText, 
  Calendar, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
  Copy,
  Loader2,
  Image as ImageIcon,
  FileCode,
  Film
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-toastify';

// Importamos el tipo Document
import { Document } from './DocumentCard';
import { cn } from '@/lib/utils';

/**
 * DocumentDetailModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Preview destacado arriba
 *    - Metadata organizada en grid
 *    - Acciones al final (flujo natural)
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Estados de loading
 *    - Confirmación de acciones
 *    - Toast notifications
 * 
 * 3. MINIMIZAR ERRORES
 *    - Confirmación para delete
 *    - Estados disabled claros
 *    - Validaciones visuales
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos para cada metadata
 *    - Estados con colores distintivos
 *    - Badges visuales
 * 
 * 5. AFFORDANCE
 *    - Botones con estados hover
 *    - Preview interactive
 *    - Links externos claros
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Información agrupada lógicamente
 *    - Una acción principal destacada
 *    - Metadata escaneble
 */

interface DocumentDetailModalProps {
  doc: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onDownload?: (doc: Document) => void;
  onShare?: (doc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ 
  doc, 
  isOpen, 
  onClose, 
  onDelete, 
  onDownload,
  onShare
}) => {
  // Estados para feedback - FEEDBACK INMEDIATO
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  if (!doc) return null;

  // Helper para estado - RECONOCIMIENTO VISUAL
  const getStatusInfo = () => {
    switch (doc.status) {
      case 'verified':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Verificado por QuHealthy',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          description: 'Este documento ha sido revisado y aprobado'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'En revisión',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          description: 'Estamos verificando la autenticidad de este documento'
        };
      case 'rejected':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Rechazado',
          className: 'bg-red-500/10 text-red-400 border-red-500/20',
          description: 'Este documento no cumple con los requisitos'
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Desconocido',
          className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Helper para tipo de archivo - RECONOCIMIENTO
  const getFileTypeInfo = (type: string) => {
    const normalized = type.toLowerCase();
    
    if (normalized.includes('pdf')) {
      return { icon: <FileText className="w-12 h-12 text-red-400" />, canPreview: true };
    }
    if (normalized.includes('imagen') || normalized.includes('jpg') || normalized.includes('png')) {
      return { icon: <ImageIcon className="w-12 h-12 text-blue-400" />, canPreview: true };
    }
    if (normalized.includes('certificado')) {
      return { icon: <ShieldCheck className="w-12 h-12 text-yellow-400" />, canPreview: true };
    }
    if (normalized.includes('video')) {
      return { icon: <Film className="w-12 h-12 text-purple-400" />, canPreview: false };
    }
    
    return { icon: <FileCode className="w-12 h-12 text-gray-400" />, canPreview: false };
  };

  const fileTypeInfo = getFileTypeInfo(doc.type);

  // Handlers con feedback - MINIMIZAR ERRORES
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete?.(doc.id);
      toast.success('Documento eliminado correctamente');
      onClose();
    } catch (error) {
      toast.error('No se pudo eliminar el documento');
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload?.(doc);
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('No se pudo descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(doc.url);
    toast.success('Enlace copiado al portapapeles');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header mejorado - JERARQUÍA VISUAL */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
                {fileTypeInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-white truncate mb-1">
                  {doc.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm">
                  {doc.description || 'Documento subido a QuHealthy'}
                </DialogDescription>
                
                {/* Status badge - FEEDBACK VISUAL */}
                <div className="mt-3">
                  <Badge 
                    variant="outline" 
                    className={cn("flex items-center gap-2 w-fit", statusInfo.className)}
                  >
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="default"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Preview Area mejorado - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className={cn(
              "w-full h-64 rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-300",
              fileTypeInfo.canPreview 
                ? "border-purple-500/30 bg-gray-950/50 hover:border-purple-500/50" 
                : "border-gray-800 bg-gray-950/30"
            )}>
              {fileTypeInfo.canPreview && !previewError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-950">
                  {/* Aquí iría el preview real */}
                  <div className="text-center space-y-3">
                    <Eye className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
                    <p className="text-sm text-gray-400">Vista previa disponible</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir en nueva pestaña
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                  {fileTypeInfo.icon}
                  <span className="text-sm">Vista previa no disponible para este tipo de archivo</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Metadata Grid - CHUNKING */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Tipo de archivo */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5" /> 
                Tipo de archivo
              </p>
              <p className="text-base font-semibold text-white uppercase bg-gray-800/50 px-3 py-2 rounded-lg inline-block">
                {doc.type}
              </p>
            </div>

            {/* Fecha de subida */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> 
                Fecha de carga
              </p>
              <p className="text-base font-semibold text-white bg-gray-800/50 px-3 py-2 rounded-lg inline-block">
                {new Date(doc.uploadedAt).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Tamaño de archivo */}
            {doc.size && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5" /> 
                  Tamaño
                </p>
                <p className="text-base font-semibold text-white bg-gray-800/50 px-3 py-2 rounded-lg inline-block">
                  {doc.size}
                </p>
              </div>
            )}

            {/* Estado con descripción */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> 
                Estado de verificación
              </p>
              <div className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-xl border",
                statusInfo.className
              )}>
                {statusInfo.icon}
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{statusInfo.text}</p>
                  <p className="text-xs opacity-80">{statusInfo.description}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick actions - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar enlace
            </Button>
            
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(doc)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            )}
          </motion.div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer con acciones - JERARQUÍA CLARA */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          {/* Delete con confirmación - MINIMIZAR ERRORES */}
          {onDelete && (
            <div className="flex gap-2">
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Confirmar
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Primary actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};