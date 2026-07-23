"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { EmergencyQueueItem, TriageLevel } from "@/services/emergency.service";
import { Clock, User, ArrowRight, Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageMonitorProps {
  queue: EmergencyQueueItem[];
  onPatientSelect: (emergency: EmergencyQueueItem) => void;
}

// Estilos de badges y acentos según el nivel de Triage
const getTriageBadgeStyle = (level?: TriageLevel) => {
  switch (level) {
    case TriageLevel.LEVEL_1_RESUSCITATION:
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40";
    case TriageLevel.LEVEL_2_EMERGENT:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40";
    case TriageLevel.LEVEL_3_URGENT:
      return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/40";
    case TriageLevel.LEVEL_4_LESS_URGENT:
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40";
    case TriageLevel.LEVEL_5_NON_URGENT:
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

const getTriageLabel = (level?: TriageLevel) => {
  switch (level) {
    case TriageLevel.LEVEL_1_RESUSCITATION:
      return "Nivel 1 • Inmediato";
    case TriageLevel.LEVEL_2_EMERGENT:
      return "Nivel 2 • Emergencia";
    case TriageLevel.LEVEL_3_URGENT:
      return "Nivel 3 • Urgencia";
    case TriageLevel.LEVEL_4_LESS_URGENT:
      return "Nivel 4 • Menos Urgente";
    case TriageLevel.LEVEL_5_NON_URGENT:
      return "Nivel 5 • No Urgente";
    default:
      return "Sin Triage";
  }
};

export const TriageMonitor: React.FC<TriageMonitorProps> = ({
  queue,
  onPatientSelect,
}) => {
  const [now, setNow] = useState(new Date());

  // Reloj activo para actualizar tiempos de espera
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="flex flex-col items-center justify-center h-full min-h-[380px] text-center p-8 w-full">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
          <Activity className="w-6 h-6 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
          Sala de Espera Vacía
        </p>
        <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
          No hay pacientes registrados en el monitor de urgencias en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {queue.map((item) => {
        const isCritical = item.triageLevel === TriageLevel.LEVEL_1_RESUSCITATION || item.triageLevel === TriageLevel.LEVEL_2_EMERGENT;

        return (
          <div
            key={item.appointmentId}
            onClick={() => onPatientSelect(item)}
            className={cn(
              "group relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden",
              isCritical && "border-l-4 border-l-red-500 dark:border-l-red-500"
            )}
          >
            <div>
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm group-hover:border-emerald-500/30 transition-colors">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate leading-snug">
                      {item.patientName}
                    </h3>
                    <p className="text-[11px] font-semibold text-gray-500">
                      {item.status === "WAITING_ROOM" ? "En Espera" : "En Atención"}
                    </p>
                  </div>
                </div>

                {/* Badge de Triage */}
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-sm shrink-0",
                  getTriageBadgeStyle(item.triageLevel)
                )}>
                  {getTriageLabel(item.triageLevel)}
                </span>
              </div>

              {/* Contenedor de Motivo */}
              <div className="bg-gray-50/80 dark:bg-[#050505] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/60 mb-4">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>MOTIVO DE URGENCIA</span>
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {item.reasonForEmergency || "Sin evaluación previa registrada."}
                </p>
              </div>
            </div>

            {/* Footer con Tiempo Transcurrido */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
                <span className="font-mono font-bold tracking-wider text-gray-900 dark:text-gray-200">
                  {formatTimeElapsed(item.triageStartedAt || item.arrivedAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Atender</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};