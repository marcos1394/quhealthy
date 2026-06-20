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
  const canJoinVideo = isVideo && !isPast && (appt.status === 'SCHEDULED' || appt.status === 'IN_PROGRESS');

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { label: t('status_completed', { defaultValue: 'Completada' }), icon: CheckCircle2, className: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' };
      case 'SCHEDULED':
        return { label: t('status_confirmed', { defaultValue: 'Confirmada' }), icon: CheckCircle2, className: 'border-gray-800 text-gray-800 dark:border-gray-300 dark:text-gray-300' };
      case 'PENDING_PAYMENT':
        return { label: t('status_pending', { defaultValue: 'Pago Pendiente' }), icon: AlertCircle, className: 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400' };
      case 'IN_PROGRESS':
        return { label: "En Progreso", icon: Clock, className: 'border-black text-black dark:border-white dark:text-white animate-pulse' };
      case 'CANCELED_BY_CONSUMER':
      case 'CANCELED_BY_PROVIDER':
      case 'NO_SHOW':
        return { label: t('status_canceled', { defaultValue: 'Cancelada' }), icon: XCircle, className: 'border-red-500 text-red-600 dark:border-red-400 dark:text-red-400' };
      default:
        return { label: "Desconocido", icon: AlertCircle, className: 'border-gray-300 text-gray-500 dark:border-gray-700' };
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
      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors group flex flex-col lg:flex-row">

        {/* --- COLUMNA 1: FECHA Y ESTADO --- */}
        <div className="bg-gray-50 dark:bg-[#050505] p-6 lg:w-48 flex flex-col justify-center items-start border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 gap-4 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              {format(new Date(appt.startTime), "MMM", { locale: es })}
            </p>
            <p className="text-4xl font-semibold text-black dark:text-white tracking-tighter leading-none mb-1">
              {format(new Date(appt.startTime), "dd", { locale: es })}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {format(new Date(appt.startTime), "yyyy", { locale: es })}
            </p>
          </div>
          
          <div className="space-y-2 w-full mt-2">
            <span className={cn(
              "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit", 
              statusConfig.className
            )}>
              <StatusIcon className="w-3 h-3" strokeWidth={2} />
              {statusConfig.label}
            </span>
            
            {isVideo && (
              <span className="border border-black dark:border-white text-black dark:text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Video className="w-3 h-3" strokeWidth={2} />
                {t('badge_video', { defaultValue: 'Telemedicina' })}
              </span>
            )}
          </div>
        </div>

        {/* --- COLUMNA 2: DETALLES DEL DOCTOR Y SERVICIO --- */}
        <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight mb-2">
              {appt.serviceName}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span>
                {format(new Date(appt.startTime), "HH:mm", { locale: es })} HRS
                {' — '}
                {format(new Date(appt.endTime), "HH:mm", { locale: es })} HRS
              </span>
            </div>
          </div>

          {/* Info del Especialista (Avatar Cuadrado) */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 overflow-hidden">
              {appt.providerImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={appt.providerImageUrl} alt="Provider" className="w-full h-full object-cover grayscale" />
              ) : (
                <span className="text-xs font-bold text-black dark:text-white">
                  {appt.providerNameSnapshot?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                {appt.providerNameSnapshot}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-[9px] font-light uppercase tracking-widest text-gray-500">
                  {appt.providerSpecialty || t('specialist_fallback', { defaultValue: 'Especialista Médico' })}
                </p>
                {appt.providerRating && (
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-800 px-1.5 py-0.5 bg-gray-50 dark:bg-[#050505]">
                    <Star className="w-2.5 h-2.5 text-black dark:text-white fill-black dark:fill-white" />
                    <span className="text-[9px] font-bold text-black dark:text-white">{appt.providerRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación o Precio */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {appt.locationAddress && !isVideo && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{appt.locationAddress}</span>
              </div>
            )}
            
            {appt.price != null && (
              <div className="flex flex-col sm:items-end w-full sm:w-auto">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  {t('label_total', { defaultValue: 'Importe' })}
                </span>
                <span className="text-sm font-semibold text-black dark:text-white tracking-tight">
                  ${appt.price} {appt.currency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- COLUMNA 3: ACCIONES (Comandos Técnicos) --- */}
        <div className="p-6 lg:w-56 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] shrink-0">
          
          {canJoinVideo && (
            <Button
              onClick={() => appt.meetLink ? window.open(appt.meetLink, '_blank') : toast.info("El enlace de conexión aún no está activo.")}
              className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4 border-0"
            >
              <Video className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
              {t('btn_join_video', { defaultValue: 'Conectar Video' })}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push(`/patient/appointments/${appt.id}`)}
            className="w-full rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:border-black dark:hover:border-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
          >
            <Eye className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
            {t('btn_view_details', { defaultValue: 'Auditar Ficha' })}
          </Button>

          {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
            <Button
              variant="outline"
              onClick={() => toast.success(t('toast_calendar_added') || "Registro sincronizado al calendario local")}
              className="w-full rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:border-black dark:hover:border-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
              {t('btn_add_calendar', { defaultValue: 'Sincronizar Cal' })}
            </Button>
          )}

          {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
            <Button
              variant="outline"
              onClick={() => onRequestCancel(appt)}
              className="w-full rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
            >
              <XCircle className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
              {t('btn_cancel', { defaultValue: 'Anular Registro' })}
            </Button>
          )}

          {isPast && (
            <Button
              variant="outline"
              onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.providerNameSnapshot)}`)}
              className="w-full rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
              {t('btn_rebook', { defaultValue: 'Re-agendar' })}
            </Button>
          )}

          {appt.status === 'COMPLETED' && (
            <Button
              variant="ghost"
              onClick={() => toast.info(t('toast_receipt', { defaultValue: 'Generando comprobante fiscal...' }))}
              className="w-full rounded-none border border-transparent bg-gray-100 dark:bg-gray-900 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
            >
              <Download className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
              {t('btn_receipt', { defaultValue: 'Extraer Recibo' })}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}