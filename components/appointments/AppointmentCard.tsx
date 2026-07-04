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
 return { 
 label: t('status_completed', { defaultValue: 'Completada' }), 
 icon: CheckCircle2, 
 // Invierte de Negro a Blanco en hover
 className: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black group-hover:bg-white group-hover:border-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:border-black dark:group-hover:text-white transition-colors duration-300' 
 };
 case 'SCHEDULED':
 return { 
 label: t('status_confirmed', { defaultValue: 'Confirmada' }), 
 icon: CheckCircle2, 
 // Invierte de Gris Oscuro a Blanco en hover
 className: 'border-gray-800 text-gray-800 dark:border-gray-300 dark:text-gray-300 group-hover:border-white group-hover:text-white dark:group-hover:border-black dark:group-hover:text-black transition-colors duration-300' 
 };
 case 'PENDING_PAYMENT':
 return { 
 label: t('status_pending', { defaultValue: 'Pago Pendiente' }), 
 icon: AlertCircle, 
 // Mantiene su semántica, aclara un poco para contrastar en fondo negro
 className: 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400 group-hover:border-amber-400 group-hover:text-amber-400 dark:group-hover:border-amber-500 dark:group-hover:text-amber-500 transition-colors duration-300' 
 };
 case 'IN_PROGRESS':
 return { 
 label: "En Progreso", 
 icon: Clock, 
 // Invierte de Negro a Blanco
 className: 'border-black text-black dark:border-white dark:text-white group-hover:border-white group-hover:text-white dark:group-hover:border-black dark:group-hover:text-black animate-pulse transition-colors duration-300' 
 };
 case 'CANCELED_BY_CONSUMER':
 case 'CANCELED_BY_PROVIDER':
 case 'NO_SHOW':
 return { 
 label: t('status_canceled', { defaultValue: 'Cancelada' }), 
 icon: XCircle, 
 className: 'border-red-500 text-red-600 dark:border-red-400 dark:text-red-400 transition-colors duration-300' 
 };
 default:
 return { 
 label: "Desconocido", 
 icon: AlertCircle, 
 className: 'border-gray-300 text-gray-500 dark:border-gray-700 transition-colors duration-300' 
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
 {/* --- CONTENEDOR MAESTRO --- Z-index, Hover invertido y Elevación Brutalista */}
 <div className="group relative z-0 hover:z-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-black dark:hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] flex flex-col lg:flex-row">

 {/* --- COLUMNA 1: FECHA Y ESTADO --- */}
 <div className="bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent p-6 lg:w-48 flex flex-col justify-center items-start border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 group-hover:border-gray-800 dark:group-hover:border-gray-200 gap-4 shrink-0 transition-colors duration-300">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors duration-300 mb-1">
 {format(new Date(appt.startTime), "MMM", { locale: es })}
 </p>
 <p className="text-4xl font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300 tracking-tighter leading-none mb-1">
 {format(new Date(appt.startTime), "dd", { locale: es })}
 </p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
 {format(new Date(appt.startTime), "yyyy", { locale: es })}
 </p>
 </div>
 
 <div className="space-y-2 w-full mt-2">
 <span className={cn(
 "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit transition-colors duration-300", 
 statusConfig.className
 )}>
 <StatusIcon className="w-3 h-3" strokeWidth={2} />
 {statusConfig.label}
 </span>
 
 {isVideo && (
 <span className="border border-black dark:border-white text-black dark:text-white group-hover:border-white group-hover:text-white dark:group-hover:border-black dark:group-hover:text-black transition-colors duration-300 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
 <Video className="w-3 h-3" strokeWidth={2} />
 {t('badge_video', { defaultValue: 'Telemedicina' })}
 </span>
 )}
 </div>
 </div>

 {/* --- COLUMNA 2: DETALLES DEL DOCTOR Y SERVICIO --- */}
 <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
 <div>
 <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300 tracking-tight mb-2">
 {appt.serviceName}
 </h3>
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
 <Clock className="w-3 h-3" strokeWidth={1.5} />
 <span>
 {format(new Date(appt.startTime), "HH:mm", { locale: es })} HRS
 {' — '}
 {format(new Date(appt.endTime), "HH:mm", { locale: es })} HRS
 </span>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-black dark:border-white group-hover:border-white dark:group-hover:border-black bg-gray-50 dark:bg-[#050505] group-hover:bg-[#111] dark:group-hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center shrink-0 overflow-hidden">
 {appt.providerImageUrl ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={appt.providerImageUrl} alt="Provider" className="w-full h-full object-cover" />
 ) : (
 <span className="text-xs font-bold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
 {appt.providerNameSnapshot?.charAt(0) || '?'}
 </span>
 )}
 </div>
 <div className="flex-1">
 <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
 {appt.providerNameSnapshot}
 </p>
 <div className="flex items-center gap-3 mt-0.5">
 <p className="text-[9px] font-light uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
 {appt.providerSpecialty || t('specialist_fallback', { defaultValue: 'Especialista Médico' })}
 </p>
 {appt.providerRating && (
 <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-800 group-hover:border-gray-700 dark:group-hover:border-gray-300 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent px-1.5 py-0.5 transition-colors duration-300">
 <Star className="w-2.5 h-2.5 text-black dark:text-white fill-black dark:fill-white group-hover:text-white group-hover:fill-white dark:group-hover:text-black dark:group-hover:fill-black transition-colors duration-300" />
 <span className="text-[9px] font-bold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">{appt.providerRating}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800 group-hover:border-gray-800 dark:group-hover:border-gray-200 transition-colors duration-300">
 {appt.locationAddress && !isVideo && (
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
 <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
 <span>{appt.locationAddress}</span>
 </div>
 )}
 
 {appt.price != null && (
 <div className="flex flex-col sm:items-end w-full sm:w-auto">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400 mb-0.5 transition-colors duration-300">
 {t('label_total', { defaultValue: 'Importe' })}
 </span>
 <span className="text-sm font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black tracking-tight transition-colors duration-300">
 ${appt.price} {appt.currency}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* --- COLUMNA 3: ACCIONES --- */}
 {/* Hacemos transparente el fondo en hover para que se funda con el padre */}
 <div className="p-6 lg:w-56 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 group-hover:border-gray-800 dark:group-hover:border-gray-200 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent shrink-0 transition-colors duration-300">
 
 {canJoinVideo && (
 <Button
 onClick={() => appt.meetLink ? window.open(appt.meetLink, '_blank') : toast.info("El enlace de conexión aún no está activo.")}
 // Hover individual sobrepuesto con !important (via la utilidad de Tailwind hover:!bg-...)
 className="w-full rounded-none border-0 h-10 text-[9px] font-bold uppercase tracking-widest flex justify-start pl-4 transition-colors duration-300 bg-black text-white dark:bg-white dark:text-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white hover:!bg-gray-200 dark:hover:!bg-gray-800"
 >
 <Video className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
 {t('btn_join_video', { defaultValue: 'Conectar Video' })}
 </Button>
 )}

 <Button
 variant="outline"
 onClick={() => router.push(`/patient/appointments/${appt.id}`)}
 className="w-full rounded-none h-10 text-[9px] font-bold uppercase tracking-widest flex justify-start pl-4 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-300 dark:border-gray-700 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black group-hover:border-gray-600 dark:group-hover:border-gray-400 hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white"
 >
 <Eye className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
 {t('btn_view_details', { defaultValue: 'Auditar Ficha' })}
 </Button>

 {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
 <Button
 variant="outline"
 onClick={() => toast.success(t('toast_calendar_added') || "Registro sincronizado al calendario local")}
 className="w-full rounded-none h-10 text-[9px] font-bold uppercase tracking-widest flex justify-start pl-4 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-300 dark:border-gray-700 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black group-hover:border-gray-600 dark:group-hover:border-gray-400 hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white"
 >
 <CalendarPlus className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
 {t('btn_add_calendar', { defaultValue: 'Sincronizar Cal' })}
 </Button>
 )}

 {(appt.status === 'SCHEDULED' || appt.status === 'PENDING_PAYMENT') && !isPast && (
 <Button
 variant="outline"
 onClick={() => onRequestCancel(appt)}
 // El botón de cancelar se mantiene con su esquema de alerta roja
 className="w-full rounded-none border border-red-500 bg-transparent text-red-500 h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4 hover:!bg-red-500 hover:!text-white"
 >
 <XCircle className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
 {t('btn_cancel', { defaultValue: 'Anular Registro' })}
 </Button>
 )}

 {isPast && (
 <Button
 variant="outline"
 onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.providerNameSnapshot)}`)}
 className="w-full rounded-none h-10 text-[9px] font-bold uppercase tracking-widest flex justify-start pl-4 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-300 dark:border-gray-700 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black group-hover:border-gray-600 dark:group-hover:border-gray-400 hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white"
 >
 <RefreshCw className="w-3.5 h-3.5 mr-3" strokeWidth={1.5} />
 {t('btn_rebook', { defaultValue: 'Re-agendar' })}
 </Button>
 )}

 {appt.status === 'COMPLETED' && (
 <Button
 variant="ghost"
 onClick={() => toast.info(t('toast_receipt', { defaultValue: 'Generando comprobante fiscal...' }))}
 className="w-full rounded-none h-10 text-[9px] font-bold uppercase tracking-widest flex justify-start pl-4 transition-colors duration-300 bg-gray-100 dark:bg-[#111] text-gray-500 group-hover:bg-[#111] dark:group-hover:bg-gray-100 group-hover:text-gray-300 hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white"
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