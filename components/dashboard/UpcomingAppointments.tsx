"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Appointment {
  id: string;
  clientName: string;
  clientAvatar?: string;
  service: string;
  time: string;
  duration?: number;
  status?: "confirmed" | "pending" | "in-progress" | "completed";
  type?: "in-person" | "video" | "phone";
  location?: string;
  notes?: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  maxVisible?: number;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  onAppointmentClick,
  maxVisible = 5,
}) => {
  const t = useTranslations("UpcomingAppointments");
  const [copiedLink, setCopiedLink] = useState(false);

  // Configuración de Estados Semánticos
  const getStatusConfig = (status?: string) => {
    const configs = {
      confirmed: {
        color: "text-emerald-700 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        borderColor: "border-emerald-200 dark:border-emerald-900/40",
        dotColor: "bg-emerald-500",
        label: t("confirmed"),
        icon: CheckCircle2,
      },
      pending: {
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-200 dark:border-amber-900/40",
        dotColor: "bg-amber-500",
        label: t("pending"),
        icon: AlertCircle,
      },
      "in-progress": {
        color: "text-cyan-700 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
        borderColor: "border-cyan-200 dark:border-cyan-900/40",
        dotColor: "bg-cyan-500",
        label: t("in_progress"),
        icon: Clock3,
      },
      completed: {
        color: "text-gray-500 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-[#050505]",
        borderColor: "border-gray-200 dark:border-gray-800",
        dotColor: "bg-gray-400",
        label: t("completed"),
        icon: CheckCircle2,
      },
    };
    return configs[status as keyof typeof configs] || configs.confirmed;
  };

  const getTypeIcon = (type?: string) => {
    const icons = {
      "in-person": MapPin,
      video: Video,
      phone: Phone,
    };
    return icons[type as keyof typeof icons] || MapPin;
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/book/profile`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success(t("link_copied"));
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── ESTADO VACÍO (Empty State) ──────────────────────────────────────────
  if (appointments.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 h-full rounded-3xl shadow-2xs font-sans transition-colors">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="flex items-center text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </div>
            <span>{t("title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs relative shrink-0">
            <Calendar className="w-8 h-8" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
              {t("no_appointments")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("no_appointments_desc")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "h-11 px-6 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border-0",
              copiedLink
                ? "bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" strokeWidth={2} />
                <span>{t("copy_link")}</span>
              </>
            )}
          </button>
        </CardContent>
      </Card>
    );
  }

  const visibleAppointments = appointments.slice(0, maxVisible);
  const nextAppointment = visibleAppointments[0];

  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 h-full flex flex-col rounded-3xl shadow-2xs font-sans transition-colors overflow-hidden">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("today_schedule")}
              </CardDescription>
            </div>
          </div>

          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold font-mono px-3 py-1 rounded-full shadow-2xs">
            {appointments.length}{" "}
            {appointments.length === 1 ? t("appointment") : t("appointments")}
          </span>
        </div>
      </CardHeader>

      {/* ── PRÓXIMA CITA DESTACADA ─────────────────────────────────── */}
      {nextAppointment && (
        <div className="p-6 pb-3 shrink-0">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span className="uppercase tracking-wider text-[10px]">
                {t("next_appointment")}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {(nextAppointment.clientName || "P").trim().charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
                  {nextAppointment.clientName}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {nextAppointment.service}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-lg shadow-2xs">
                    <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{nextAppointment.time}</span>
                  </span>

                  {nextAppointment.duration && (
                    <span className="text-[11px] font-mono font-medium text-gray-500 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-lg shadow-2xs">
                      {nextAppointment.duration} min
                    </span>
                  )}

                  {nextAppointment.type && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white dark:bg-[#0a0a0a] text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/40 px-2 py-0.5 rounded-lg shadow-2xs">
                      {React.createElement(getTypeIcon(nextAppointment.type), {
                        className: "w-3 h-3",
                        strokeWidth: 2,
                      })}
                      <span>
                        {nextAppointment.type === "video"
                          ? t("virtual")
                          : nextAppointment.type === "phone"
                          ? t("phone")
                          : t("in_person")}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LISTA DE CITAS ─────────────────────────────────────────── */}
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-2">
        <ul className="space-y-2">
          {visibleAppointments.map((appt, index) => {
            const statusConfig = getStatusConfig(appt.status);
            const TypeIcon = getTypeIcon(appt.type);
            const isNext = index === 0;

            return (
              <motion.li
                key={appt.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onAppointmentClick?.(appt)}
                className={cn(
                  "group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 select-none shadow-2xs",
                  isNext
                    ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-500/30"
                    : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-emerald-500/20 hover:bg-gray-50/50 dark:hover:bg-[#050505]",
                  onAppointmentClick ? "cursor-pointer" : ""
                )}
              >
                {/* Bloque de Hora */}
                <div
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[65px] px-2.5 py-1.5 rounded-xl border font-mono shadow-2xs transition-colors shrink-0",
                    isNext
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Clock className="w-3.5 h-3.5 mb-0.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span className="text-xs font-bold">{appt.time}</span>
                  {appt.duration && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {appt.duration}m
                    </span>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                      {appt.service}
                    </p>
                    {isNext && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono shrink-0">
                        {t("now")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3 h-3 text-gray-400 shrink-0" strokeWidth={2} />
                    <span className="truncate font-medium">{appt.clientName}</span>
                  </div>

                  {appt.type && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 pt-0.5">
                      <TypeIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                      <span className="truncate">
                        {appt.type === "video" && t("virtual")}
                        {appt.type === "phone" && t("phone")}
                        {appt.type === "in-person" && (appt.location || t("in_person"))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Indicador de Estado */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      statusConfig.dotColor
                    )}
                    title={statusConfig.label}
                  />

                  <AnimatePresence>
                    {onAppointmentClick && (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111] transition-all text-gray-500 cursor-pointer shadow-2xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appt);
                        }}
                      >
                        <MoreVertical className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {appointments.length > maxVisible && (
          <p className="text-[11px] font-semibold text-center text-gray-400 pt-3">
            {t("more_appointments", {
              count: appointments.length - maxVisible,
            })}
          </p>
        )}
      </CardContent>

      {/* ── FOOTER DE NAVEGACIÓN ───────────────────────────────────── */}
      <div className="p-4 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 shrink-0">
        <Link href="/dashboard/calendar" className="w-full block">
          <button
            type="button"
            className="w-full h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-between group cursor-pointer"
          >
            <span>{t("view_calendar")}</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </button>
        </Link>
      </div>
    </Card>
  );
};