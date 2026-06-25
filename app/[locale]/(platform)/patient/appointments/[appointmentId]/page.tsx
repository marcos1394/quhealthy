"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/js-hoist-intl */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, 
  User, Stethoscope, Receipt, AlertCircle, FileText, CreditCard, MessageSquare, RotateCcw, XCircle, QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';

import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';
import { paymentService } from '@/services/payment.service';
import { chatService } from '@/services/chat.service';
import { handleApiError } from '@/lib/handleApiError';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PatientAppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Hook maestro
  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl
  } = useAppointmentDetails(appointmentId);

  const handlePayNow = async () => {
    if (!appointment) return;
    try {
      setIsProcessingPayment(true);
      const checkoutUrl = await paymentService.createCheckoutSession(appointment.id);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("No se pudo generar la sesión de pago.");
      }
    } catch (error) {
      toast.error("Hubo un error al intentar iniciar el pago.");
      handleApiError(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleStartChat = async () => {
    if (!appointment) return;
    try {
      setIsStartingChat(true);
      await chatService.startConversation(appointment.consumerId, appointment.providerId);
      router.push('/patient/dashboard/messages');
    } catch (error) {
      toast.error("Fallo de comunicación encriptada.");
      handleApiError(error);
    } finally {
      setIsStartingChat(false);
    }
  };

  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Desencriptando expediente clínico...
        </p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">Expediente Inaccesible</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8">
          El registro solicitado no existe o carece de permisos de visualización.
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard/appointments")} 
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
        >
          <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} /> Retornar al Directorio
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ FORMATEO DE DATOS
  // ==========================================
  
  const isOnline = appointment.type === 'ONLINE' || appointment.appointmentType === 'ONLINE';
  const dateFormatted = format(new Date(appointment.startTime), "dd MMM yyyy", { locale: es });
  const timeFormatted = format(new Date(appointment.startTime), "HH:mm", { locale: es });
  
  const statusColorMap: Record<string, string> = {
    'PENDING_PAYMENT': 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400',
    'SCHEDULED': 'border-black text-black bg-gray-50 dark:border-white dark:bg-[#050505] dark:text-white',
    'COMPLETED': 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400',
    'CANCELLED': 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    'PENDING_PAYMENT': 'Pago Pendiente',
    'SCHEDULED': 'Confirmada',
    'COMPLETED': 'Finalizada',
    'CANCELLED': 'Anulada',
  };

  const badgeClass = statusColorMap[appointment.status] || 'border-gray-300 text-gray-500';
  const statusLabel = statusLabels[appointment.status] || appointment.status;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/patient/dashboard/appointments')} 
              className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                  Folio: #{appointment.id}
                </span>
                <span className={cn(
                  "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest",
                  badgeClass
                )}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase">
                Auditoría de Cita Médica
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- COLUMNA IZQUIERDA: DETALLES PRINCIPALES --- */}
          <div className="flex-1 space-y-12">
            
            {/* Bloque: Fecha y Hora */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  Programación Temporal
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800">
                <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
                    <Calendar className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Fecha Acordada</p>
                    <p className="text-xl font-semibold text-black dark:text-white tracking-tight uppercase">{dateFormatted}</p>
                  </div>
                </div>
                <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
                    <Clock className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Bloque Horario</p>
                    <p className="text-xl font-semibold text-black dark:text-white tracking-tight">
                      {timeFormatted} HRS <span className="text-xs font-light text-gray-500 ml-2">[{appointment.durationMinutes} MIN]</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque: Datos del Especialista y Servicio */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Detalles Clínicos
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 overflow-hidden">
                    <span className="text-xl font-bold uppercase">{(appointment.providerNameSnapshot || 'E').charAt(0)}</span>
                  </div>
                  <div className="flex flex-col justify-center h-16">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Especialista Asignado</p>
                    <p className="text-xl font-semibold tracking-tight uppercase text-black dark:text-white">
                      {appointment.providerNameSnapshot || 'Especialista General'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5" strokeWidth={1.5} /> Procedimiento a Realizar
                  </p>
                  <p className="text-lg font-semibold tracking-tight text-black dark:text-white uppercase">
                    {appointment.serviceNameSnapshot || appointment.serviceName || 'Consulta Integral'}
                  </p>
                </div>

                {appointment.consumerSymptoms && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Observaciones del Paciente
                    </p>
                    <div className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] p-5 text-xs font-light text-black dark:text-white leading-relaxed uppercase tracking-wide">
                      "{appointment.consumerSymptoms}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bloque: Ubicación / Conexión */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
               <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  Logística de Asistencia
                </h3>
              </div>
              <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-14 h-14 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  {isOnline ? <Video className="w-6 h-6" strokeWidth={1.5} /> : <MapPin className="w-6 h-6" strokeWidth={1.5} />}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Modalidad: {isOnline ? 'TELEMEDICINA' : 'ATENCIÓN PRESENCIAL'}
                  </p>
                  
                  {isOnline ? (
                    <div className="space-y-3 mt-2">
                      <p className="text-xs font-light leading-relaxed text-black dark:text-white">
                        El enlace cifrado para la transmisión se activará minutos antes de su consulta.
                      </p>
                      {appointment.meetLink ? (
                        <a href={appointment.meetLink} target="_blank" rel="noreferrer" className="inline-flex border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 transition-colors">
                          <Video className="w-3 h-3 mr-2" strokeWidth={1.5} /> Iniciar Transmisión
                        </a>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" strokeWidth={2} /> Enlace en generación
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold tracking-tight text-black dark:text-white uppercase leading-relaxed mt-2">
                      {appointment.locationAddress || 'DIRECCIÓN NO ESPECIFICADA. CONTACTE AL PROVEEDOR.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* --- COLUMNA DERECHA: ACCIONES Y QR --- */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-8">
            
            {/* Bloque: Check-In QR */}
            {appointment.status === 'SCHEDULED' && qrCodeUrl && (
              <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-1">
                    <QrCode className="w-4 h-4" strokeWidth={1.5} /> Identificación QR
                  </h3>
                  <p className="text-[9px] font-light uppercase tracking-widest text-gray-500">
                    Escanear en Módulo de Recepción
                  </p>
                </div>
                <div className="p-8 flex items-center justify-center">
                  <div className="bg-white p-3 border border-gray-300">
                    <Image src={qrCodeUrl} alt="Código QR Check-in" width={180} height={180} className="w-48 h-48 mix-blend-multiply" />
                  </div>
                </div>
              </div>
            )}

            {/* Bloque: Finanzas y Recibos */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4" strokeWidth={1.5} /> Resumen Financiero
                </h3>
              </div>
              <div className="p-6 md:p-8 space-y-8">
                
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Importe Final</span>
                  <span className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: appointment.currency || 'MXN' }).format(appointment.totalPrice || 0)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  {appointment.paymentStatus === 'SETTLED' ? (
                    <Button 
                      onClick={downloadInvoice} 
                      disabled={isDownloading}
                      className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-between px-6"
                    >
                      Extraer Recibo Fiscal
                      {isDownloading ? <QhSpinner size="sm" /> : <FileText className="w-4 h-4" strokeWidth={1.5} />}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                          Estado: Requiere Liquidación
                        </p>
                      </div>
                      <Button 
                        onClick={handlePayNow} 
                        disabled={isProcessingPayment}
                        className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-between px-6 disabled:opacity-50"
                      >
                        Ejecutar Pago
                        {isProcessingPayment ? <QhSpinner size="sm" /> : <CreditCard className="w-4 h-4" strokeWidth={1.5} />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bloque de Comandos (Chat / Reprogramar / Cancelar) */}
            <div className="space-y-4">
              {(appointment.status === 'SCHEDULED' || appointment.status === 'COMPLETED') && appointment.paymentStatus === 'SETTLED' && (
                <Button 
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  className="w-full rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 disabled:opacity-50"
                >
                  Mensaje al Proveedor
                  {isStartingChat ? <QhSpinner size="sm" /> : <MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
                </Button>
              )}

              {appointment.status === 'SCHEDULED' && (
                <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <Button variant="outline" className="w-full rounded-none border border-gray-300 dark:border-gray-700 text-gray-600 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-6">
                    <RotateCcw className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Reprogramar Cita
                  </Button>
                  <Button variant="outline" className="w-full rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-6">
                    <XCircle className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Anular Registro
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}