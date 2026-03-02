"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  Clock, Video, CalendarPlus, MapPin, Download, CheckCircle2,
  XCircle, AlertCircle, Eye, RefreshCw, Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types/appointments'; // 🚀 IMPORTAMOS EL TIPO REAL

interface AppointmentCardProps {
  appt: Appointment;
  index: number;
  onRequestCancel: (appt: Appointment) => void;
}

export function AppointmentCard({ appt, index, onRequestCancel }: AppointmentCardProps) {
  const router = useRouter();
  const t = useTranslations('PatientAppointments');

  // Lógica de visualización basada en datos reales
  const isPast = new Date(appt.endTime) < new Date();
  const isVideo = appt.type === 'ONLINE';
  const canJoinVideo = isVideo && !isPast && (appt.status === 'SCHEDULED' || appt.status === 'IN_PROGRESS');

  // Mapeo de estados reales a colores e iconos
  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { label: t('status_completed', { defaultValue: 'Completada' }), icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' };
      case 'SCHEDULED':
        return { label: t('status_confirmed', { defaultValue: 'Confirmada' }), icon: CheckCircle2, className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' };
      case 'PENDING_PAYMENT':
        return { label: t('status_pending', { defaultValue: 'Pago Pendiente' }), icon: AlertCircle, className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' };
      case 'IN_PROGRESS':
        return { label: "En Progreso", icon: Clock, className: 'bg-medical-50 text-medical-700 border-medical-200 dark:bg-medical-500/10 dark:text-medical-400 animate-pulse' };
      case 'CANCELED_BY_CONSUMER':
      case 'CANCELED_BY_PROVIDER':
      case 'NO_SHOW':
        return { label: t('status_canceled', { defaultValue: 'Cancelada' }), icon: XCircle, className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' };
      default:
        return { label: "Desconocido", icon: AlertCircle, className: 'bg-slate-50 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400' };
    }
  };

  const statusConfig = getStatusConfig(appt.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">

            {/* --- COLUMNA 1: FECHA Y ESTADO --- */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col justify-center items-center lg:items-start min-w-[180px] border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 gap-3">
              <div className="text-center lg:text-left">
                <p className="text-sm font-bold text-medical-600 dark:text-medical-400 uppercase tracking-wide">
                  {formatInTimeZone(new Date(appt.startTime), 'UTC', "MMM", { locale: es })}
                </p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatInTimeZone(new Date(appt.startTime), 'UTC', "d", { locale: es })}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  {formatInTimeZone(new Date(appt.startTime), 'UTC', "yyyy", { locale: es })}
                </p>
              </div>
              <Badge variant="outline" className={cn("border", statusConfig.className)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {isVideo && (
                <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                  <Video className="w-3 h-3 mr-1" />
                  {t('badge_video', { defaultValue: 'Video Consulta' })}
                </Badge>
              )}
            </div>

            {/* --- COLUMNA 2: DETALLES DEL DOCTOR Y SERVICIO --- */}
            <div className="p-6 flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                  {appt.serviceName}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">
                    {formatInTimeZone(new Date(appt.startTime), 'UTC', "h:mm a", { locale: es })}
                    {' - '}
                    {formatInTimeZone(new Date(appt.endTime), 'UTC', "h:mm a", { locale: es })}
                  </span>
                </div>
              </div>

              {/* Info del Doctor */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-medical-200 dark:border-medical-500/20">
                  <AvatarImage src={appt.providerImageUrl} />
                  <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold">
                    {appt.providerNameSnapshot.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{appt.providerNameSnapshot}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {appt.providerSpecialty || t('specialist_fallback', { defaultValue: 'Especialista' })}
                    </p>
                    {appt.providerRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{appt.providerRating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ubicación o Precio */}
              <div className="flex items-center justify-between">
                {appt.locationAddress && !isVideo && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{appt.locationAddress}</span>
                  </div>
                )}
                {appt.totalPrice && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('label_total', { defaultValue: 'Total' })}</p>
                    <p className="text-lg font-bold text-medical-600 dark:text-medical-400">
                      ${appt.totalPrice}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* --- COLUMNA 3: ACCIONES --- */}
            <div className="p-6 flex flex-col items-stretch justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 min-w-[200px]">
              
              {canJoinVideo && (
                <Button
                  onClick={() => appt.meetLink ? window.open(appt.meetLink, '_blank') : toast.info("El enlace aún no está disponible.")}
                  className="w-full bg-gradient-to-r from-blue-600 to-medical-600 hover:from-blue-700 hover:to-medical-700 shadow-lg group"
                >
                  <Video className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {t('btn_join_video', { defaultValue: 'Entrar a Videollamada' })}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.push(`/appointments/${appt.id}`)}
                className="w-full border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('btn_view_details', { defaultValue: 'Ver Detalles' })}
              </Button>

              {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
                <Button
                  variant="outline"
                  onClick={() => toast.success(t('toast_calendar_added') || "Añadido al calendario")}
                  className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  {t('btn_add_calendar', { defaultValue: 'Añadir al Calendario' })}
                </Button>
              )}

              {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
                <Button
                  variant="outline"
                  onClick={() => onRequestCancel(appt)} // 🚀 Subimos la acción al padre para que abra el modal
                  className="w-full border-rose-200 dark:border-red-900 text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('btn_cancel', { defaultValue: 'Cancelar Cita' })}
                </Button>
              )}

              {isPast && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.providerNameSnapshot)}`)}
                  className="w-full border-medical-200 dark:border-medical-700 text-medical-600 dark:text-medical-400 transition-colors hover:bg-medical-50 dark:hover:bg-medical-900/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('btn_rebook', { defaultValue: 'Volver a Agendar' })}
                </Button>
              )}

              {appt.status === 'COMPLETED' && (
                <Button
                  variant="ghost"
                  onClick={() => toast.info(t('toast_receipt', { defaultValue: 'Descargando recibo...' }))}
                  className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('btn_receipt', { defaultValue: 'Descargar Recibo' })}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}