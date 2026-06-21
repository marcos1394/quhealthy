"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Video, Calendar, Clock, ExternalLink, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';
import { useSessionStore } from '@/stores/SessionStore';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function VideoCallLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('PatientVideoCall');
  const { user } = useSessionStore();

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  // Hook maestro
  const { appointment, isLoading, error } = useAppointmentDetails(appointmentId);

  // ==========================================
  // 1. ESTADO DE CARGA ARQUITECTÓNICO
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Sincronizando Módulo de Transmisión...
        </p>
      </div>
    );
  }

  // ==========================================
  // 2. ESTADO DE ERROR O ACCESO DENEGADO
  // ==========================================
  if (error || !appointment || (user && appointment.consumerId !== user.id)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">
          Acceso Denegado
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8">
          Credenciales insuficientes o identificador de sala inexistente.
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard")} 
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
        >
          Retornar al Panel Principal
        </Button>
      </div>
    );
  }

  // ==========================================
  // 3. VALIDACIÓN: ¿ES UNA CITA ONLINE?
  // ==========================================
  if (appointment.type !== 'ONLINE') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
          <Calendar className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">
          Cita Presencial Confirmada
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
          EL ENCUENTRO SE ENCUENTRA PROGRAMADO PARA ATENCIÓN FÍSICA EN INSTALACIONES. NO REQUIERE PROTOCOLO DE TRANSMISIÓN REMOTA.
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard/appointments")} 
          variant="outline" 
          className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} /> Retornar al Directorio
        </Button>
      </div>
    );
  }

  // ==========================================
  // 4. RENDERIZADO PRINCIPAL (SALA DE ESPERA)
  // ==========================================
  const formattedDateTime = formatInTimeZone(
    new Date(appointment.startTime), 
    'UTC', 
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", 
    { locale: es }
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-6 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="w-full max-w-xl">
        
        {/* Cabecera de la Sala */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-20 h-20 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center mb-6">
            <Video className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black dark:text-white mb-2">
            Módulo de Transmisión
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            CONEXIÓN ESTABLECIDA HACIA INFRAESTRUCTURA GOOGLE MEET.
          </p>
        </div>

        {/* Ficha Técnica Principal */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] mb-10">
          <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Proveedor Clínico
            </p>
            <p className="text-xl font-bold text-black dark:text-white uppercase tracking-wider">
              {appointment.providerNameSnapshot || 'MÉDICO ASIGNADO'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
              {appointment.serviceNameSnapshot || 'CONSULTA VIRTUAL'}
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-5">
              <Clock className="w-5 h-5 text-black dark:text-white flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                {formattedDateTime}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <ShieldCheck className="w-5 h-5 text-black dark:text-white flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                CANAL DE COMUNICACIÓN CIFRADO DE EXTREMO A EXTREMO
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        {appointment.meetLink ? (
          <Button 
            onClick={() => window.open(appointment.meetLink, '_blank')}
            className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 border-0"
          >
            <span className="flex items-center">
              <Video className="w-4 h-4 mr-3" strokeWidth={1.5} />
              INICIALIZAR TRANSMISIÓN
            </span>
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        ) : (
          <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-6 h-6 text-gray-400 mb-4" strokeWidth={1.5} />
            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              ENLACE PENDIENTE
            </p>
            <p className="text-[9px] font-light uppercase tracking-widest text-gray-500 leading-relaxed">
              EL ESPECIALISTA DESPLEGARÁ EL ENLACE DE CONEXIÓN PREVIO AL ENCUENTRO. <br className="hidden sm:block" /> POR FAVOR, ACTUALICE ESTA VENTA MÁS TARDE.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button 
            onClick={() => router.push("/patient/dashboard/appointments")} 
            variant="ghost" 
            className="rounded-none hover:bg-transparent hover:text-black dark:hover:text-white text-gray-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} /> ABANDONAR MÓDULO
          </Button>
        </div>

      </div>
    </div>
  );
}