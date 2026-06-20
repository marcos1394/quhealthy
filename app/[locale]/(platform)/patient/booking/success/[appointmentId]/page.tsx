"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AlertCircle, ArrowLeft } from 'lucide-react'; 

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
        console.warn("ALERTA: Intento de vulneración de acceso a registro ajeno.");
        toast.error("ACCESO DENEGADO: Credenciales insuficientes para consultar este expediente.");
        router.push('/patient/dashboard');
      }
    }
  }, [appointment, user, router]);

  const generateShareText = () => {
    if (!appointment) return '';
    const dateStr = format(
      new Date(appointment.startTime), 
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", 
      { locale: es }
    ).toUpperCase();
    return t('share_text', { 
      service: appointment.serviceNameSnapshot || appointment.serviceName || 'PROCEDIMIENTO CLÍNICO', 
      provider: appointment.providerNameSnapshot || 'ESPECIALISTA ASIGNADO', 
      date: dateStr 
    });
  };

  const handleShare = async () => {
    try {
      const text = generateShareText();
      if (navigator.share) {
        await navigator.share({
          title: 'Confirmación de Cita',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("DATOS COPIADOS AL PORTAPAPELES.");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log('Error compartiendo', error);
    }
  };

  const handleAddToCalendar = () => {
    toast.info("FUNCIÓN DE SINCRONIZACIÓN CALENDAR INACTIVA EN ENTORNO DE DESARROLLO.");
  };

  // ==========================================
  // 🚦 CONTROL DE FLUJO Y ESTADOS
  // ==========================================

  // 1. Estado de Carga Blueprint
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          {t('loading', { defaultValue: 'RECUPERANDO DOCUMENTO OFICIAL...' })}
        </p>
      </div>
    );
  }

  // 2. Estado de Error Arquitectónico
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">Registro Inexistente</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8">
          No ha sido posible localizar los parámetros de esta transacción en la base de datos central.
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard")} 
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={1.5} />
          Retornar al Panel General
        </Button>
      </div>
    );
  }

  // 3. Estado de Redirección por Seguridad
  if (user && appointment.consumerId !== user.id) {
    return <div className="min-h-screen bg-white dark:bg-[#0a0a0a]"></div>;
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (ÉXITO)
  // ==========================================
  
  const formattedDateTime = format(
    new Date(appointment.startTime),
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", 
    { locale: es }
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white relative overflow-hidden py-12 px-6 sm:px-12 lg:px-24 pb-32 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
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