"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable deslop/unused-export */;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, Calendar, User, FileText, Clock, MapPin, DollarSign, MessageSquare, Download, Share2, X, CheckCircle2, Video, Phone, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { HistoryEntry } from "./HistoryTable";
import { QhSpinner } from "@/components/ui/QhSpinner";

type UserRole = "paciente" | "proveedor";

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  role: UserRole;
  onOpenChange: (open: boolean) => void;
  onDownloadReceipt?: (entry: HistoryEntry) => void;
  onShare?: (entry: HistoryEntry) => void;
}

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("w-4 h-4", i < rating ? "text-black dark:text-white fill-black dark:fill-white" : "text-gray-200 dark:text-gray-800")} strokeWidth={1.5} />
    ))}
  </div>
);

const getServiceIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("video") || normalized.includes("teleconsulta")) return <Video className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />;
  if (normalized.includes("presencial") || normalized.includes("consulta")) return <User className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />;
  if (normalized.includes("llamada") || normalized.includes("telefónica")) return <Phone className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />;
  return <FileText className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />;
};

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, role, onOpenChange, onDownloadReceipt, onShare }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const t = useTranslations("DashboardHistoryDetail");

  if (!entry) return null;

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const configs: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      completed: { text: t("status_completed" as never) || "COMPLETADO", className: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> },
      cancelled: { text: t("status_cancelled" as never) || "ANULADO", className: "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400", icon: <X className="w-3 h-3" strokeWidth={1.5} /> },
      pending: { text: t("status_pending" as never) || "PENDIENTE", className: "border-gray-500/30 bg-gray-50 text-gray-700 dark:bg-[#111] dark:text-gray-400", icon: <Clock className="w-3 h-3" strokeWidth={1.5} /> },
      rescheduled: { text: t("status_rescheduled" as never) || "REAGENDADO", className: "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400", icon: <Clock className="w-3 h-3" strokeWidth={1.5} /> },
    };
    const config = configs[status] || configs.completed;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-none whitespace-nowrap", config.className)}>
        {config.icon}{config.text}
      </span>
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadReceipt?.(entry);
      toast.success(t("download_success", { defaultValue: 'EXTRACCIÓN COMPLETADA.' }));
    } catch {
      return;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    onShare?.(entry);
    toast.success(t("share_success", { defaultValue: 'ENLACE OPERATIVO COPIADO.' }));
  };

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-3xl p-0 rounded-none overflow-hidden flex flex-col max-h-[90vh] shadow-2xl transition-colors">

        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              {getServiceIcon(entry.type)}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  REGISTRO • ID-{entry.id}
                </p>
                {getStatusBadge(entry.status)}
              </div>
              <DialogTitle className="text-xl md:text-2xl font-semibold text-black dark:text-white uppercase tracking-tight truncate leading-none mb-2">
                {t("title", { defaultValue: 'EXPEDIENTE DE SERVICIO' })}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                <span>{format(parseISO(entry.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
              </DialogDescription>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors shrink-0 hover:bg-gray-50 dark:hover:bg-[#050505]"
          >
            <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* BODY (BLUEPRINT GRID) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">

          {/* Fila 1: Paciente y Servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            
            {/* Persona */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <User className="w-3 h-3" strokeWidth={1.5} /> 
                {role === "paciente" ? t("specialist_label", { defaultValue: 'ESPECIALISTA' }) : t("patient_label", { defaultValue: 'PACIENTE' })}
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-1">
                {role === "paciente" ? entry.provider?.name : entry.client?.name}
              </p>
              {role === "paciente" && entry.provider?.specialty && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  {entry.provider.specialty}
                </p>
              )}
              {entry.provider?.location && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3 h-3" strokeWidth={1.5} />
                  {entry.provider.location}
                </p>
              )}
            </div>

            {/* Servicio */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" strokeWidth={1.5} /> 
                {t("service_type", { defaultValue: 'CONCEPTO OPERATIVO' })}
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-3">
                {entry.type}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {entry.duration && (
                  <span className="flex items-center gap-1.5 px-2 py-1 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {entry.duration}
                  </span>
                )}
                {entry.cost && (
                  <span className="flex items-center gap-1.5 px-2 py-1 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-[9px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    <DollarSign className="w-3 h-3" strokeWidth={1.5} />
                    {entry.cost}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fila 2: Timeline de Servicio */}
          {(entry.arrivedAt || entry.startedAt || entry.completedAt) && (
            <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <div className="px-6 md:px-8 py-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Clock className="w-3 h-3" strokeWidth={1.5} /> 
                  {t("service_timeline", { defaultValue: "LÍNEA DE TIEMPO DEL SERVICIO" })}
                </p>
              </div>
              
              <div className="p-0">
                {entry.arrivedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-8 py-4 border-b border-black/10 dark:border-white/10 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5}/> 
                      {t("timeline_arrival", { defaultValue: "REGISTRO DE LLEGADA" })}
                    </span>
                    <span className="font-mono text-xs font-semibold text-black dark:text-white bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black/10 dark:border-white/10">
                      {format(parseISO(entry.arrivedAt), "HH:mm", { locale: es })}
                    </span>
                  </div>
                )}
                
                {entry.arrivedAt && entry.startedAt && (
                  <div className="flex justify-end px-6 md:px-8 py-3 bg-gray-50 dark:bg-[#111] border-b border-black/10 dark:border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {t("timeline_wait", { defaultValue: "TIEMPO DE ESPERA:" })} {Math.floor((new Date(entry.startedAt).getTime() - new Date(entry.arrivedAt).getTime())/60000)} MIN
                    </span>
                  </div>
                )}

                {entry.startedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-8 py-4 border-b border-black/10 dark:border-white/10 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5}/> 
                      {t("timeline_start", { defaultValue: "INICIO DE CONSULTA" })}
                    </span>
                    <span className="font-mono text-xs font-semibold text-black dark:text-white bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black/10 dark:border-white/10">
                      {format(parseISO(entry.startedAt), "HH:mm", { locale: es })}
                    </span>
                  </div>
                )}

                {entry.startedAt && entry.completedAt && (
                  <div className="flex justify-end px-6 md:px-8 py-3 bg-gray-50 dark:bg-[#111] border-b border-black/10 dark:border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Video className="w-3 h-3" strokeWidth={1.5} />
                      {t("timeline_consultation", { defaultValue: "DURACIÓN DE CONSULTA:" })} {Math.floor((new Date(entry.completedAt).getTime() - new Date(entry.startedAt).getTime())/60000)} MIN
                    </span>
                  </div>
                )}

                {entry.completedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-8 py-4 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5}/> 
                      {t("timeline_completed", { defaultValue: "SERVICIO FINALIZADO" })}
                    </span>
                    <span className="font-mono text-xs font-semibold text-black dark:text-white bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black/10 dark:border-white/10">
                      {format(parseISO(entry.completedAt), "HH:mm", { locale: es })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {entry.rating && (
            <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                  <Star className="w-3 h-3" strokeWidth={1.5} /> 
                  {role === "paciente" ? t("your_rating", { defaultValue: 'TU EVALUACIÓN' }) : t("received_rating", { defaultValue: 'EVALUACIÓN RECIBIDA' })}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {entry.rating >= 4.5 ? t("excellent", { defaultValue: 'EXCELENTE' }) : entry.rating >= 3.5 ? t("good", { defaultValue: 'BUENO' }) : t("can_improve", { defaultValue: 'MEJORABLE' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getRatingStars(entry.rating)}
                <span className="text-sm font-semibold text-black dark:text-white border border-black/10 dark:border-white/10 px-2 py-1 bg-gray-50 dark:bg-[#050505]">
                  {entry.rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" strokeWidth={1.5} /> 
                {t("service_notes", { defaultValue: 'OBSERVACIONES DEL SERVICIO' })}
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                {entry.notes}
              </p>
            </div>
          )}

          {/* Quick Actions (Inside Body) */}
          {(onDownloadReceipt || onShare) && (
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-wrap gap-4 border-b border-black/10 dark:border-white/10">
              {onDownloadReceipt && (
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="h-10 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
                >
                  {isDownloading ? <><QhSpinner size="sm" className="text-current" /> EXTRAYENDO...</> : <><Download className="w-3.5 h-3.5" strokeWidth={1.5} /> {t("download_receipt", { defaultValue: 'EXTRAER RECIBO' })}</>}
                </button>
              )}
              {onShare && (
                <button 
                  onClick={handleShare}
                  className="h-10 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
                >
                  <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} /> {t("share", { defaultValue: 'COMPARTIR' })}
                </button>
              )}
            </div>
          )}
        </div>

        {/* FOOTER DE COMANDOS ESTRICTO */}
        <div className="bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 p-6 flex flex-col sm:flex-row justify-between gap-4 shrink-0">
          <div className="flex-1" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onOpenChange(false)}
              className="h-12 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
            >
              {t("close", { defaultValue: 'CERRAR EXPEDIENTE' })}
            </button>
            {role === "paciente" && !entry.rating && (
              <button 
                className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none w-full sm:w-auto"
              >
                <Star className="w-3.5 h-3.5" strokeWidth={1.5} /> {t("rate_service", { defaultValue: 'EVALUAR SERVICIO' })}
              </button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

const HistoryDetailModalCompact: React.FC<HistoryDetailModalProps> = (props) => {
  return <HistoryDetailModal {...props} />;
};