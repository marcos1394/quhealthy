"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Star, Calendar, Clock, ChevronRight, CheckCircle2, XCircle, RefreshCw, User, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type HistoryEntry = {
  duration: ReactNode;
  id: number;
  date: string;
  type: string;
  status: "completed" | "cancelled" | "rescheduled" | "pending";
  rating?: number;
  notes?: string;
  provider: { name: string; specialty: string; image?: string; location?: string };
  client: { name: string };
  priceAtBooking?: number;
  cost?: number;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
};

type UserRole = "paciente" | "proveedor";

interface HistoryTableProps {
  entries: HistoryEntry[];
  role: UserRole;
  onViewDetails: (entry: HistoryEntry) => void;
  isLoading?: boolean;
  highlightRecent?: boolean;
}

const getStatusConfig = (status: HistoryEntry["status"], t: (key: string, opts?: { defaultValue?: string }) => string) => {
  const configs = {
    completed: { 
      icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />, 
      text: t("status_completed", { defaultValue: 'Completado' }), 
      className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" 
    },
    cancelled: { 
      icon: <XCircle className="w-3.5 h-3.5" strokeWidth={2} />, 
      text: t("status_cancelled", { defaultValue: 'Anulado' }), 
      className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40" 
    },
    rescheduled: { 
      icon: <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />, 
      text: t("status_rescheduled", { defaultValue: 'Reagendado' }), 
      className: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40" 
    },
    pending: { 
      icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} />, 
      text: t("status_pending", { defaultValue: 'Pendiente' }), 
      className: "border-gray-200 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700" 
    },
  };
  const config = configs[status] || configs["pending"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border shadow-sm whitespace-nowrap", config.className)}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

const getRatingStars = (rating: number) => (
  <div className="flex items-center justify-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          "w-3.5 h-3.5", 
          i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-800"
        )} 
        strokeWidth={1.5} 
      />
    ))}
    <span className="text-xs font-mono font-bold text-gray-500 ml-1">({rating.toFixed(1)})</span>
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
  const t = useTranslations("DashboardHistory") as unknown as (key: string, opts?: { defaultValue?: string }) => string;

  if (!isLoading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
          <FileText className="w-6 h-6 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {t("empty_title", { defaultValue: 'Registro Vacío' })}
        </p>
        <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
          {role === "paciente" 
            ? t("empty_patient", { defaultValue: 'Aún no hay historial clínico registrado en la plataforma.' }) 
            : t("empty_provider", { defaultValue: 'No existen registros de atención en el periodo seleccionado.' })}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-[#050505]">
            <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
              <TableHead className="text-xs font-bold text-gray-500 pl-6 h-12">{t("col_date", { defaultValue: 'Fecha' })}</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 h-12">{role === "paciente" ? t("col_specialist", { defaultValue: 'Especialista' }) : t("col_patient", { defaultValue: 'Paciente' })}</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 h-12">{t("col_service", { defaultValue: 'Servicio' })}</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 text-center h-12">{t("col_status", { defaultValue: 'Estado' })}</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 text-center h-12">{role === "paciente" ? t("col_rating", { defaultValue: 'Evaluación' }) : t("col_duration", { defaultValue: 'Duración' })}</TableHead>
              <TableHead className="text-right pr-6 text-xs font-bold text-gray-500 h-12">{t("col_actions", { defaultValue: 'Acción' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800/60">
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6 text-right" : ""}>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md w-full max-w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const isRecent = (date: string) => {
    if (!highlightRecent) return false;
    const diffDays = Math.floor((new Date().getTime() - parseISO(date).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-[#050505]">
          <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
            <TableHead className="text-xs font-bold text-gray-500 pl-6 h-12">{t("col_date", { defaultValue: 'Fecha' })}</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 h-12">{role === "paciente" ? t("col_specialist", { defaultValue: 'Especialista' }) : t("col_patient", { defaultValue: 'Paciente' })}</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 h-12">{t("col_service", { defaultValue: 'Servicio' })}</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 text-center h-12">{t("col_status", { defaultValue: 'Estado' })}</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 text-center h-12">{role === "paciente" ? t("col_rating", { defaultValue: 'Evaluación' }) : t("col_duration", { defaultValue: 'Duración' })}</TableHead>
            <TableHead className="text-right pr-6 text-xs font-bold text-gray-500 h-12">{t("col_actions", { defaultValue: 'Acción' })}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {entries.map((entry, index) => {
              const recent = isRecent(entry.date);
              return (
                <motion.tr 
                  key={entry.id} 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.02 }}
                  onMouseEnter={() => setHoveredRow(entry.id)} 
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onViewDetails(entry)}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800/60 transition-colors cursor-pointer group",
                    hoveredRow === entry.id ? "bg-gray-50/80 dark:bg-[#111]" : "bg-white dark:bg-[#0a0a0a]",
                    recent && hoveredRow !== entry.id ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                  )}
                >
                  {/* Fecha */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:border-emerald-200 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {format(parseISO(entry.date), "d MMM", { locale: es })}
                        </div>
                        <div className="text-[11px] font-semibold text-gray-400 font-mono">
                          {format(parseISO(entry.date), "yyyy")}
                        </div>
                      </div>
                      {recent && (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold ml-1 shadow-sm">
                          {t("new_badge", { defaultValue: 'Nuevo' })}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Persona */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:border-emerald-200 transition-colors shadow-sm">
                        <User className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {role === "paciente" ? entry.provider?.name : entry.client?.name}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 truncate">
                          {role === "paciente" ? entry.provider?.specialty : t("regular_patient", { defaultValue: 'Paciente' })}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Servicio */}
                  <TableCell className="py-4">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {entry.type}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="text-center py-4">
                    <div className="flex justify-center">
                      {getStatusConfig(entry.status, t)}
                    </div>
                  </TableCell>

                  {/* Rating / Duración */}
                  <TableCell className="text-center py-4">
                    {role === "paciente" ? (
                      entry.rating ? (
                        <div className="flex justify-center">{getRatingStars(entry.rating)}</div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">{t("not_rated", { defaultValue: 'Sin evaluar' })}</span>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                        <span className="font-mono font-bold">{entry.duration}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right pr-6 py-4">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onViewDetails(entry); }}
                      className={cn(
                        "h-8 px-3 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center justify-center ml-auto gap-1.5",
                        hoveredRow === entry.id 
                          ? "bg-emerald-600 text-white border-emerald-600" 
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111]"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      <span className="hidden sm:inline">{t("view_details", { defaultValue: 'Ver detalle' })}</span>
                      <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", hoveredRow === entry.id ? "translate-x-0.5" : "")} strokeWidth={2} />
                    </button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export const HistoryTableCompact: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails }) => {
  const t = useTranslations("DashboardHistory") as unknown as (key: string, opts?: { defaultValue?: string }) => string;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-500">{t("no_records", { defaultValue: 'No existen registros históricos.' })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map((entry, index) => (
        <motion.div 
          key={entry.id} 
          initial={{ opacity: 0, y: 4 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: index * 0.03 }}
          onClick={() => onViewDetails(entry)}
          className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
        >
          <div className="flex-1 space-y-1.5 min-w-0 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {role === "paciente" ? entry.provider?.name : entry.client?.name}
              </span>
              {getStatusConfig(entry.status, t)}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{format(parseISO(entry.date), "d MMM yyyy", { locale: es })}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{entry.type}</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 group-hover:border-emerald-200 flex items-center justify-center transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};