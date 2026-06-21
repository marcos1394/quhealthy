"use client";

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
    completed: { icon: <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />, text: t("status_completed", { defaultValue: 'COMPLETADO' }), className: "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400" },
    cancelled: { icon: <XCircle className="w-3 h-3" strokeWidth={1.5} />, text: t("status_cancelled", { defaultValue: 'ANULADO' }), className: "border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400" },
    rescheduled: { icon: <RefreshCw className="w-3 h-3" strokeWidth={1.5} />, text: t("status_rescheduled", { defaultValue: 'REAGENDADO' }), className: "border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400" },
    pending: { icon: <Clock className="w-3 h-3" strokeWidth={1.5} />, text: t("status_pending", { defaultValue: 'PENDIENTE' }), className: "border-gray-500/30 bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-400" },
  };
  const config = configs[status] || configs["pending"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-none whitespace-nowrap", config.className)}>
      {config.icon}{config.text}
    </span>
  );
};

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("w-3 h-3", i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700")} strokeWidth={1.5} />
    ))}
    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">({rating}/5)</span>
  </div>
);

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails, isLoading = false, highlightRecent = true }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const t = useTranslations("DashboardHistory") as unknown as (key: string, opts?: { defaultValue?: string }) => string;

  if (!isLoading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10">
        <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
          <FileText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">{t("empty_title", { defaultValue: 'REGISTRO VACÍO' })}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center max-w-xs leading-relaxed">
          {role === "paciente" ? t("empty_patient", { defaultValue: 'AÚN NO HAY HISTORIAL CLÍNICO.' }) : t("empty_provider", { defaultValue: 'NO EXISTEN REGISTROS DE ATENCIÓN EN EL PERIODO SELECCIONADO.' })}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/10 dark:border-white/10 hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 pl-6 h-14">{t("col_date", { defaultValue: 'FECHA' })}</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{role === "paciente" ? t("col_specialist", { defaultValue: 'ESPECIALISTA' }) : t("col_patient", { defaultValue: 'PACIENTE' })}</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{t("col_service", { defaultValue: 'SERVICIO' })}</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center h-14">{t("col_status", { defaultValue: 'ESTADO' })}</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center h-14">{role === "paciente" ? t("col_rating", { defaultValue: 'EVALUACIÓN' }) : t("col_duration", { defaultValue: 'DURACIÓN' })}</TableHead>
              <TableHead className="text-right pr-6 text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{t("col_actions", { defaultValue: 'ACCIÓN' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-b border-black/10 dark:border-white/10">
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6" : ""}>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse w-full max-w-[120px]" />
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
    <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-[#050505]">
          <TableRow className="border-b border-black/10 dark:border-white/10 hover:bg-transparent">
            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 pl-6 h-14">{t("col_date", { defaultValue: 'FECHA' })}</TableHead>
            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{role === "paciente" ? t("col_specialist", { defaultValue: 'ESPECIALISTA' }) : t("col_patient", { defaultValue: 'PACIENTE' })}</TableHead>
            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{t("col_service", { defaultValue: 'SERVICIO' })}</TableHead>
            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center h-14">{t("col_status", { defaultValue: 'ESTADO' })}</TableHead>
            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center h-14">{role === "paciente" ? t("col_rating", { defaultValue: 'EVALUACIÓN' }) : t("col_duration", { defaultValue: 'DURACIÓN' })}</TableHead>
            <TableHead className="text-right pr-6 text-[9px] font-bold uppercase tracking-widest text-gray-500 h-14">{t("col_actions", { defaultValue: 'ACCIÓN' })}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {entries.map((entry, index) => {
              const recent = isRecent(entry.date);
              return (
                <motion.tr key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                  onMouseEnter={() => setHoveredRow(entry.id)} onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "border-b border-black/10 dark:border-white/10 transition-colors cursor-pointer group",
                    hoveredRow === entry.id ? "bg-gray-50 dark:bg-[#111]" : "bg-white dark:bg-[#0a0a0a]",
                    recent && hoveredRow !== entry.id ? "bg-black/5 dark:bg-white/5" : ""
                  )}
                  onClick={() => onViewDetails(entry)}>

                  {/* Date */}
                  <TableCell className="pl-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                          {format(parseISO(entry.date), "d MMM", { locale: es })}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                          {format(parseISO(entry.date), "yyyy")}
                        </div>
                      </div>
                      {recent && (
                        <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest ml-2">
                          {t("new_badge", { defaultValue: 'NUEVO' })}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Person */}
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors">
                        <User className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white truncate">
                          {role === "paciente" ? entry.provider?.name : entry.client?.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 truncate mt-1">
                          {role === "paciente" ? entry.provider?.specialty : t("regular_patient", { defaultValue: 'PACIENTE' })}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Service */}
                  <TableCell className="py-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">{entry.type}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center py-5">
                    <div className="flex justify-center">
                      {getStatusConfig(entry.status, t)}
                    </div>
                  </TableCell>

                  {/* Rating / Duration */}
                  <TableCell className="text-center py-5">
                    {role === "paciente" ? (
                      entry.rating ? <div className="flex justify-center">{getRatingStars(entry.rating)}</div>
                        : <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{t("not_rated", { defaultValue: 'SIN DATOS' })}</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                        <Clock className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                        <span>{entry.duration}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-6 py-5">
                    <button 
                      className={cn(
                        "h-10 px-4 border transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center ml-auto gap-2 rounded-none",
                        hoveredRow === entry.id 
                          ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black" 
                          : "border-transparent text-gray-500 hover:border-black/20 dark:hover:border-white/20"
                      )}
                      onClick={(e) => { e.stopPropagation(); onViewDetails(entry); }}
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="hidden sm:inline">{t("view_details", { defaultValue: 'VISUALIZAR' })}</span>
                      <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", hoveredRow === entry.id ? "translate-x-1" : "")} strokeWidth={1.5} />
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
  const t = useTranslations("DashboardHistory");

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t("no_records", { defaultValue: 'NO EXISTEN REGISTROS HISTÓRICOS' })}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-0 border-t border-black/10 dark:border-white/10">
      {entries.map((entry, index) => (
        <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
          onClick={() => onViewDetails(entry)}
          className="bg-white dark:bg-[#0a0a0a] p-5 border-b border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer group flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                {role === "paciente" ? entry.provider?.name : entry.client?.name}
              </span>
              {getStatusConfig(entry.status, t)}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">
              <span className="flex items-center gap-1.5 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5 group-hover:bg-transparent">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                {format(parseISO(entry.date), "d MMM yyyy", { locale: es })}
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-black dark:text-white">{entry.type}</span>
            </div>
          </div>
          <div className="w-10 h-10 border border-transparent group-hover:border-black/20 dark:group-hover:border-white/20 flex items-center justify-center transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};