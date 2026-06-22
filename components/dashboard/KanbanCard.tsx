"use client";

import React, { useState, useEffect } from "react";
import { Timer, Activity, PlayCircle, Video, User, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProviderAppointment } from "@/types/appointments";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// =====================================================================
// ⏱️ 1. COMPONENTE INTERNO: Cronómetro en vivo con Semáforo
// =====================================================================
const LiveTimer = ({ startTime, type }: { startTime: string, type: 'WAITING' | 'CONSULTATION' }) => {
  const [elapsed, setElapsed] = useState("00:00");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
   const calculate = () => {
      try {
        const cleanTime = startTime.replace(/\.\d+/, '');
        
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

        setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
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

  let colorClass = "text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors border-black/10 dark:border-white/10";
  let icon = <Timer className="w-3 h-3" strokeWidth={1.5} />;

  if (type === 'WAITING') {
    if (elapsedMinutes < 15) {
      colorClass = "text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors border-black/20 dark:border-white/20";
    } else if (elapsedMinutes < 30) {
      colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white";
    } else {
      colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white animate-pulse";
      icon = <Activity className="w-3 h-3" strokeWidth={1.5} />;
    }
  } else if (type === 'CONSULTATION') {
    colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white";
    icon = <PlayCircle className="w-3 h-3 animate-spin-slow" strokeWidth={1.5} />;
  }

  return (
    <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-none flex items-center gap-1.5 border transition-colors", colorClass)}>
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
  onOpenCompletionModal
}) => {
  const t = useTranslations('DashboardAppointments');

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
      const cleanStart = startStr.replace(/\.\d+/, '');
      const cleanEnd = endStr.replace(/\.\d+/, '');
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return 0;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const isVideoCall = appt.service?.serviceDeliveryType === 'video_call';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, appt.id)}
      className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-none border border-black/20 dark:border-white/20 cursor-grab active:cursor-grabbing group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 mb-3"
    >
      
      {/* Header del Ticket (Modalidad) */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b border-black/10 dark:border-white/10 shrink-0",
        isVideoCall ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors"
      )}>
        <span className="text-[9px] font-bold uppercase tracking-widest">
          {isVideoCall ? t('card.online', { defaultValue: 'CONSULTA REMOTA (VÍDEO)' }) : t('card.in_person', { defaultValue: 'ATENCIÓN PRESENCIAL' })}
        </span>
        {isVideoCall ? <Video className="w-3.5 h-3.5" strokeWidth={1.5} /> : <User className="w-3.5 h-3.5" strokeWidth={1.5} />}
      </div>

      {/* Cuerpo del Ticket */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* Paciente y Servicio */}
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-xs uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors truncate">
            {appt.consumer?.name || t('card.patient', { defaultValue: 'PACIENTE DESCONOCIDO' })}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors truncate">
            {appt.service?.name || t('medical_appointment', { defaultValue: 'CONSULTA MÉDICA' })}
          </p>
        </div>

        {/* Tiempos y Cronómetros */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          
          {/* Hora de inicio original (siempre visible como referencia, a menos que esté completada) */}
          {columnId !== "COMPLETED" && (
            <span className="text-[9px] font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors px-2 py-1 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {formatLocalTime(appt.startTime, "HH:mm")}
            </span>
          )}

          {/* Lógica de Estados Dinámicos */}
          {columnId === "WAITING_ROOM" && appt.arrivedAt ? (
            <LiveTimer startTime={appt.arrivedAt} type="WAITING" />
          ) : columnId === "IN_PROGRESS" && appt.startedAt ? (
            <LiveTimer startTime={appt.startedAt} type="CONSULTATION" />
          ) : columnId === "COMPLETED" && (appt.arrivedAt || appt.startedAt) && (
            <div className="flex gap-2">
              {appt.arrivedAt && appt.startedAt && (
                <span className="text-[9px] font-bold uppercase tracking-widest border border-black/20 dark:border-white/20 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors px-2 py-1 flex items-center gap-1.5 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors" title="TIEMPO DE ESPERA AUDITADO">
                  <Timer className="w-3 h-3" strokeWidth={1.5} />
                  {getDiffMinutes(appt.arrivedAt, appt.startedAt)}M
                </span>
              )}
              {appt.startedAt && appt.completedAt && (
                <span className="text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 flex items-center gap-1.5" title="TIEMPO DE ATENCIÓN EFECTIVO">
                  <Check className="w-3 h-3" strokeWidth={1.5} />
                  {getDiffMinutes(appt.startedAt, appt.completedAt)}M
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Botón de Comandos (Solo visible en Progreso) */}
      {columnId === "IN_PROGRESS" && (
        <div className="border-t border-black/10 dark:border-white/10 shrink-0">
          <Link href={`/provider/consultation/${appt.id}`} passHref className="w-full block">
            <button 
              className="w-full h-10 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none"
            >
              <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> 
              {t('actions.open_monitor', { defaultValue: 'APERTURAR CONSOLA CLÍNICA' })}
            </button>
          </Link>
        </div>
      )}
      
    </div>
  );
};