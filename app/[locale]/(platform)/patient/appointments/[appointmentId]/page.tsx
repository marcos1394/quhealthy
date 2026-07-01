"use client";

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, 
  User, Stethoscope, Receipt, AlertCircle, FileText, CreditCard, MessageSquare, RotateCcw, XCircle, QrCode, Maximize2, X
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
import { RescheduleModal } from '@/components/dashboard/RescheduleModal';

export default function PatientAppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [showFullSymptoms, setShowFullSymptoms] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  // Hook maestro
  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl
  } = useAppointmentDetails(appointmentId);

  const handlePayNow = useCallback(async () => {
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
  }, [appointment]);

  const handleStartChat = useCallback(async () => {
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
  }, [appointment, router]);

  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Cargando información de tu cita...
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
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">Cita no encontrada</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8">
          El registro solicitado no existe o no tienes permisos para verlo.
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard/appointments")} 
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
          aria-label="Volver a la lista de citas"
        >
          <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} /> Mis Citas
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
    'PENDING_PAYMENT': 'Pago pendiente',
    'SCHEDULED': 'Confirmada',
    'COMPLETED': 'Finalizada',
    'CANCELLED': 'Cancelada',
  };

  const badgeClass = statusColorMap[appointment.status] || 'border-gray-300 text-gray-500';
  const statusLabel = statusLabels[appointment.status] || appointment.status;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-8">
        
        {/* --- HEADER (más ligero) --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/patient/dashboard/appointments')} 
              className="group flex items-center gap-2 text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label="Volver a la lista de citas"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mis Citas</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
              Cita #{appointment.id}
            </span>
            <span className={cn(
              "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest",
              badgeClass
            )}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* --- COLUMNA IZQUIERDA: INFORMACIÓN --- */}
          <div className="flex-1 space-y-8">
            
            {/* Bloque: Fecha y Hora */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-5 flex items-center gap-3 bg-gray-50 dark:bg-[#050505]">
                <Calendar className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  Fecha y hora
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800">
                <div className="p-6 flex items-center gap-4">
                  <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
                    <Calendar className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Fecha</p>
                    <p className="text-xl font-semibold text-black dark:text-white tracking-tight uppercase">{dateFormatted}</p>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black">
                    <Clock className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Hora</p>
                    <p className="text-xl font-semibold text-black dark:text-white tracking-tight">
                      {timeFormatted} HRS <span className="text-xs font-light text-gray-500 ml-2">({appointment.durationMinutes} min)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque: Especialista y Servicio (unificado) */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-5 flex items-center gap-3 bg-gray-50 dark:bg-[#050505]">
                <User className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  Especialista y servicio
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold uppercase">
                      {(appointment.providerNameSnapshot || 'E').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-black dark:text-white tracking-tight uppercase">
                      {appointment.providerNameSnapshot || 'Especialista'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Stethoscope className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {appointment.serviceNameSnapshot || appointment.serviceName || 'Consulta'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observaciones del paciente (expandible) */}
                {appointment.consumerSymptoms && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Tus comentarios
                    </p>
                    <div className="relative">
                      <div className={cn(
                        "border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] p-4 text-xs font-light text-black dark:text-white leading-relaxed uppercase tracking-wide",
                        !showFullSymptoms && "line-clamp-2"
                      )}>
                        "{appointment.consumerSymptoms}"
                      </div>
                      {appointment.consumerSymptoms.length > 100 && (
                        <button 
                          onClick={() => setShowFullSymptoms(!showFullSymptoms)}
                          className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4"
                        >
                          {showFullSymptoms ? 'Mostrar menos' : 'Leer más'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bloque: Modalidad de atención */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-5 flex items-center gap-3 bg-gray-50 dark:bg-[#050505]">
                <MapPin className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  Modalidad de atención
                </h3>
              </div>
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  {isOnline ? <Video className="w-5 h-5" strokeWidth={1.5} /> : <MapPin className="w-5 h-5" strokeWidth={1.5} />}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    {isOnline ? 'Videoconsulta' : 'Presencial'}
                  </p>
                  
                  {isOnline ? (
                    <div className="space-y-3 mt-2">
                      <p className="text-xs font-light leading-relaxed text-black dark:text-white">
                        El enlace estará disponible minutos antes de tu cita.
                      </p>
                      {appointment.meetLink ? (
                        <a 
                          href={appointment.meetLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 transition-colors"
                          aria-label="Unirse a la videollamada"
                        >
                          <Video className="w-3 h-3 mr-2" strokeWidth={1.5} /> Unirse a la videollamada
                        </a>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" strokeWidth={2} /> Enlace en generación
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold tracking-tight text-black dark:text-white uppercase leading-relaxed mt-2">
                      {appointment.locationAddress || 'Dirección no especificada. Contacta al proveedor.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: ACCIONES (sticky) --- */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
            
            {/* Acción principal según estado */}
            {appointment.status === 'PENDING_PAYMENT' && (
              <Button 
                onClick={handlePayNow} 
                disabled={isProcessingPayment}
                className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-between px-6 disabled:opacity-50"
                aria-label="Pagar ahora"
              >
                Pagar ahora
                {isProcessingPayment ? <QhSpinner size="sm" /> : <CreditCard className="w-4 h-4" strokeWidth={1.5} />}
              </Button>
            )}

            {/* Bloque QR (más compacto) */}
            {appointment.status === 'SCHEDULED' && qrCodeUrl && (
              <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4" strokeWidth={1.5} /> Código QR
                    </h3>
                    <p className="text-[9px] font-light uppercase tracking-widest text-gray-500 mt-0.5">
                      Escanea en recepción
                    </p>
                  </div>
                  <button 
                    onClick={() => setQrExpanded(true)}
                    className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    aria-label="Ampliar código QR"
                  >
                    <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <div className="bg-white p-2 border border-gray-300">
                    <Image src={qrCodeUrl} alt="Código QR para check-in" width={140} height={140} className="w-36 h-36 mix-blend-multiply" />
                  </div>
                </div>
              </div>
            )}

            {/* Modal ampliación QR */}
            {qrExpanded && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrExpanded(false)}>
                <div className="relative bg-white p-6 border border-black max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setQrExpanded(false)} 
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                    aria-label="Cerrar ampliación QR"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  {qrCodeUrl && <Image src={qrCodeUrl} alt="Código QR ampliado" width={300} height={300} className="w-full h-auto mix-blend-multiply" />}
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-4">Escanea este código en recepción</p>
                </div>
              </div>
            )}

            {/* Resumen financiero y acciones relacionadas */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-5 bg-gray-50 dark:bg-[#050505]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4" strokeWidth={1.5} /> Pago
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total</span>
                  <span className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: appointment.currency || 'MXN' }).format(appointment.totalPrice || 0)}
                  </span>
                </div>

                {appointment.paymentStatus === 'SETTLED' ? (
                  <Button 
                    onClick={downloadInvoice} 
                    disabled={isDownloading}
                    className="w-full rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a] h-10 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-4"
                    aria-label="Descargar factura"
                  >
                    Descargar factura
                    {isDownloading ? <QhSpinner size="sm" /> : <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  </Button>
                ) : appointment.status !== 'PENDING_PAYMENT' ? null : (
                  <div className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                      Pendiente de pago
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje al especialista */}
            {(appointment.status === 'SCHEDULED' || appointment.status === 'COMPLETED') && appointment.paymentStatus === 'SETTLED' && (
              <Button 
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="w-full rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 disabled:opacity-50"
                aria-label="Enviar mensaje al especialista"
              >
                Enviar mensaje
                {isStartingChat ? <QhSpinner size="sm" /> : <MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
              </Button>
            )}

            {/* Acciones secundarias (reprogramar, cancelar) */}
            {appointment.status === 'SCHEDULED' && (
              <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 pt-5">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className="w-full rounded-none border border-gray-300 dark:border-gray-700 text-gray-600 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white h-10 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-5"
                  aria-label="Cambiar fecha u hora de la cita"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Cambiar fecha/hora
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 h-10 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-5"
                  aria-label="Cancelar cita"
                >
                  <XCircle className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Cancelar cita
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {appointment && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          appointment={appointment}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}