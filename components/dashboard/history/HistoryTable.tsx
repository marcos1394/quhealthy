"use client";

import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  status: "completed" | "cancelled" | "rescheduled";
  rating?: number;
  notes?: string;
  provider: { name: string; specialty: string; image?: string; location?: string };
  client: { name: string };
  priceAtBooking?: number;
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

const getStatusConfig = (status: HistoryEntry["status"], t: (key: string) => string) => {
  const configs = {
    completed: { icon: <CheckCircle2 className="w-3 h-3" />, text: t("status_completed"), className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    cancelled: { icon: <XCircle className="w-3 h-3" />, text: t("status_cancelled"), className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20" },
    rescheduled: { icon: <RefreshCw className="w-3 h-3" />, text: t("status_rescheduled"), className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  };
  const config = configs[status];
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 font-medium text-xs", config.className)}>
      {config.icon}{config.text}
    </Badge>
  );
};

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("w-3.5 h-3.5", i < rating ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-slate-700")} />
    ))}
    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">({rating}/5)</span>
  </div>
);

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails, isLoading = false, highlightRecent = true }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const t = useTranslations("DashboardHistory");

  if (!isLoading && entries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-4">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t("empty_title")}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
          {role === "paciente" ? t("empty_patient") : t("empty_provider")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 dark:text-slate-400 font-medium pl-5">{t("col_date")}</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 font-medium">{role === "paciente" ? t("col_specialist") : t("col_patient")}</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 font-medium">{t("col_service")}</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-center">{t("col_status")}</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-center">{role === "paciente" ? t("col_rating") : t("col_duration")}</TableHead>
            <TableHead className="text-right pr-5 text-slate-500 dark:text-slate-400 font-medium">{t("col_actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="border-slate-200 dark:border-slate-800">
              {[...Array(6)].map((_, j) => (
                <TableCell key={j} className={j === 0 ? "pl-5" : j === 5 ? "pr-5" : ""}>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const isRecent = (date: string) => {
    if (!highlightRecent) return false;
    const diffDays = Math.floor((new Date().getTime() - parseISO(date).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <Table>
      <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
          <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider pl-5">{t("col_date")}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">{role === "paciente" ? t("col_specialist") : t("col_patient")}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">{t("col_service")}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider text-center">{t("col_status")}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider text-center">{role === "paciente" ? t("col_rating") : t("col_duration")}</TableHead>
          <TableHead className="text-right pr-5 text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">{t("col_actions")}</TableHead>
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
                  "border-slate-100 dark:border-slate-800 transition-all cursor-pointer group",
                  hoveredRow === entry.id ? "bg-slate-50 dark:bg-slate-800/50" : "",
                  recent ? "bg-medical-50/30 dark:bg-medical-500/5" : ""
                )}
                onClick={() => onViewDetails(entry)}>

                {/* Date */}
                <TableCell className="pl-5 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{format(parseISO(entry.date), "d MMM", { locale: es })}</div>
                      <div className="text-[11px] text-slate-400">{format(parseISO(entry.date), "yyyy")}</div>
                    </div>
                    {recent && (
                      <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 text-[10px]">
                        {t("new_badge")}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Person */}
                <TableCell>
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg mt-0.5 border border-slate-200 dark:border-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {role === "paciente" ? entry.provider?.name : entry.client?.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate font-light">
                        {role === "paciente" ? entry.provider?.specialty : t("regular_patient")}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Service */}
                <TableCell>
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{entry.type}</span>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">{getStatusConfig(entry.status, t)}</TableCell>

                {/* Rating / Duration */}
                <TableCell className="text-center">
                  {role === "paciente" ? (
                    entry.rating ? <div className="flex justify-center">{getRatingStars(entry.rating)}</div>
                      : <span className="text-xs text-slate-400 italic font-light">{t("not_rated")}</span>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
                      <span className="font-medium">{entry.duration}</span>
                    </div>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right pr-5">
                  <Button variant="ghost" size="sm"
                    className={cn(
                      "text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 transition-all rounded-lg text-xs",
                      hoveredRow === entry.id ? "text-medical-600 dark:text-medical-400 bg-medical-50 dark:bg-medical-500/10" : ""
                    )}
                    onClick={(e) => { e.stopPropagation(); onViewDetails(entry); }}>
                    <Eye className="w-3.5 h-3.5 mr-1.5" />{t("view_details")}
                    <ChevronRight className={cn("w-3.5 h-3.5 ml-1 transition-transform", hoveredRow === entry.id ? "translate-x-0.5" : "")} />
                  </Button>
                </TableCell>
              </motion.tr>
            );
          })}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
};

export const HistoryTableCompact: React.FC<HistoryTableProps> = ({ entries, role, onViewDetails }) => {
  const t = useTranslations("DashboardHistory");

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("no_records")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
          onClick={() => onViewDetails(entry)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-500/20 hover:shadow-sm transition-all cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {role === "paciente" ? entry.provider?.name : entry.client?.name}
                </span>
                {getStatusConfig(entry.status, t)}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(entry.date), "d MMM", { locale: es })}</span>
                <span>•</span>
                <span>{entry.type}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-medical-600 dark:group-hover:text-medical-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};