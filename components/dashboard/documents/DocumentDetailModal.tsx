"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, Download, FileText, Calendar, HardDrive, ShieldCheck, AlertTriangle, CheckCircle2, Clock, X, ExternalLink, Copy, Loader2, Image as ImageIcon, FileCode, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Document } from "./DocumentCard";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';
import { QhSpinner } from "@/components/ui/QhSpinner";

interface DocumentDetailModalProps {
  doc: Document | null; isOpen: boolean; onClose: () => void;
  onDelete?: (id: number) => void; onDownload?: (doc: Document) => void; onShare?: (doc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ doc, isOpen, onClose, onDelete, onDownload, onShare }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewError] = useState(false);
  const t = useTranslations('DashboardDocumentDetail');

  if (!doc) return null;

  const getStatusInfo = () => {
    switch (doc.status) {
      case "verified": return { icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />, text: t('status.verified', { defaultValue: 'VERIFICADO' }), className: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400", description: t('status.verified_desc', { defaultValue: 'DOCUMENTO AUTENTICADO.' }) };
      case "pending": return { icon: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />, text: t('status.pending', { defaultValue: 'EN REVISIÓN' }), className: "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400", description: t('status.pending_desc', { defaultValue: 'PENDIENTE DE AUDITORÍA.' }) };
      case "rejected": return { icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />, text: t('status.rejected', { defaultValue: 'RECHAZADO' }), className: "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400", description: t('status.rejected_desc', { defaultValue: 'DOCUMENTO INVÁLIDO.' }) };
      default: return { icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />, text: "UNKNOWN", className: "border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400", description: "" };
    }
  };
  const statusInfo = getStatusInfo();

  const getFileTypeInfo = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("pdf")) return { icon: <FileText className="w-6 h-6 text-red-500" strokeWidth={1.5} />, canPreview: true };
    if (["jpg", "png", "imagen"].some(x => t.includes(x))) return { icon: <ImageIcon className="w-6 h-6 text-blue-500" strokeWidth={1.5} />, canPreview: true };
    if (t.includes("certificado")) return { icon: <ShieldCheck className="w-6 h-6 text-amber-500" strokeWidth={1.5} />, canPreview: true };
    if (t.includes("video")) return { icon: <Film className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />, canPreview: false };
    return { icon: <FileCode className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />, canPreview: false };
  };
  const fileTypeInfo = getFileTypeInfo(doc.type);

  const handleDelete = async () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    setIsDeleting(true);
    try { await onDelete?.(doc.id); toast.success("REGISTRO ELIMINADO."); onClose(); }
    catch (e) { handleApiError(e); setIsDeleting(false); }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try { await onDownload?.(doc); toast.success("EXTRACCIÓN INICIADA."); }
    catch (e) { handleApiError(e); }
    finally { setIsDownloading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isDownloading && !isDeleting) {
        onClose();
        setTimeout(() => setShowDeleteConfirm(false), 300);
      }
    }}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-3xl p-0 rounded-none overflow-hidden flex flex-col max-h-[90vh] shadow-2xl transition-colors">
        
        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              {fileTypeInfo.icon}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 truncate">
                Visor de Archivo • ID-{doc.id}
              </p>
              <DialogTitle className="text-lg md:text-xl font-semibold text-black dark:text-white uppercase tracking-tight truncate leading-none mb-2">
                {doc.name}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">
                {doc.description || "DOCUMENTO REGISTRADO EN SISTEMA"}
              </DialogDescription>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors shrink-0 hover:bg-gray-50 dark:hover:bg-[#050505]"
          >
            <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* BODY (BLUEPRINT GRID) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">
          
          {/* Previsualizador de Archivo Técnico */}
          <div className={cn(
            "w-full h-48 md:h-64 border-b border-black/10 dark:border-white/10 flex flex-col items-center justify-center transition-colors",
            fileTypeInfo.canPreview ? "bg-black text-white" : "bg-gray-50 dark:bg-[#050505] text-gray-400"
          )}>
            {fileTypeInfo.canPreview && !previewError ? (
              <div className="text-center space-y-4">
                <Eye className="w-8 h-8 text-gray-500 mx-auto" strokeWidth={1.5} />
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  VISTA PREVIA DISPONIBLE
                </p>
                <button className="flex items-center gap-2 border border-white/30 bg-transparent hover:bg-white hover:text-black transition-colors px-6 h-10 text-[9px] font-bold uppercase tracking-widest mx-auto">
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} /> ABRIR VISOR
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mx-auto text-black dark:text-white">
                  {fileTypeInfo.icon}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest">
                  VISTA PREVIA NO DISPONIBLE PARA ESTE FORMATO
                </p>
              </div>
            )}
          </div>

          {/* Matriz de Metadatos */}
          <div className="grid grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            
            <div className="border-r border-b border-black/10 dark:border-white/10 p-6 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <HardDrive className="w-3 h-3" strokeWidth={1.5} /> FORMATO
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                {doc.type}
              </p>
            </div>

            <div className="border-b border-black/10 dark:border-white/10 p-6 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" strokeWidth={1.5} /> REGISTRO
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                {new Date(doc.uploadedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>

            {doc.size && (
              <div className="border-r border-b border-black/10 dark:border-white/10 p-6 flex flex-col justify-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                  <HardDrive className="w-3 h-3" strokeWidth={1.5} /> PESO
                </p>
                <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                  {doc.size}
                </p>
              </div>
            )}

            {/* Estado de Verificación Integrado */}
            <div className={cn("col-span-2 sm:col-span-1 p-6 flex flex-col justify-center border-b border-black/10 dark:border-white/10 transition-colors", statusInfo.className)}>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" strokeWidth={1.5} /> AUDITORÍA
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
                {statusInfo.icon} {statusInfo.text}
              </div>
            </div>
          </div>

          {/* Acciones de Vínculo */}
          <div className="p-6 bg-gray-50 dark:bg-[#050505] flex flex-wrap gap-4 border-b border-black/10 dark:border-white/10">
            <button 
              onClick={() => { navigator.clipboard.writeText(doc.url); toast.success("ENLACE COPIADO."); }}
              className="h-10 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none"
            >
              <Copy className="w-3 h-3" strokeWidth={1.5} /> COPIAR ENLACE
            </button>
            {onShare && (
              <button 
                onClick={() => onShare(doc)}
                className="h-10 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} /> COMPARTIR
              </button>
            )}
          </div>
        </div>

        {/* FOOTER DE COMANDOS ESTRICTO */}
        <div className="bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 p-6 flex flex-col sm:flex-row justify-between gap-6 shrink-0">
          
          <div className="flex-1">
            {onDelete && (
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-0 border border-red-500">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)} 
                      className="h-12 px-6 flex-1 bg-white dark:bg-[#0a0a0a] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none border-r border-red-500"
                    >
                      ANULAR
                    </button>
                    <button 
                      onClick={handleDelete} 
                      disabled={isDeleting} 
                      className="h-12 px-6 flex-1 bg-red-600 text-white hover:bg-red-700 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
                    >
                      {isDeleting ? <><QhSpinner size="sm" className="text-white" /> ELIMINANDO...</> : <><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> CONFIRMAR ELIMINACIÓN</>}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full sm:w-auto h-12 px-6 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> ELIMINAR ARCHIVO
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="h-12 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
            >
              CERRAR VISOR
            </button>
            <button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
            >
              {isDownloading ? <><QhSpinner size="sm" className="text-current" /> EXTRAYENDO...</> : <><Download className="w-3.5 h-3.5" strokeWidth={1.5} /> EXTRAER DOCUMENTO</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};