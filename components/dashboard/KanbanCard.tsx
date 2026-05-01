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
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
   const calculate = () => {
      try {
        // 🚀 FIX: Limpiamos los microsegundos de Java (.603643) que crashean el Date de JS
        const cleanTime = startTime.includes('.') ? startTime.split('.')[0] : startTime;
        
        const start = new Date(cleanTime).getTime();
        const now = new Date().getTime();
        
        // Si por alguna razón la fecha sigue siendo inválida, abortamos
        if (isNaN(start)) {
          setElapsedMinutes(0);
          return;
        }

        const diff = Math.floor((now - start) / 60000); // Diferencia en minutos
        setElapsedMinutes(diff > 0 ? diff : 0);
      } catch (e) {
        setElapsedMinutes(0);
      }
    };
    
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass = "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300";
  let icon = <Timer className="w-3 h-3" />;

  if (type === 'WAITING') {
    if (elapsedMinutes < 15) {
      colorClass = "text-emerald-700 bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
    } else if (elapsedMinutes < 30) {
      colorClass = "text-amber-700 bg-amber-100 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
    } else {
      colorClass = "text-red-700 bg-red-100 border border-red-200 animate-pulse dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30";
      icon = <Activity className="w-3 h-3" />;
    }
  } else if (type === 'CONSULTATION') {
    colorClass = "text-indigo-700 bg-indigo-100 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30";
    icon = <PlayCircle className="w-3 h-3 animate-spin-slow" />;
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${colorClass}`}>
      {icon}
      {elapsedMinutes} min
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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, appt.id)}
      className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative overflow-hidden group"
    >
      {/* Borde izquierdo decorativo para citas Online */}
      {appt.service?.serviceDeliveryType === 'video_call' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 dark:bg-blue-400"></div>
      )}

      <div className="flex justify-between items-start mb-1.5 pl-1">
        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate pr-2">
          {appt.consumer?.name || t('card.patient')}
        </p>
        
        {/* 🎥 Indicador de Modalidad */}
        {appt.service?.serviceDeliveryType === 'video_call' ? (
           <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 w-6 h-6 rounded-full text-blue-600 dark:text-blue-400 tooltip" title={t('card.online')}>
             <Video className="w-3.5 h-3.5" />
           </div>
        ) : (
           <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 w-6 h-6 rounded-full text-slate-400 dark:text-slate-500 tooltip" title={t('card.in_person')}>
             <User className="w-3.5 h-3.5" />
           </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-3 pl-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
          {appt.service?.name || t('medical_appointment')}
        </p>

        {/* ⏱️ Lógica de tiempos y cronómetros */}
        {columnId === "WAITING_ROOM" && appt.arrivedAt ? (
          <LiveTimer startTime={appt.arrivedAt} type="WAITING" />
        ) : columnId === "IN_PROGRESS" && appt.startedAt ? (
          <LiveTimer startTime={appt.startedAt} type="CONSULTATION" />
        ) : (
          <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3" />
            {formatLocalTime(appt.startTime, "HH:mm")}
          </span>
        )}
      </div>
      
      {/* Botón de finalizar consulta */}
     {/* Botón de Iniciar/Abrir Monitor Clínico */}
      {columnId === "IN_PROGRESS" && (
        <Link href={`/provider/consultation/${appt.id}`} passHref className="w-full mt-2 block">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg shadow-none"
          >
            <PlayCircle className="w-4 h-4 mr-1.5" /> {t('actions.open_monitor')}
          </Button>
        </Link>
      )}
      
    </div>
  );
};