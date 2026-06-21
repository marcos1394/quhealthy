"use client";

import React, { useState, useEffect } from "react";
import { Timer, Activity, PlayCircle, Video, User, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ProviderAppointment } from "@/types/appointments";
import Link from "next/link";
import { useTranslations } from "next-intl";

// =====================================================================
// ⏱️ 1. COMPONENTE INTERNO: Cronómetro en vivo con Semáforo
// =====================================================================
const LiveTimer = ({ startTime, type }: { startTime: string, type: 'WAITING' | 'CONSULTATION' }) => {
  const [elapsed, setElapsed] = useState("00:00");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
   const calculate = () => {
      try {
        // 🚀 FIX: Limpiamos los microsegundos de Java (.603643) pero CONSERVAMOS la Z (UTC)
        const cleanTime = startTime.replace(/\.\d+/, '');
        
        const start = new Date(cleanTime).getTime();
        const now = new Date().getTime();
        
        // Si por alguna razón la fecha sigue siendo inválida, abortamos
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
    // 🚀 FIX: Actualizamos CADA SEGUNDO para dar la percepción de tiempo real
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass = "text-black bg-white dark:bg-[#0a0a0a] dark:text-white border-black dark:border-white";
  let icon = <Timer className="w-3 h-3" strokeWidth={2} />;

  if (type === 'WAITING') {
    if (elapsedMinutes < 15) {
      colorClass = "text-black bg-white dark:bg-[#0a0a0a] dark:text-white border-black dark:border-white";
    } else if (elapsedMinutes < 30) {
      colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white";
    } else {
      colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white animate-pulse";
      icon = <Activity className="w-3 h-3" strokeWidth={2} />;
    }
  } else if (type === 'CONSULTATION') {
    colorClass = "text-white bg-black dark:bg-white dark:text-black border-black dark:border-white";
    icon = <PlayCircle className="w-3 h-3 animate-spin-slow" strokeWidth={2} />;
  }

  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-none flex items-center gap-1.5 border ${colorClass}`}>
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

  // Función para formatear la hora localmente
  const formatLocalTime = (dateString: string, formatStr: string) => {
    try {
      return format(new Date(dateString), formatStr, { locale: es });
    } catch (e) {
      return "--:--";
    }
  };

  // Función para obtener diferencia en minutos
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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, appt.id)}
      className="bg-white dark:bg-[#0a0a0a] p-3 rounded-none border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-grab active:cursor-grabbing hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all relative overflow-hidden group mb-3"
    >
      {/* Borde izquierdo decorativo para citas Online */}
      {appt.service?.serviceDeliveryType === 'video_call' && (
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black dark:bg-white border-r border-black dark:border-white"></div>
      )}

      <div className={`flex justify-between items-start mb-2 ${appt.service?.serviceDeliveryType === 'video_call' ? 'pl-3' : ''}`}>
        <p className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white truncate pr-2 mt-0.5">
          {appt.consumer?.name || t('card.patient')}
        </p>
        
        {/* 🎥 Indicador de Modalidad */}
        {appt.service?.serviceDeliveryType === 'video_call' ? (
           <div className="flex shrink-0 items-center justify-center border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black w-6 h-6 tooltip" title={t('card.online')}>
             <Video className="w-3.5 h-3.5" strokeWidth={2} />
           </div>
        ) : (
           <div className="flex shrink-0 items-center justify-center border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white w-6 h-6 tooltip" title={t('card.in_person')}>
             <User className="w-3.5 h-3.5" strokeWidth={2} />
           </div>
        )}
      </div>

      <div className={`flex flex-col gap-2 mb-2 ${appt.service?.serviceDeliveryType === 'video_call' ? 'pl-3' : ''}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate max-w-full">
          {appt.service?.name || t('medical_appointment')}
        </p>

        {/* ⏱️ Lógica de tiempos y cronómetros */}
        <div className="flex items-center mt-1">
          {columnId === "WAITING_ROOM" && appt.arrivedAt ? (
            <LiveTimer startTime={appt.arrivedAt} type="WAITING" />
          ) : columnId === "IN_PROGRESS" && appt.startedAt ? (
            <LiveTimer startTime={appt.startedAt} type="CONSULTATION" />
          ) : columnId === "COMPLETED" && (appt.arrivedAt || appt.startedAt) ? (
            <div className="flex gap-2">
              {appt.arrivedAt && appt.startedAt && (
                <span className="text-[10px] font-bold uppercase tracking-widest border border-black dark:border-white px-2 py-1 flex items-center gap-1.5" title="Tiempo de espera">
                  <Timer className="w-3 h-3 text-black dark:text-white" strokeWidth={2} />
                  {getDiffMinutes(appt.arrivedAt, appt.startedAt)}m
                </span>
              )}
              {appt.startedAt && appt.completedAt && (
                <span className="text-[10px] font-bold uppercase tracking-widest border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 flex items-center gap-1.5" title="Tiempo de consulta">
                  <PlayCircle className="w-3 h-3" strokeWidth={2} />
                  {getDiffMinutes(appt.startedAt, appt.completedAt)}m
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest border border-black dark:border-white bg-white dark:bg-[#0a0a0a] px-2 py-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" strokeWidth={2} />
              {formatLocalTime(appt.startTime, "HH:mm")}
            </span>
          )}
        </div>
      </div>
      
      {/* Botón de finalizar consulta */}
     {/* Botón de Iniciar/Abrir Monitor Clínico */}
      {columnId === "IN_PROGRESS" && (
        <div className={`mt-3 ${appt.service?.serviceDeliveryType === 'video_call' ? 'pl-3' : ''}`}>
          <Link href={`/provider/consultation/${appt.id}`} passHref className="w-full block">
            <button 
              className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] flex items-center justify-center gap-2 border border-black dark:border-white transition-colors"
            >
              <PlayCircle className="w-4 h-4" strokeWidth={2} /> {t('actions.open_monitor')}
            </button>
          </Link>
        </div>
      )}
      
    </div>
  );
};