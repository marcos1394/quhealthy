"use client";

import React, { useState, useEffect } from "react";
import {
  Timer,
  Activity,
  PlayCircle,
  Video,
  User,
  Clock,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProviderAppointment } from "@/types/appointments";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// =====================================================================
// ⏱️ 1. COMPONENTE INTERNO: Cronómetro en vivo con Semáforo
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
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
        );
        setElapsedMinutes(mins);
      } catch (e) {
        setElapsed("00:00");
        setElapsedMinutes(0);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass =
    "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  let icon = <Timer className="w-3.5 h-3.5" strokeWidth={2} />;

  if (type === "WAITING") {
    if (elapsedMinutes < 15) {
      colorClass =
        "text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
    } else if (elapsedMinutes < 30) {
      colorClass =
        "text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
    } else {
      colorClass =
        "text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50 animate-pulse";
      icon = <Activity className="w-3.5 h-3.5" strokeWidth={2} />;
    }
  } else if (type === "CONSULTATION") {
    colorClass =
      "text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
    icon = (
      <PlayCircle className="w-3.5 h-3.5 animate-spin-slow" strokeWidth={2} />
    );
  }

  return (
    <span
      className={cn(
        "text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5 border transition-colors shadow-sm",
        colorClass,
      )}
    >
      {icon}
      {elapsed}
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
  onOpenCompletionModal: (appt: ProviderAppointment) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  appt,
  columnId,
  onDragStart,
  onOpenCompletionModal,
}) => {
  const t = useTranslations("DashboardAppointments");

  const formatLocalTime = (dateString: string, formatStr: string) => {
    try {
      return format(new Date(dateString), formatStr, { locale: es });
    } catch (e) {
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
      className="flex flex-col bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative mb-3 overflow-hidden shadow-sm"
    >
      {/* Header del Ticket (Modalidad) */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 shrink-0",
          isVideoCall
            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
        )}
      >
        <span className="text-xs font-bold uppercase tracking-wide">
          {isVideoCall
            ? t("card.online", { defaultValue: "Remoto (Vídeo)" })
            : t("card.in_person", { defaultValue: "Presencial" })}
        </span>
        {isVideoCall ? (
          <Video className="w-4 h-4" strokeWidth={2} />
        ) : (
          <User className="w-4 h-4" strokeWidth={2} />
        )}
      </div>

      {/* Cuerpo del Ticket */}
      <div className="p-4 flex flex-col gap-3">
        {/* Paciente y Servicio */}
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
            {appt.consumer?.name ||
              t("card.patient", { defaultValue: "Paciente Desconocido" })}
          </p>
          <p className="text-xs font-medium text-gray-500 truncate">
            {appt.service?.name ||
              t("medical_appointment", { defaultValue: "Consulta Médica" })}
          </p>
        </div>

        {/* Tiempos y Cronómetros */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Hora de inicio original (siempre visible como referencia, a menos que esté completada) */}
          {columnId !== "COMPLETED" && (
            <span className="text-xs font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
              {formatLocalTime(appt.startTime, "HH:mm")}
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
              <div className="flex gap-2 w-full">
                {appt.arrivedAt && appt.startedAt && (
                  <span
                    className="text-xs font-bold border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 flex flex-1 justify-center items-center gap-1.5 rounded-md shadow-sm"
                    title="Tiempo de espera auditado"
                  >
                    <Timer className="w-3.5 h-3.5" strokeWidth={2} />
                    {getDiffMinutes(appt.arrivedAt, appt.startedAt)}m
                  </span>
                )}
                {appt.startedAt && appt.completedAt && (
                  <span
                    className="text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 flex flex-1 justify-center items-center gap-1.5 rounded-md shadow-sm"
                    title="Tiempo de atención efectivo"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                    {getDiffMinutes(appt.startedAt, appt.completedAt)}m
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Botón de Comandos (Solo visible en Progreso) */}
      {columnId === "IN_PROGRESS" && (
        <div className="border-t border-gray-100 dark:border-gray-800 shrink-0 p-3 bg-gray-50 dark:bg-gray-900/20">
          <Link
            href={`/provider/consultation/${appt.id}`}
            passHref
            className="w-full block"
          >
            <button className="w-full h-10 px-4 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 rounded-lg shadow-sm border-0">
              <PlayCircle className="w-4 h-4" strokeWidth={2} />
              {t("actions.open_monitor", {
                defaultValue: "Abrir Consola Clínica",
              })}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};
