// Ubicación: src/app/patient/booking/success/[appointmentId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Home } from 'lucide-react'; // 🚀 Añadido para la pantalla de error

import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';
import { useSessionStore } from '@/stores/SessionStore'; 
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';

// Componentes modulares
import { BackgroundEffects, Confetti } from '@/components/booking/success/SuccessEffects';
import { SuccessHeader } from '@/components/booking/success/SuccessHeader';
import { QrCodeCard } from '@/components/booking/success/QrCodeCard';
import { AppointmentSummary } from '@/components/booking/success/AppointmentSummary';
import { ActionButtons } from '@/components/booking/success/ActionButtons';

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('PatientBookingSuccess');
  const { user } = useSessionStore(); 

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl
  } = useAppointmentDetails(appointmentId);

  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 🛡️ FIX FU-005: VERIFICACIÓN DE PROPIEDAD
  useEffect(() => {
    if (appointment && user) {
      if (appointment.consumerId !== user.id) {
        console.warn("Intento de acceso a una cita ajena.");
        toast.error("No tienes permisos para ver esta reserva.");
        router.push('/patient/dashboard');
      }
    }
  }, [appointment, user, router]);

  const generateShareText = () => {
    if (!appointment) return '';
    
    // Simplemente leemos la fecha tal cual viene del backend
    const dateStr = format(
      new Date(appointment.startTime), 
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", 
      { locale: es }
    );
    return t('share_text', { 
      service: appointment.serviceNameSnapshot || appointment.serviceName || 'Servicio Médico', 
      provider: appointment.providerNameSnapshot || 'Especialista', 
      date: dateStr 
    });
  };

  const handleShare = async () => { /* ... lógica de compartir (se mantiene igual) ... */ };
  const handleAddToCalendar = () => { /* ... lógica de calendario (se mantiene igual) ... */ };

  // ==========================================
  // 🚦 CONTROL DE FLUJO Y ESTADOS (FIX FU-005)
  // ==========================================

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="text-slate-500 mt-4 font-medium">{t('loading')}</p>
      </div>
    );
  }

  // 2. Estado de Error Amigable (Criterio de Aceptación #3 de FU-005)
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-full mb-6">
          <Home className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No encontramos tu cita</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
          No pudimos localizar los detalles de esta reserva o el enlace no es válido.
        </p>
        <Button onClick={() => router.push("/patient/dashboard")} className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
          Ir al Dashboard
        </Button>
      </div>
    );
  }

  // 3. Estado de Redirección por Seguridad (Si no es el dueño, se queda en blanco mientras redirige)
  if (user && appointment.consumerId !== user.id) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"></div>;
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (ÉXITO)
  // ==========================================
  
  // Leemos y formateamos la hora local tal como la mandó la base de datos
  const formattedDateTime = format(
    new Date(appointment.startTime),
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", 
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans selection:bg-medical-500/30">
      <BackgroundEffects />
      <Confetti show={showConfetti} />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <SuccessHeader t={t} email={appointment.consumerEmailSnapshot} />
          <QrCodeCard t={t} qrCodeUrl={qrCodeUrl} />
          <AppointmentSummary t={t} appointment={appointment} formattedDateTime={formattedDateTime} />
          
          <ActionButtons 
            t={t} 
            router={router}
            copied={copied}
            isDownloading={isDownloading}
            handleAddToCalendar={handleAddToCalendar}
            downloadInvoice={downloadInvoice}
            handleShare={handleShare}
          />
          
        </motion.div>
      </div>
    </div>
  );
}