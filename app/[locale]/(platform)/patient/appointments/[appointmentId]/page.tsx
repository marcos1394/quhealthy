"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, 
  User, Stethoscope, Receipt, AlertCircle, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';

import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientAppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  // Usamos el hook maestro que ya tienes construido
  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl
  } = useAppointmentDetails(appointmentId);

  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="text-slate-500 mt-4 font-medium">Cargando detalles de tu cita...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cita no encontrada</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 text-center max-w-sm">
          No pudimos localizar esta cita. Es posible que haya sido eliminada o que no tengas permisos para verla.
        </p>
        <Button onClick={() => router.push("/patient/appointments")} variant="outline">
          Volver a mis citas
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ FORMATEO DE DATOS
  // ==========================================
  
  // Usamos el mismo patrón de fechas que corregimos antes (lee la hora local directamente)
  const dateFormatted = format(new Date(appointment.startTime), "EEEE, d 'de' MMMM yyyy", { locale: es });
  const timeFormatted = format(new Date(appointment.startTime), "HH:mm 'hrs'", { locale: es });
  
  const statusColorMap: Record<string, string> = {
    'PENDING_PAYMENT': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'SCHEDULED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    'PENDING_PAYMENT': 'Pago Pendiente',
    'SCHEDULED': 'Confirmada',
    'COMPLETED': 'Finalizada',
    'CANCELLED': 'Cancelada',
  };

  const badgeClass = statusColorMap[appointment.status] || 'bg-slate-100 text-slate-800';
  const statusLabel = statusLabels[appointment.status] || appointment.status;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/patient/appointments')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Detalle de Cita
              <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${badgeClass}`}>
                {statusLabel}
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Folio: #{appointment.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: DETALLES PRINCIPALES */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta de Fecha y Hora */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="bg-medical-50 dark:bg-medical-900/20 p-3 rounded-xl h-fit">
                      <Calendar className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Fecha Programada</p>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{dateFormatted}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-medical-50 dark:bg-medical-900/20 p-3 rounded-xl h-fit">
                      <Clock className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Hora y Duración</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {timeFormatted} <span className="text-slate-400 font-normal">({appointment.durationMinutes} min)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta del Especialista y Servicio */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" /> Datos del Especialista
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Profesional de la Salud</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white capitalize">
                    {appointment.providerNameSnapshot || 'Especialista'}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Servicio a recibir
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {appointment.serviceNameSnapshot || appointment.serviceName || 'Consulta Médica'}
                  </p>
                </div>

                {appointment.consumerSymptoms && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-2">Tus notas o síntomas</p>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                      {appointment.consumerSymptoms}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarjeta de Ubicación */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl h-fit">
                  {appointment.appointmentType === 'ONLINE' ? (
                    <Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    {appointment.appointmentType === 'ONLINE' ? 'Videoconsulta' : 'Cita Presencial'}
                  </p>
                  {appointment.appointmentType === 'ONLINE' ? (
                    <div>
                      <p className="text-slate-900 dark:text-white mb-3">El enlace de la videollamada se activará minutos antes de tu cita.</p>
                      {appointment.meetLink ? (
                        <a href={appointment.meetLink} target="_blank" rel="noreferrer" className="text-medical-600 dark:text-medical-400 font-medium hover:underline">
                          Unirse a la llamada
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">Enlace pendiente de generación</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium">
                      {appointment.locationAddress || 'Dirección por confirmar'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* COLUMNA DERECHA: ACCIONES Y QR */}
          <div className="space-y-6">
            
            {/* Tarjeta de Check-In QR */}
            {appointment.status === 'SCHEDULED' && qrCodeUrl && (
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-2 border-medical-500/20">
                <CardHeader className="bg-medical-50 dark:bg-medical-900/10 pb-4 text-center border-b border-medical-100 dark:border-medical-900/30">
                  <CardTitle className="text-medical-800 dark:text-medical-400 text-base">Check-in de Cita</CardTitle>
                  <p className="text-xs text-medical-600/70 dark:text-medical-400/70">Muestra este código en recepción</p>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center bg-white">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <Image src={qrCodeUrl} alt="Código QR de tu cita" width={180} height={180} className="w-48 h-48" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tarjeta de Pagos y Recibos */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-slate-400" /> Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Costo total</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: appointment.currency || 'MXN' }).format(appointment.totalPrice || 0)}
                  </span>
                </div>
                
                {appointment.paymentStatus === 'SETTLED' ? (
                  <Button 
                    onClick={downloadInvoice} 
                    disabled={isDownloading}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-medium"
                  >
                    {isDownloading ? <QhSpinner size="sm" className="mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Descargar Recibo
                  </Button>
                ) : (
                  <p className="text-sm text-amber-600 text-center font-medium bg-amber-50 p-2 rounded-lg">
                    Pendiente de pago
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Botones de Acción Extra (Reprogramar/Cancelar) */}
            {appointment.status === 'SCHEDULED' && (
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-start text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" /> Reprogramar Cita
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <AlertCircle className="w-4 h-4 mr-2" /> Cancelar Cita
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
