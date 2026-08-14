"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import {
  Clock,
  Video,
  CalendarPlus,
  MapPin,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Appointment, AppointmentStatus } from "@/types/appointments";

interface AppointmentCardProps {
  appt: Appointment;
  index: number;
  onRequestCancel: (appt: Appointment) => void;
}

export function AppointmentCard({
  appt,
  index,
  onRequestCancel,
}: AppointmentCardProps) {
  const router = useRouter();
  const t = useTranslations("PatientAppointments");

  const isPast = new Date(appt.endTime) < new Date();
  const isVideo = appt.type === "ONLINE";
  const canJoinVideo =
    isVideo && (appt.status === "SCHEDULED" || appt.status === "IN_PROGRESS");

  // Tolerancia tardía: si la hora actual superó la hora de inicio + 15 minutos
  const isLateTolerance =
    new Date() > new Date(new Date(appt.startTime).getTime() + 15 * 60 * 1000);

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: t("status_completed"),
          icon: CheckCircle2,
          className:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
        };
      case "SCHEDULED":
        return {
          label: t("status_confirmed"),
          icon: CheckCircle2,
          className:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
        };
      case "PENDING_PAYMENT":
        return {
          label: t("status_pending"),
          icon: AlertCircle,
          className:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40",
        };
      case "IN_PROGRESS":
        return {
          label: t("status_in_progress"),
          icon: Clock,
          className:
            "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 animate-pulse",
        };
      case "CANCELED_BY_CONSUMER":
      case "CANCELED_BY_PROVIDER":
      case "NO_SHOW":
        return {
          label: t("status_canceled"),
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40",
        };
      default:
        return {
          label: t("status_unknown"),
          icon: AlertCircle,
          className:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(appt.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div className="group bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-500/30 flex flex-col lg:flex-row font-sans">
        {/* ── COLUMNA 1: FECHA Y ESTADO ────────────────────────────────── */}
        <div className="p-6 lg:w-48 flex flex-col justify-center items-start border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 gap-3 shrink-0">
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {format(new Date(appt.startTime), "MMM", { locale: es })}
            </p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none my-0.5">
              {format(new Date(appt.startTime), "dd", { locale: es })}
            </p>
            <p className="text-xs font-semibold text-gray-400">
              {format(new Date(appt.startTime), "yyyy", { locale: es })}
            </p>
          </div>

          <div className="space-y-1.5 w-full pt-1">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit shadow-xs",
                statusConfig.className
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{statusConfig.label}</span>
            </span>

            {isVideo && (
              <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 w-fit">
                <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("badge_video")}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── COLUMNA 2: DETALLES DEL ESPECIALISTA Y SERVICIO ────────────── */}
        <div className="p-6 flex-1 min-w-0 flex flex-col justify-center space-y-5">
          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight break-words line-clamp-2">
              {appt.serviceName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span>
                {format(new Date(appt.startTime), "HH:mm", { locale: es })}
                {" — "}
                {format(new Date(appt.endTime), "HH:mm", { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl border border-gray-200 dark:border-gray-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 overflow-hidden shadow-sm font-bold">
              {appt.providerImageUrl ? (
                <img
                  src={appt.providerImageUrl}
                  alt="Provider"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {appt.providerNameSnapshot?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {appt.providerNameSnapshot}
              </p>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <p className="text-xs font-semibold text-gray-400 truncate">
                  {appt.providerSpecialty || t("specialist_fallback")}
                </p>
                {appt.providerRating && (
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 shrink-0">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold font-mono">
                      {appt.providerRating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 min-w-0">
            {appt.locationAddress && !isVideo && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 min-w-0 flex-1" title={appt.locationAddress}>
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="truncate">{appt.locationAddress}</span>
              </div>
            )}

            {appt.price != null && (
              <div className="flex flex-col sm:items-end w-full sm:w-auto shrink-0 sm:ml-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("label_total")}
                </span>
                <span className="text-base font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                  ${appt.price} {appt.currency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMNA 3: ACCIONES ───────────────────────────────────────── */}
        <div className="p-6 lg:w-64 xl:w-72 shrink-0 flex flex-col justify-center gap-2.5 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
          {canJoinVideo && (
            <Button
              onClick={() =>
                appt.meetLink
                  ? window.open(appt.meetLink, "_blank")
                  : router.push(`/patient/video-call/${appt.id}`)
              }
              className={cn(
                "w-full min-h-11 h-auto py-2 rounded-xl border-0 text-xs font-bold flex items-center justify-start pl-3.5 transition-all shadow-sm",
                isLateTolerance
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
              title={isLateTolerance ? t("late_tooltip") : ""}
            >
              <Video className="w-4 h-4 mr-2 shrink-0" strokeWidth={2} />
              <span className="text-left break-words whitespace-normal leading-tight flex-1">
                {isLateTolerance ? t("btn_join_late") : t("btn_join_video")}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push(`/patient/appointments/${appt.id}`)}
            className="w-full min-h-11 h-auto py-2 rounded-xl text-xs font-bold flex items-center justify-start pl-3.5 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <span className="text-left break-words whitespace-normal leading-tight flex-1">{t("btn_view_details")}</span>
          </Button>

          {(appt.status === "SCHEDULED" || appt.status === "PENDING_PAYMENT") &&
            !isPast && (
              <Button
                variant="outline"
                onClick={() =>
                  toast.success(t("toast_calendar_added"))
                }
                className="w-full min-h-11 h-auto py-2 rounded-xl text-xs font-bold flex items-center justify-start pl-3.5 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm transition-all"
              >
                <CalendarPlus className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="text-left break-words whitespace-normal leading-tight flex-1">{t("btn_add_calendar")}</span>
              </Button>
            )}

          {(appt.status === "SCHEDULED" || appt.status === "PENDING_PAYMENT") &&
            !isPast && (
              <Button
                variant="outline"
                onClick={() => onRequestCancel(appt)}
                className="w-full min-h-11 h-auto py-2 rounded-xl text-xs font-bold flex items-center justify-start pl-3.5 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all shadow-sm"
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" strokeWidth={2} />
                <span className="text-left break-words whitespace-normal leading-tight flex-1">{t("btn_cancel")}</span>
              </Button>
            )}

          {isPast && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/discover?provider=${encodeURIComponent(
                    appt.providerNameSnapshot
                  )}`
                )
              }
              className="w-full min-h-11 h-auto py-2 rounded-xl text-xs font-bold flex items-center justify-start pl-3.5 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="text-left break-words whitespace-normal leading-tight flex-1">{t("btn_rebook")}</span>
            </Button>
          )}

          {appt.status === "COMPLETED" && (
            <Button
              variant="ghost"
              onClick={() => toast.info(t("toast_receipt"))}
              className="w-full min-h-11 h-auto py-2 rounded-xl text-xs font-bold flex items-center justify-start pl-3.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Download className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="text-left break-words whitespace-normal leading-tight flex-1">{t("btn_receipt")}</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}