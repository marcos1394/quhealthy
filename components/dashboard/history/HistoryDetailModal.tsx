"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
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
  Phone,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { HistoryEntry } from "./HistoryTable";
import { cn } from "@/lib/utils";

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
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating
            ? "text-amber-400 fill-amber-400"
            : "text-gray-200 dark:text-gray-800"
        )}
        strokeWidth={2}
      />
    ))}
  </div>
);

const getServiceIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("video") || normalized.includes("teleconsulta")) {
    return <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  if (normalized.includes("presencial") || normalized.includes("consulta")) {
    return <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  if (normalized.includes("llamada") || normalized.includes("telefónica")) {
    return <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  return <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
};

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  entry,
  role,
  onOpenChange,
  onDownloadReceipt,
  onShare,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const t = useTranslations("DashboardHistoryDetail");

  if (!entry) return null;

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const configs: Record<
      string,
      { text: string; className: string; icon: React.ReactNode }
    > = {
      completed: {
        text: t("status_completed"),
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
        icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />,
      },
      cancelled: {
        text: t("status_cancelled"),
        className:
          "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40",
        icon: <X className="w-3.5 h-3.5" strokeWidth={2} />,
      },
      pending: {
        text: t("status_pending"),
        className:
          "border-gray-200 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} />,
      },
      rescheduled: {
        text: t("status_rescheduled"),
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
        icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} />,
      },
    };
    const config = configs[status] || configs.completed;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border shadow-2xs shrink-0",
          config.className
        )}
      >
        {config.icon}
        <span>{config.text}</span>
      </span>
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadReceipt?.(entry);
      toast.success(t("download_success"));
    } catch {
      return;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    onShare?.(entry);
    toast.success(t("share_success"));
  };

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] font-sans transition-colors">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-xs">
              {getServiceIcon(entry.type)}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500 font-mono">
                  ID #{entry.id}
                </span>
                {getStatusBadge(entry.status)}
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span>
                  {format(parseISO(entry.date), "EEEE d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 shadow-2xs text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
          {/* Fila 1: Paciente / Especialista y Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Persona */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1.5">
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>
                  {role === "paciente"
                    ? t("specialist_label")
                    : t("patient_label")}
                </span>
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {role === "paciente"
                  ? entry.provider?.name
                  : entry.client?.name}
              </p>
              {role === "paciente" && entry.provider?.specialty && (
                <p className="text-xs font-semibold text-gray-500">
                  {entry.provider.specialty}
                </p>
              )}
              {entry.provider?.location && (
                <p className="text-xs font-semibold text-gray-400 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{entry.provider.location}</span>
                </p>
              )}
            </div>

            {/* Servicio */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-2">
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("service_type")}</span>
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {entry.type}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {entry.duration && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-600 dark:text-gray-300 shadow-2xs font-mono">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{entry.duration}</span>
                  </span>
                )}
                {entry.cost && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold shadow-2xs font-mono">
                    <DollarSign className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{entry.cost}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fila 2: Timeline de Servicio */}
          {(entry.arrivedAt || entry.startedAt || entry.completedAt) && (
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-100/50 dark:bg-[#0a0a0a] flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("service_timeline")}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {entry.arrivedAt && (
                  <div className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span>{t("timeline_arrival")}</span>
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {format(parseISO(entry.arrivedAt), "HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}

                {entry.arrivedAt && entry.startedAt && (
                  <div className="flex justify-end p-2.5 bg-gray-50 dark:bg-[#080808] text-[11px] font-medium text-gray-500">
                    <span>
                      {t("timeline_wait")}{" "}
                      <strong className="text-gray-900 dark:text-white font-mono ml-1">
                        {Math.floor(
                          (new Date(entry.startedAt).getTime() -
                            new Date(entry.arrivedAt).getTime()) /
                            60000
                        )}{" "}
                        min
                      </strong>
                    </span>
                  </div>
                )}

                {entry.startedAt && (
                  <div className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span>{t("timeline_start")}</span>
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {format(parseISO(entry.startedAt), "HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}

                {entry.startedAt && entry.completedAt && (
                  <div className="flex justify-end p-2.5 bg-gray-50 dark:bg-[#080808] text-[11px] font-medium text-gray-500">
                    <span>
                      {t("timeline_consultation")}{" "}
                      <strong className="text-gray-900 dark:text-white font-mono ml-1">
                        {Math.floor(
                          (new Date(entry.completedAt).getTime() -
                            new Date(entry.startedAt).getTime()) /
                            60000
                        )}{" "}
                        min
                      </strong>
                    </span>
                  </div>
                )}

                {entry.completedAt && (
                  <div className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>{t("timeline_completed")}</span>
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {format(parseISO(entry.completedAt), "HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {entry.rating && (
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" strokeWidth={2} />
                  <span>
                    {role === "paciente"
                      ? t("your_rating")
                      : t("received_rating")}
                  </span>
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {entry.rating >= 4.5
                    ? t("excellent")
                    : entry.rating >= 3.5
                    ? t("good")
                    : t("can_improve")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getRatingStars(entry.rating)}
                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 px-2.5 py-1 rounded-xl bg-white dark:bg-[#0a0a0a] shadow-2xs">
                  {entry.rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Observaciones / Notas */}
          {entry.notes && (
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1.5">
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("service_notes")}</span>
              </p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {entry.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── FOOTER CON ACCIONES ────────────────────────────────────────── */}
        <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onDownloadReceipt && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t("extracting")}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("download_receipt")}</span>
                  </>
                )}
              </button>
            )}

            {onShare && (
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("share")}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
            >
              {t("close")}
            </button>

            {role === "paciente" && !entry.rating && (
              <button
                type="button"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shadow-sm flex items-center justify-center gap-2 border-0 cursor-pointer"
              >
                <Star className="w-4 h-4" strokeWidth={2} />
                <span>{t("rate_service")}</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};