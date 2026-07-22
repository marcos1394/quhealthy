"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/js-hoist-intl */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Stethoscope,
  Receipt,
  AlertCircle,
  FileText,
  CreditCard,
  MessageSquare,
  RotateCcw,
  XCircle,
  QrCode,
} from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

import { useAppointmentDetails } from "@/hooks/useAppointmentDetails";
import { paymentService } from "@/services/payment.service";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/lib/handleApiError";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RescheduleModal } from "@/components/dashboard/RescheduleModal";

export default function PatientAppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  // Hook maestro
  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl,
    cancelAppointment,
  } = useAppointmentDetails(appointmentId);

  const handlePayNow = async () => {
    if (!appointment) return;
    try {
      setIsProcessingPayment(true);
      const checkoutUrl = await paymentService.createCheckoutSession(
        appointment.id,
      );
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
      await chatService.startConversation(
        appointment.consumerId,
        appointment.providerId,
      );
      router.push("/patient/dashboard/messages");
    } catch (error) {
      toast.error("Fallo de comunicación encriptada.");
      handleApiError(error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.",
      )
    )
      return;

    // El hook internamente mostrará los toast de éxito/error y actualizará el estado
    await cancelAppointment("Cancelado por el paciente desde detalles de cita");
  };

  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400 mt-6 animate-pulse">
          Cargando detalles de tu cita...
        </p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-6">
          <AlertCircle
            className="w-7 h-7 text-rose-600 dark:text-rose-400"
            strokeWidth={2}
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Cita no encontrada
        </h2>
        <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto mb-8">
          El registro solicitado no existe o carece de permisos de
          visualización.
        </p>
        <Button
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-sm font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} /> Retornar al
          Directorio
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ FORMATEO DE DATOS
  // ==========================================

  const isOnline =
    appointment.type === "ONLINE" || appointment.appointmentType === "ONLINE";
  const canJoinVideo =
    isOnline &&
    (appointment.status === "SCHEDULED" ||
      appointment.status === "IN_PROGRESS");
  const dateFormatted = format(new Date(appointment.startTime), "dd MMM yyyy", {
    locale: es,
  });
  const timeFormatted = format(new Date(appointment.startTime), "HH:mm", {
    locale: es,
  });

  const statusColorMap: Record<string, string> = {
    PENDING_PAYMENT:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0",
    SCHEDULED:
      "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-0",
    COMPLETED:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-0",
    CANCELLED:
      "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-0",
  };

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: "Pago Pendiente",
    SCHEDULED: "Confirmada",
    COMPLETED: "Finalizada",
    CANCELLED: "Anulada",
  };

  const badgeClass =
    statusColorMap[appointment.status] || "border-gray-300 text-gray-500";
  const statusLabel = statusLabels[appointment.status] || appointment.status;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/patient/dashboard/appointments")}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300 transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                  Folio: #{appointment.id}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    badgeClass,
                  )}
                >
                  {statusLabel}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Detalles de la Cita
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* --- COLUMNA IZQUIERDA: DETALLES PRINCIPALES --- */}
          <div className="flex-1 space-y-12">
            {/* Bloque: Fecha y Hora */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-[#111]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" strokeWidth={2} />
                  Fecha y Horario
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
                <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-teal-50 dark:bg-teal-900/20">
                    <Calendar
                      className="w-6 h-6 text-teal-600 dark:text-teal-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Fecha Acordada
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight capitalize">
                      {dateFormatted}
                    </p>
                  </div>
                </div>
                <div className="p-8 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20">
                    <Clock
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Horario
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {timeFormatted} HRS{" "}
                      <span className="text-sm font-medium text-gray-400 ml-1">
                        ({appointment.durationMinutes} min)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque: Datos del Especialista y Servicio */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-[#111]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  Información de la Consulta
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <span className="text-xl font-bold text-gray-500">
                      {(appointment.providerNameSnapshot || "E").charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center text-center sm:text-left h-16">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Especialista Asignado
                    </p>
                    <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {appointment.providerNameSnapshot ||
                        "Especialista General"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Stethoscope
                      className="w-4 h-4 text-teal-500"
                      strokeWidth={2}
                    />{" "}
                    Servicio Programado
                  </p>
                  <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {appointment.serviceNameSnapshot ||
                      appointment.serviceName ||
                      "Consulta Integral"}
                  </p>
                </div>

                {appointment.consumerSymptoms && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                    <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <FileText
                        className="w-4 h-4 text-amber-500"
                        strokeWidth={2}
                      />{" "}
                      Observaciones del Paciente
                    </p>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 p-5 text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{appointment.consumerSymptoms}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bloque: Ubicación / Conexión */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-[#111]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4 text-emerald-500"
                    strokeWidth={2}
                  />
                  Ubicación y Modalidad
                </h3>
              </div>
              <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                    isOnline
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {isOnline ? (
                    <Video className="w-6 h-6" strokeWidth={2} />
                  ) : (
                    <MapPin className="w-6 h-6" strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Modalidad:{" "}
                    <span className="font-bold">
                      {isOnline ? "Telemedicina" : "Atención Presencial"}
                    </span>
                  </p>

                  {isOnline ? (
                    <div className="space-y-3 mt-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        El enlace cifrado para la transmisión se activará
                        minutos antes de su consulta.
                      </p>
                      {appointment.meetLink ? (
                        <a
                          href={appointment.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-sm transition-all"
                        >
                          <Video className="w-4 h-4 mr-2" strokeWidth={2} />{" "}
                          Iniciar Transmisión
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" strokeWidth={2} /> Enlace
                          en generación
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-relaxed mt-2">
                      {appointment.locationAddress ||
                        "Dirección no especificada. Contacte al proveedor."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: ACCIONES Y QR --- */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-8">
            {/* Bloque: Check-In QR */}
            {appointment.status === "SCHEDULED" && qrCodeUrl && (
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="mb-4 w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <QrCode className="w-8 h-8" strokeWidth={2} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Identificación QR
                </h4>
                <p className="text-xs font-medium text-gray-500 mb-6">
                  Escanear en Módulo de Recepción
                </p>
                <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                  <Image
                    src={qrCodeUrl}
                    alt="Código QR Check-in"
                    width={180}
                    height={180}
                    className="w-full h-full mix-blend-multiply"
                  />
                </div>
              </div>
            )}

            {/* Bloque: Finanzas y Recibos */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-500" strokeWidth={2} />
                  Resumen Financiero
                </h3>
              </div>
              <div className="p-6 md:p-8 space-y-8">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-500 mb-1">
                    Importe Final
                  </span>
                  <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: appointment.currency || "MXN",
                    }).format(appointment.totalPrice || 0)}
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  {appointment.paymentStatus === "SETTLED" ? (
                    <Button
                      onClick={downloadInvoice}
                      disabled={isDownloading}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-12 text-sm font-semibold transition-all shadow-sm flex items-center justify-between px-6"
                      variant="outline"
                    >
                      Descargar Factura
                      {isDownloading ? (
                        <QhSpinner size="sm" />
                      ) : (
                        <FileText className="w-4 h-4" strokeWidth={2} />
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-r-xl">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500">
                          Estado: Requiere Liquidación
                        </p>
                      </div>
                      <Button
                        onClick={handlePayNow}
                        disabled={isProcessingPayment}
                        className="w-full rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-sm font-semibold transition-all shadow-sm flex items-center justify-between px-6 disabled:opacity-50"
                      >
                        Pagar Ahora
                        {isProcessingPayment ? (
                          <QhSpinner size="sm" />
                        ) : (
                          <CreditCard className="w-4 h-4" strokeWidth={2} />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comandos de Acción */}
            <div className="space-y-3">
              {canJoinVideo && (
                <Button
                  onClick={() =>
                    appointment.meetLink
                      ? window.open(appointment.meetLink, "_blank")
                      : router.push(`/patient/video-call/${appointment.id}`)
                  }
                  className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-14 text-sm font-semibold transition-all shadow-sm flex items-center justify-between px-6"
                >
                  Unirse a Video Consulta
                  <Video className="w-4 h-4" strokeWidth={2} />
                </Button>
              )}

              {(appointment.status === "SCHEDULED" ||
                appointment.status === "COMPLETED") &&
                appointment.paymentStatus === "SETTLED" && (
                  <Button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] h-14 text-sm font-semibold transition-all shadow-sm flex items-center justify-between px-6 disabled:opacity-50"
                    variant="outline"
                  >
                    Contactar al Especialista
                    {isStartingChat ? (
                      <QhSpinner size="sm" />
                    ) : (
                      <MessageSquare
                        className="w-4 h-4 text-indigo-500"
                        strokeWidth={2}
                      />
                    )}
                  </Button>
                )}

              {appointment.status === "SCHEDULED" && (
                <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-14 text-sm font-semibold transition-all shadow-sm flex justify-start px-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-3" strokeWidth={2} />{" "}
                    Reprogramar Cita
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 h-14 text-sm font-semibold transition-all shadow-sm flex justify-start px-6"
                    onClick={handleCancelAppointment}
                  >
                    <XCircle className="w-4 h-4 mr-3" strokeWidth={2} />{" "}
                    Cancelar Cita
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {appointment && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          appointment={appointment}
          onSuccess={() => {
            // Recargar la página o volver a la lista para ver el cambio reflejado
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
