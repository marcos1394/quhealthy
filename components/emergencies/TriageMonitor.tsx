"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, User, ArrowRight, Activity, AlertCircle } from "lucide-react";

import { EmergencyQueueItem, TriageLevel } from "@/services/emergency.service";
import { cn } from "@/lib/utils";

interface TriageMonitorProps {
  queue: EmergencyQueueItem[];
  onPatientSelect: (emergency: EmergencyQueueItem) => void;
}

// Estilos de badges y acentos según el nivel de Triage
const getTriageBadgeStyle = (level?: TriageLevel) => {
  switch (level) {
    case TriageLevel.LEVEL_1_RESUSCITATION:
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40";
    case TriageLevel.LEVEL_2_EMERGENT:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40";
    case TriageLevel.LEVEL_3_URGENT:
      return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/40";
    case TriageLevel.LEVEL_4_LESS_URGENT:
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40";
    case TriageLevel.LEVEL_5_NON_URGENT:
      return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/40";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-[#050505] dark:text-gray-300 dark:border-gray-800";
  }
};

export const TriageMonitor: React.FC<TriageMonitorProps> = ({
  queue,
  onPatientSelect,
}) => {
  const t = useTranslations("Emergency.TriageMonitor");
  const [now, setNow] = useState(new Date());

  // Reloj activo para actualizar tiempos de espera
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTriageLabel = (level?: TriageLevel) => {
    switch (level) {
      case TriageLevel.LEVEL_1_RESUSCITATION:
        return t("level_1");
      case TriageLevel.LEVEL_2_EMERGENT:
        return t("level_2");
      case TriageLevel.LEVEL_3_URGENT:
        return t("level_3");
      case TriageLevel.LEVEL_4_LESS_URGENT:
        return t("level_4");
      case TriageLevel.LEVEL_5_NON_URGENT:
        return t("level_5");
      default:
        return t("level_none");
    }
  };

  const formatTimeElapsed = (startedAt: string | null) => {
    if (!startedAt) return "00:00:00";
    const start = new Date(startedAt).getTime();
    const diff = Math.floor((now.getTime() - start) / 1000);
    if (diff < 0) return "00:00:00";
    const h = Math.floor(diff / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((diff % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(diff % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[380px] text-center p-8 w-full font-sans">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-4 shadow-2xs text-gray-400">
          <Activity className="w-8 h-8" strokeWidth={2} />
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
          {t("empty_title")}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {t("empty_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full font-sans transition-colors">
      {queue.map((item) => {
        const isCritical =
          item.triageLevel === TriageLevel.LEVEL_1_RESUSCITATION ||
          item.triageLevel === TriageLevel.LEVEL_2_EMERGENT;

        return (
          <div
            key={item.appointmentId}
            role="button"
            tabIndex={0}
            onClick={() => onPatientSelect(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onPatientSelect(item);
              }
            }}
            className={cn(
              "group relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 p-5 rounded-3xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none",
              isCritical && "border-l-4 border-l-rose-500 dark:border-l-rose-500"
            )}
          >
            <div className="space-y-3.5">
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-500/30 transition-colors">
                    <User
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate leading-snug">
                      {item.patientName}
                    </h3>
                    <p className="text-[11px] font-semibold text-gray-400">
                      {item.status === "WAITING_ROOM"
                        ? t("status_waiting")
                        : t("status_attending")}
                    </p>
                  </div>
                </div>

                {/* Badge de Triage */}
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full border shadow-2xs shrink-0 font-mono",
                    getTriageBadgeStyle(item.triageLevel)
                  )}
                >
                  {getTriageLabel(item.triageLevel)}
                </span>
              </div>

              {/* Contenedor de Motivo */}
              <div className="bg-gray-50/60 dark:bg-[#050505] p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <AlertCircle
                    className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"
                    strokeWidth={2}
                  />
                  <span>{t("reason_label")}</span>
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {item.reasonForEmergency || t("no_reason")}
                </p>
              </div>
            </div>

            {/* Footer con Tiempo Transcurrido */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                <span className="font-mono font-bold tracking-wider text-gray-900 dark:text-gray-200">
                  {formatTimeElapsed(item.triageStartedAt || item.arrivedAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{t("btn_attend")}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};