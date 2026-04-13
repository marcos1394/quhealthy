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
import { Card, CardContent } from '@/components/ui/card';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function VideoCallLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('PatientVideoCall');
  const { user } = useSessionStore();

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  // 🚀 Reutilizamos el hook que ya tienes para traer la cita
  const { appointment, isLoading, error } = useAppointmentDetails(appointmentId);

  // 1. ESTADO DE CARGA
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <QhSpinner size="lg" className="text-blue-600" />
        <p className="text-blue-900 font-medium mt-4">Preparando sala virtual...</p>
      </div>
    );
  }

  // 2. ESTADO DE ERROR O ACCESO DENEGADO
  if (error || !appointment || (user && appointment.consumerId !== user.id)) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-5 rounded-full mb-6 shadow-sm">
          <AlertCircle className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900">Acceso no disponible</h2>
        <p className="text-blue-700 mt-2 mb-8 max-w-sm mx-auto">
          No pudimos localizar esta videollamada o no tienes permisos para acceder a ella.
        </p>
        <Button onClick={() => router.push("/patient/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
          Volver a mis citas
        </Button>
      </div>
    );
  }

  // 3. VALIDACIÓN: ¿ES UNA CITA ONLINE?
  if (appointment.type !== 'ONLINE') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-blue-50 p-5 rounded-full mb-6">
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900">Cita Presencial</h2>
        <p className="text-blue-700 mt-2 mb-8 max-w-sm mx-auto">
          Esta cita está programada para ser presencial en el consultorio. No requiere videollamada.
        </p>
        <Button onClick={() => router.push("/patient/appointments")} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis citas
        </Button>
      </div>
    );
  }

  const formattedDateTime = formatInTimeZone(new Date(appointment.startTime), 'UTC', "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", { locale: es });

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* Cabecera de la Sala */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-sm border border-blue-100">
            <Video className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Sala de Videollamada</h1>
          <p className="text-blue-700">Tu especialista te está esperando en Google Meet.</p>
        </div>

        {/* Tarjeta Principal */}
        <Card className="bg-white border-blue-100 shadow-md mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 border-b border-blue-50 bg-blue-50/50">
              <p className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">Especialista</p>
              <p className="text-xl font-bold text-blue-900">{appointment.providerNameSnapshot || 'Médico Asignado'}</p>
              <p className="text-blue-700 font-medium">{appointment.serviceNameSnapshot || 'Consulta Virtual'}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-blue-800">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium capitalize">{formattedDateTime}</span>
              </div>
              <div className="flex items-center gap-3 text-blue-800">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Conexión cifrada de extremo a extremo por Google</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de Acción Principal */}
        {appointment.meetLink ? (
          <Button 
            onClick={() => window.open(appointment.meetLink, '_blank')}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-[1.02]"
          >
            <Video className="w-6 h-6 mr-2" />
            Unirse a la llamada
            <ExternalLink className="w-5 h-5 ml-2 opacity-70" />
          </Button>
        ) : (
          <div className="bg-white border border-blue-100 rounded-2xl p-6 text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-900 font-bold mb-1">Enlace no disponible aún</p>
            <p className="text-blue-700 text-sm">El médico generará el enlace momentos antes de la cita. Por favor, refresca la página más tarde.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.push("/patient/appointments")} variant="ghost" className="text-blue-600 hover:bg-blue-100 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver atrás
          </Button>
        </div>

      </div>
    </div>
  );
}