"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { format } from 'date-fns'; 
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
 Clock, Video, CalendarPlus, MapPin, Download, CheckCircle2,
 XCircle, AlertCircle, Eye, RefreshCw, Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types/appointments'; 

interface AppointmentCardProps {
 appt: Appointment;
 index: number;
 onRequestCancel: (appt: Appointment) => void;
}

export function AppointmentCard({ appt, index, onRequestCancel }: AppointmentCardProps) {
 const router = useRouter();
 const t = useTranslations('PatientAppointments');

 const isPast = new Date(appt.endTime) < new Date();
 const isVideo = appt.type === 'ONLINE';
 const canJoinVideo = isVideo && (appt.status === 'SCHEDULED' || appt.status === 'IN_PROGRESS');
 
 // Tolerancia tardía: si la hora actual superó la hora de inicio + 15 minutos
 const isLateTolerance = new Date() > new Date(new Date(appt.startTime).getTime() + 15 * 60 * 1000);

 const getStatusConfig = (status: AppointmentStatus) => {
  switch (status) {
  case 'COMPLETED':
    return { 
      label: t('status_completed', { defaultValue: 'Completada' }), 
      icon: CheckCircle2, 
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
    };
  case 'SCHEDULED':
    return { 
      label: t('status_confirmed', { defaultValue: 'Confirmada' }), 
      icon: CheckCircle2, 
      className: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' 
    };
  case 'PENDING_PAYMENT':
    return { 
      label: t('status_pending', { defaultValue: 'Pago Pendiente' }), 
      icon: AlertCircle, 
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' 
    };
  case 'IN_PROGRESS':
    return { 
      label: "En Progreso", 
      icon: Clock, 
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 animate-pulse' 
    };
  case 'CANCELED_BY_CONSUMER':
  case 'CANCELED_BY_PROVIDER':
  case 'NO_SHOW':
    return { 
      label: t('status_canceled', { defaultValue: 'Cancelada' }), 
      icon: XCircle, 
      className: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' 
    };
  default:
    return { 
      label: "Desconocido", 
      icon: AlertCircle, 
      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' 
    };
  }
 };

 const statusConfig = getStatusConfig(appt.status);
 const StatusIcon = statusConfig.icon;

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ delay: index * 0.05 }}
 layout
    >
      <div className="group bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col lg:flex-row">

        {/* --- COLUMNA 1: FECHA Y ESTADO --- */}
        <div className="bg-gray-50/50 dark:bg-[#111]/30 p-6 lg:w-48 flex flex-col justify-center items-start border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 gap-4 shrink-0">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1 capitalize">
              {format(new Date(appt.startTime), "MMM", { locale: es })}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
              {format(new Date(appt.startTime), "dd", { locale: es })}
            </p>
            <p className="text-sm font-medium text-gray-500">
              {format(new Date(appt.startTime), "yyyy", { locale: es })}
            </p>
          </div>
          
          <div className="space-y-2 w-full mt-2">
            <span className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit", 
              statusConfig.className
            )}>
              <StatusIcon className="w-4 h-4" strokeWidth={2} />
              {statusConfig.label}
            </span>
 
            {isVideo && (
              <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 w-fit">
                <Video className="w-4 h-4" strokeWidth={2} />
                {t('badge_video', { defaultValue: 'Telemedicina' })}
              </span>
            )}
          </div>
        </div>

        {/* --- COLUMNA 2: DETALLES DEL DOCTOR Y SERVICIO --- */}
        <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              {appt.serviceName}
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Clock className="w-4 h-4 text-teal-500" strokeWidth={2} />
              <span>
                {format(new Date(appt.startTime), "HH:mm", { locale: es })}
                {' — '}
                {format(new Date(appt.endTime), "HH:mm", { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {appt.providerImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={appt.providerImageUrl} alt="Provider" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  {appt.providerNameSnapshot?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {appt.providerNameSnapshot}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs font-medium text-gray-500">
                  {appt.providerSpecialty || t('specialist_fallback', { defaultValue: 'Especialista Médico' })}
                </p>
                {appt.providerRating && (
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{appt.providerRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {appt.locationAddress && !isVideo && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <MapPin className="w-4 h-4 text-teal-500" strokeWidth={2} />
                <span>{appt.locationAddress}</span>
              </div>
            )}
            
            {appt.price != null && (
              <div className="flex flex-col sm:items-end w-full sm:w-auto">
                <span className="text-xs font-medium text-gray-400 mb-0.5">
                  {t('label_total', { defaultValue: 'Importe' })}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  ${appt.price} {appt.currency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- COLUMNA 3: ACCIONES --- */}
        <div className="p-6 lg:w-56 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 shrink-0">
          
          {canJoinVideo && (
            <Button
              onClick={() => appt.meetLink ? window.open(appt.meetLink, '_blank') : router.push(`/patient/video-call/${appt.id}`)}
              className={cn(
                "w-full rounded-xl border-0 h-11 text-xs font-semibold flex justify-start pl-4 transition-all shadow-sm hover:shadow",
                isLateTolerance 
                ? "bg-amber-500 text-white hover:bg-amber-600" 
                : "bg-teal-600 text-white hover:bg-teal-700"
              )}
              title={isLateTolerance ? "Estás ingresando fuera del tiempo de tolerancia gratuita." : ""}
            >
              <Video className="w-4 h-4 mr-3 shrink-0" strokeWidth={2} />
              <span className="truncate">
                {isLateTolerance ? t('btn_join_late', { defaultValue: 'Conectar (Tarde)' }) : t('btn_join_video', { defaultValue: 'Conectar Video' })}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push(`/patient/appointments/${appt.id}`)}
            className="w-full rounded-xl h-11 text-xs font-semibold flex justify-start pl-4 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222] shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 mr-3 text-gray-500" strokeWidth={2} />
            {t('btn_view_details', { defaultValue: 'Auditar Ficha' })}
          </Button>

          {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
            <Button
              variant="outline"
              onClick={() => toast.success(t('toast_calendar_added') || "Registro sincronizado al calendario local")}
              className="w-full rounded-xl h-11 text-xs font-semibold flex justify-start pl-4 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222] shadow-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4 mr-3 text-gray-500" strokeWidth={2} />
              {t('btn_add_calendar', { defaultValue: 'Sincronizar Cal' })}
            </Button>
          )}

          {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
            <Button
              variant="outline"
              onClick={() => onRequestCancel(appt)}
              className="w-full rounded-xl h-11 text-xs font-semibold flex justify-start pl-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/20 hover:text-rose-700 transition-all shadow-sm"
            >
              <XCircle className="w-4 h-4 mr-3" strokeWidth={2} />
              {t('btn_cancel', { defaultValue: 'Anular Registro' })}
            </Button>
          )}

          {isPast && (
            <Button
              variant="outline"
              onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.providerNameSnapshot)}`)}
              className="w-full rounded-xl h-11 text-xs font-semibold flex justify-start pl-4 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222] shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-3 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              {t('btn_rebook', { defaultValue: 'Re-agendar' })}
            </Button>
          )}

          {appt.status === 'COMPLETED' && (
            <Button
              variant="ghost"
              onClick={() => toast.info(t('toast_receipt', { defaultValue: 'Generando comprobante fiscal...' }))}
              className="w-full rounded-xl h-11 text-xs font-semibold flex justify-start pl-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222] transition-all"
            >
              <Download className="w-4 h-4 mr-3" strokeWidth={2} />
              {t('btn_receipt', { defaultValue: 'Extraer Recibo' })}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
 );
}