"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Timer,
  Activity,
  PlayCircle,
  Video,
  User,
  Clock,
  Check,
} from "lucide-react";

import { ProviderAppointment } from "@/types/appointments";
import { cn } from "@/lib/utils";

// =====================================================================
// ⏱️ 1. COMPONENTE INTERNO: Cronómetro en vivo con Semáforo Visual
// =====================================================================
const LiveTimer = ({
  startTime,
  type,
}: {
  startTime: string;
  type: "WAITING" | "CONSULTATION";
}) => {
  const [elapsed, setElapsed] = useState("00:00");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculate = () => {
      try {
        const cleanTime = startTime.replace(/\.\d+/, "");
        const start = new Date(cleanTime).getTime();
        const now = new Date().getTime();

        if (isNaN(start)) {
          setElapsed("00:00");
          setElapsedMinutes(0);
          return;
        }

        const diffMs = now - start;
        if (diffMs <= 0) {
          setElapsed("00:00");
          setElapsedMinutes(0);
          return;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        setElapsed(
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
        setElapsedMinutes(mins);
      } catch {
        setElapsed("00:00");
        setElapsedMinutes(0);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass =
    "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800";
  let icon = <Timer className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />;

  if (type === "WAITING") {
    if (elapsedMinutes < 15) {
      colorClass =
        "text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40";
    } else if (elapsedMinutes < 30) {
      colorClass =
        "text-orange-700 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40";
    } else {
      colorClass =
        "text-red-700 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 animate-pulse";
      icon = <Activity className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />;
    }
  } else if (type === "CONSULTATION") {
    colorClass =
      "text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40";
    icon = (
      <PlayCircle className="w-3.5 h-3.5 shrink-0 animate-spin-slow" strokeWidth={2} />
    );
  }

  return (
    <span
      className={cn(
        "text-xs font-mono font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border transition-colors shadow-2xs",
        colorClass
      )}
    >
      {icon}
      <span>{elapsed}</span>
    </span>
  );
};

// =====================================================================
// 🃏 2. COMPONENTE PRINCIPAL: Tarjeta del Kanban
// =====================================================================
interface KanbanCardProps {
  appt: ProviderAppointment;
  columnId: string;
  onDragStart: (e: React.DragEvent, id: number | string) => void;
  onOpenCompletionModal?: (appt: ProviderAppointment) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  appt,
  columnId,
  onDragStart,
}) => {
  const t = useTranslations("DashboardAppointments.kanbanCard");

  const formatLocalTime = (dateString: string, formatStr: string) => {
    try {
      return format(new Date(dateString), formatStr, { locale: es });
    } catch {
      return "--:--";
    }
  };

  const getDiffMinutes = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const cleanStart = startStr.replace(/\.\d+/, "");
      const cleanEnd = endStr.replace(/\.\d+/, "");
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return 0;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const isVideoCall = appt.service?.serviceDeliveryType === "video_call";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, appt.id)}
      className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-emerald-500/30 transition-all relative mb-3 overflow-hidden shadow-2xs font-sans select-none"
    >
      {/* ── HEADER DEL TICKET (Modalidad) ─────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between px-3.5 py-2.5 border-b shrink-0",
          isVideoCall
            ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400"
            : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {isVideoCall ? t("online") : t("in_person")}
        </span>
        {isVideoCall ? (
          <Video className="w-3.5 h-3.5" strokeWidth={2} />
        ) : (
          <User className="w-3.5 h-3.5" strokeWidth={2} />
        )}
      </div>

      {/* ── CUERPO DEL TICKET ──────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2.5">
        {/* Paciente y Servicio */}
        <div className="space-y-0.5">
          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate tracking-tight">
            {appt.consumer?.name || t("unknown_patient")}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
            {appt.service?.name || t("default_service")}
          </p>
        </div>

        {/* Tiempos y Cronómetros */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Hora de inicio agendada */}
          {columnId !== "COMPLETED" && (
            <span className="text-xs font-mono font-bold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
              <span>{formatLocalTime(appt.startTime, "HH:mm")}</span>
            </span>
          )}

          {/* Lógica de Estados Dinámicos */}
          {columnId === "WAITING_ROOM" && appt.arrivedAt ? (
            <LiveTimer startTime={appt.arrivedAt} type="WAITING" />
          ) : columnId === "IN_PROGRESS" && appt.startedAt ? (
            <LiveTimer startTime={appt.startedAt} type="CONSULTATION" />
          ) : (
            columnId === "COMPLETED" &&
            (appt.arrivedAt || appt.startedAt) && (
              <div className="flex gap-2 w-full pt-0.5">
                {appt.arrivedAt && appt.startedAt && (
                  <span
                    className="text-xs font-mono font-bold border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 px-2.5 py-1 flex flex-1 justify-center items-center gap-1.5 rounded-xl shadow-2xs"
                    title={t("waiting_time_title")}
                  >
                    <Timer className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{getDiffMinutes(appt.arrivedAt, appt.startedAt)}m</span>
                  </span>
                )}
                {appt.startedAt && appt.completedAt && (
                  <span
                    className="text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 flex flex-1 justify-center items-center gap-1.5 rounded-xl shadow-2xs"
                    title={t("consultation_time_title")}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{getDiffMinutes(appt.startedAt, appt.completedAt)}m</span>
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── BOTÓN DE COMANDOS (Solo visible en Progreso) ───────────── */}
      {columnId === "IN_PROGRESS" && (
        <div className="border-t border-gray-100 dark:border-gray-800 shrink-0 p-3 bg-gray-50/60 dark:bg-[#050505]">
          <Link
            href={`/provider/consultation/${appt.id}`}
            passHref
            className="w-full block"
          >
            <button
              type="button"
              className="w-full h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-xs border-0 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" strokeWidth={2} />
              <span>{t("open_console")}</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};