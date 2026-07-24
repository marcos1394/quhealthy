"use client";
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { useAppointmentDetails } from "@/hooks/useAppointmentDetails";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

// Componentes modulares
import {
  BackgroundEffects,
  Confetti,
} from "@/components/booking/success/SuccessEffects";
import { SuccessHeader } from "@/components/booking/success/SuccessHeader";
import { QrCodeCard } from "@/components/booking/success/QrCodeCard";
import { AppointmentSummary } from "@/components/booking/success/AppointmentSummary";
import { ActionButtons } from "@/components/booking/success/ActionButtons";
import { downloadICS } from "@/lib/calendar-utils";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("PatientBookingSuccess");
  const { user } = useSessionStore();

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl,
  } = useAppointmentDetails(appointmentId);

  // Mantenemos los estados aunque desactivamos las animaciones visuales en los subcomponentes
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 🛡️ VERIFICACIÓN DE PROPIEDAD
  useEffect(() => {
    if (appointment && user) {
      if (appointment.consumerId !== user.id) {
        console.warn(
          "Acceso restringido: No tienes permisos para ver esta cita.",
        );
        toast.error(
          "Acceso restringido: No tienes permisos para ver esta cita.",
        );
        router.push("/patient/dashboard");
      }
    }
  }, [appointment, user, router]);

  const generateShareText = () => {
    if (!appointment) return "";
    const dateStr = format(
      new Date(appointment.startTime),
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'",
      { locale: es },
    ).toUpperCase();

    const serviceName =
      appointment.serviceNameSnapshot ||
      appointment.serviceName ||
      "PROCEDIMIENTO CLÍNICO";
    const providerName =
      appointment.providerNameSnapshot || "ESPECIALISTA ASIGNADO";
    const portalUrl = `${window.location.origin}/patient/dashboard/appointments/${appointmentId}`;

    return `QuHealthy - Confirmación de Cita\n\nDetalles:\nServicio: ${serviceName}\nEspecialista: ${providerName}\nFecha: ${dateStr}\nModalidad: ${appointment.appointmentType === "ONLINE" ? "Teleconsulta" : "Presencial"}\n\nIngresa al portal para ver más detalles: ${portalUrl}`;
  };

  const handleShare = async () => {
    try {
      const text = generateShareText();
      if (navigator.share) {
        await navigator.share({
          title: "Confirmación de Cita",
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Detalles copiados para compartir");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log("Error compartiendo", error);
    }
  };

  const handleAddToCalendar = () => {
    if (appointment) {
      downloadICS(appointment);
      toast.success("Archivo de calendario descargado");
    }
  };

  const handleEnableAlert = async () => {
    try {
      if (!appointment) return;
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Notificaciones del navegador activadas");
        }
      }

      // Llamada al backend para activar recordatorios (SMS/Correo/WhatsApp)
      const axios = (await import("@/lib/axios")).default;
      await axios.post(`/api/appointments/${appointmentId}/reminders/enable`);
      toast.success("Recordatorios (SMS/Correo) activados exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al activar recordatorios");
    }
  };

  // ==========================================
  // 🚦 CONTROL DE FLUJO Y ESTADOS
  // ==========================================

  // 1. Estado de Carga Blueprint
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading", {
            defaultValue: "Cargando confirmación de tu cita...",
          })}
        </p>
      </div>
    );
  }

  // 2. Estado de Error Arquitectónico
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Cita no encontrada
        </h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          El registro solicitado no existe o no tienes permisos para
          visualizarlo.
        </p>
        <Button
          onClick={() => router.push("/patient/dashboard")}
          className="rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 h-12 px-8 text-sm font-bold border-0 transition-colors shadow-md shadow-emerald-900/20"
        >
          <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} />
          Volver al Panel Principal
        </Button>
      </div>
    );
  }

  // 3. Estado de Redirección por Seguridad
  if (user && appointment.consumerId !== user.id) {
    return <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505]"></div>;
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (ÉXITO)
  // ==========================================

  const formattedDateTime = format(
    new Date(appointment.startTime),
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'",
    { locale: es },
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white relative overflow-hidden py-12 px-6 sm:px-12 lg:px-24 pb-32 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-300">
      {/* Background técnico de puntos sutiles */}
      <BackgroundEffects />
      <Confetti show={showConfetti} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <SuccessHeader t={t} email={appointment.consumerEmailSnapshot} />
          <QrCodeCard t={t} qrCodeUrl={qrCodeUrl} />
          <AppointmentSummary
            t={t}
            appointment={appointment}
            formattedDateTime={formattedDateTime}
          />

          <ActionButtons
            t={t}
            router={router}
            copied={copied}
            isDownloading={isDownloading}
            handleAddToCalendar={handleAddToCalendar}
            downloadInvoice={downloadInvoice}
            handleShare={handleShare}
            handleEnableAlert={handleEnableAlert}
          />
        </motion.div>
      </div>
    </div>
  );
}
