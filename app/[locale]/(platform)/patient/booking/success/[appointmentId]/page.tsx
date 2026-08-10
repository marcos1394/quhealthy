"use client";
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Script from "next/script";

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
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;
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
        toast.error(t("restricted_access"));
        router.push("/patient/dashboard");
      }
    }
  }, [appointment, user, router, t]);

  const generateShareText = () => {
    if (!appointment) return "";
    
    const dateStr = format(
      new Date(appointment.startTime),
      locale === "en"
        ? "eeee, MMMM d 'at' HH:mm 'hrs'"
        : "eeee d 'de' MMMM 'a las' HH:mm 'hrs'",
      { locale: dateLocale }
    ).toUpperCase();

    const serviceName =
      appointment.serviceNameSnapshot ||
      appointment.serviceName ||
      t("default_service");
    const providerName =
      appointment.providerNameSnapshot || t("default_provider");
    const modality =
      appointment.appointmentType === "ONLINE"
        ? t("modality_teleconsultation")
        : t("modality_in_person");
    const portalUrl = `${window.location.origin}/patient/dashboard/appointments/${appointmentId}`;

    return t("share_full_details", {
      service: serviceName,
      provider: providerName,
      date: dateStr,
      modality: modality,
      url: portalUrl,
    });
  };

  const handleShare = async () => {
    try {
      const text = generateShareText();
      const portalUrl = `${window.location.origin}/patient/dashboard/appointments/${appointmentId}`;
      if (navigator.share) {
        await navigator.share({
          title: t("share_title"),
          text: text,
          url: portalUrl,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(t("copied_toast"));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error compartiendo", err);
    }
  };

  const handleAddToCalendar = () => {
    if (appointment) {
      downloadICS(appointment);
      toast.success(t("calendar_toast"));
    }
  };

  const handleEnableAlert = async () => {
    try {
      if (!appointment) return;
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success(t("browser_notifications_toast"));
        }
      }

      // Llamada al backend para activar recordatorios (SMS/Correo/WhatsApp)
      const axios = (await import("@/lib/axios")).default;
      await axios.post(`/api/appointments/${appointmentId}/reminders/enable`);
      toast.success(t("reminders_enabled_toast"));
    } catch (err) {
      console.error(err);
      toast.error(t("reminders_error_toast"));
    }
  };

  // ==========================================
  // 🚦 CONTROL DE FLUJO Y ESTADOS
  // ==========================================

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // 2. Estado de Error
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("not_found_title")}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
          {t("not_found_desc")}
        </p>
        <Button
          onClick={() => router.push("/patient/dashboard")}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_dashboard")}</span>
        </Button>
      </div>
    );
  }

  // 3. Estado de Redirección por Seguridad
  if (user && appointment.consumerId !== user.id) {
    return <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505]" />;
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (ÉXITO)
  // ==========================================

  const formattedDateTime = format(
    new Date(appointment.startTime),
    locale === "en"
      ? "eeee, MMMM d 'at' HH:mm 'hrs'"
      : "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'",
    { locale: dateLocale }
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white relative overflow-hidden py-12 px-6 sm:px-12 lg:px-24 pb-32 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      {appointment && (
        <>
          <Script id="gcr-init" strategy="afterInteractive">
            {`
              window.renderOptIn = function() {
                window.gapi.load('surveyoptin', function() {
                  window.gapi.surveyoptin.render({
                    "merchant_id": 5836869157,
                    "order_id": "${appointmentId}",
                    "email": "${appointment.consumerEmailSnapshot || ''}",
                    "delivery_country": "MX",
                    "estimated_delivery_date": "${new Date(appointment.startTime).toISOString().split('T')[0]}"
                  });
                });
              }
            `}
          </Script>
          <Script src="https://apis.google.com/js/platform.js?onload=renderOptIn" strategy="afterInteractive" />
        </>
      )}

      {/* Background técnico de puntos sutiles */}
      <BackgroundEffects />
      <Confetti show={showConfetti} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
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