"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  MoreVertical,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

/**
 * UpcomingAppointments Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Estados visuales por color
 *    - Iconos descriptivos
 *    - Badges de estado
 *    - Timeline visual
 * 
 * 2. JERARQUÍA VISUAL
 *    - Próxima cita destacada
 *    - Hora prominente
 *    - Servicios secundarios
 *    - Actions terciarios
 * 
 * 3. AFFORDANCE
 *    - Quick actions visibles
 *    - Hover effects claros
 *    - Click para detalles
 *    - Copy link fácil
 * 
 * 4. FEEDBACK INMEDIATO
 *    - Estados de carga
 *    - Copy confirmación
 *    - Hover tooltips
 *    - Visual confirmación
 * 
 * 5. PRIMING
 *    - Verde = confirmado
 *    - Amarillo = pendiente
 *    - Azul = en progreso
 *    - Gris = completado
 * 
 * 6. CREDIBILIDAD
 *    - Tiempo relativo visible
 *    - Tipo de cita (presencial/virtual)
 *    - Duración estimada
 *    - Próxima cita destacada
 */

// Tipos mejorados
export interface Appointment {
  id: string;
  clientName: string;
  clientAvatar?: string;
  service: string;
  time: string;
  duration?: number; // minutos
  status?: 'confirmed' | 'pending' | 'in-progress' | 'completed';
  type?: 'in-person' | 'video' | 'phone';
  location?: string;
  notes?: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  maxVisible?: number;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ 
  appointments,
  onAppointmentClick,
  maxVisible = 5
}) => {
  const t = useTranslations('UpcomingAppointments');
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper para color de estado - PRIMING
  const getStatusConfig = (status?: string) => {
    const configs = {
      confirmed: {
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        label: t('confirmed'),
        icon: CheckCircle2
      },
      pending: {
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        dotColor: 'bg-amber-500',
        label: t('pending'),
        icon: AlertCircle
      },
      'in-progress': {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        dotColor: 'bg-blue-500',
        label: t('in_progress'),
        icon: Clock3
      },
      completed: {
        color: 'text-slate-400 dark:text-slate-500',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        dotColor: 'bg-gray-500',
        label: t('completed'),
        icon: CheckCircle2
      }
    };
    return configs[status as keyof typeof configs] || configs.confirmed;
  };

  // Helper para tipo de cita - RECONOCIMIENTO
  const getTypeIcon = (type?: string) => {
    const icons = {
      'in-person': MapPin,
      'video': Video,
      'phone': Phone
    };
    return icons[type as keyof typeof icons] || MapPin;
  };

  // Helper para copiar link - FEEDBACK INMEDIATO
  const handleCopyLink = () => {
    const link = `${window.location.origin}/book/profile`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success(t('link_copied'));
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Empty State - AFFORDANCE
  if (appointments.length === 0) {
    return (
      <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800/50 h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-white">
            <div className="p-2 bg-purple-500/10 rounded-lg mr-3 border border-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-400"/>
            </div>
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-6 rounded-full mb-4 border border-slate-700 dark:border-slate-800">
              <Calendar className="w-10 h-10 text-slate-500 dark:text-slate-600" />
            </div>
            <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
          
          <h3 className="font-bold text-white text-lg mb-2">
            {t('no_appointments')}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
            {t('no_appointments_desc')}
          </p>
          
          <Button 
            onClick={handleCopyLink}
            className={cn(
              "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300",
              copiedLink ? "bg-emerald-600 hover:bg-emerald-700" : ""
            )}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t('copy_link')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const visibleAppointments = appointments.slice(0, maxVisible);
  const nextAppointment = visibleAppointments[0]; // Primera cita es la próxima

  return (
    <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800/50 h-full flex flex-col">
      
      {/* Header - JERARQUÍA VISUAL */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
            >
              <Calendar className="w-5 h-5 text-purple-400"/>
            </motion.div>
            <div>
              <CardTitle className="text-lg font-black text-white">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                Agenda para hoy
              </CardDescription>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className="bg-purple-500/10 text-purple-300 border-purple-500/20 font-bold"
          >
            {appointments.length} {appointments.length === 1 ? t('appointment') : t('appointments')}
          </Badge>
        </div>
      </CardHeader>

      {/* Next Appointment Highlight - JERARQUÍA */}
      {nextAppointment && (
        <div className="px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                {t('next_appointment')}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              {/* Avatar Placeholder */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {nextAppointment.clientName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base mb-1">
                  {nextAppointment.clientName}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">
                  {nextAppointment.service}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    {nextAppointment.time}
                  </Badge>
                  
                  {nextAppointment.duration && (
                    <Badge variant="outline" className="bg-slate-800 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-700 dark:border-slate-800">
                      {nextAppointment.duration} min
                    </Badge>
                  )}
                  
                  {nextAppointment.type && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {React.createElement(getTypeIcon(nextAppointment.type), { className: "w-3 h-3 mr-1" })}
                      {nextAppointment.type === 'video' ? t('virtual') : 
                       nextAppointment.type === 'phone' ? t('phone') : t('in_person')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Appointments List - RECONOCIMIENTO */}
      <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ul className="space-y-2">
          {visibleAppointments.map((appt, index) => {
            const statusConfig = getStatusConfig(appt.status);
            const StatusIcon = statusConfig.icon;
            const TypeIcon = getTypeIcon(appt.type);
            const isNext = index === 0;

            return (
              <motion.li 
                key={appt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onAppointmentClick?.(appt)}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                  isNext 
                    ? "bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10" 
                    : "bg-slate-950/50 dark:bg-slate-950/70 border-slate-800 dark:border-slate-800/50 hover:bg-slate-800 dark:bg-slate-900",
                  onAppointmentClick ? "cursor-pointer" : ""
                )}
              >
                {/* Timeline indicator - JERARQUÍA VISUAL */}
                {index < visibleAppointments.length - 1 && (
                  <div className="absolute left-9 top-14 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 to-transparent" />
                )}

                {/* Time Block */}
                <div className={cn(
                  "relative z-10 flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-lg border transition-all",
                  isNext 
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800/50 group-hover:border-purple-500/20"
                )}>
                  <Clock className={cn(
                    "w-4 h-4 mb-1",
                    isNext ? "text-purple-400" : "text-slate-500 dark:text-slate-600"
                  )} />
                  <span className={cn(
                    "text-xs font-bold whitespace-nowrap",
                    isNext ? "text-white" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {appt.time}
                  </span>
                  {appt.duration && (
                    <span className="text-[10px] text-slate-600 dark:text-slate-700">
                      {appt.duration}min
                    </span>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn(
                      "text-sm font-bold truncate",
                      isNext ? "text-white" : "text-slate-200 dark:text-slate-300"
                    )}>
                      {appt.service}
                    </p>
                    {isNext && (
                      <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0">
                        AHORA
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{appt.clientName}</span>
                  </div>

                  {/* Type & Status */}
                  <div className="flex items-center gap-2">
                    {appt.type && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-600">
                        <TypeIcon className="w-3 h-3" />
                        {appt.type === 'video' && 'Virtual'}
                        {appt.type === 'phone' && 'Tel'}
                        {appt.type === 'in-person' && appt.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Indicator - PRIMING */}
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    statusConfig.dotColor,
                    "shadow-[0_0_8px_currentColor]"
                  )} />
                  
                  {/* Quick Actions on Hover */}
                  <AnimatePresence>
                    {onAppointmentClick && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-800 dark:bg-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-800 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick action
                        }}
                      >
                        <MoreVertical className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {/* Show More Indicator */}
        {appointments.length > maxVisible && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-600">
              {t('more_appointments', { count: appointments.length - maxVisible })}
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Footer - AFFORDANCE */}
      <div className="p-4 border-t border-slate-800 dark:border-slate-800/50 mt-auto">
        <Link href="/dashboard/calendar" className="w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800 dark:bg-slate-900 group transition-all"
          >
            <span className="font-semibold">{t('view_calendar')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};