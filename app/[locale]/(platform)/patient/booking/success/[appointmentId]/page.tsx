/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';

import {
  CheckCircle2,
  Calendar,
  User,
  DollarSign,
  Loader2,
  Share,
  Download,
  Check,
  Sparkles,
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Bell,
  Shield,
  Home,
  FileText,
  CalendarCheck,
  QrCode
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('PatientBookingSuccess');

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

  useEffect(() => {
    if (error) {
      return;
    }
  }, [error, router, t]);

  const generateShareText = () => {
    if (!appointment) return '';
    const dateStr = formatInTimeZone(
      new Date(appointment.startTime),
      'UTC',
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'",
      { locale: es }
    );
    const serviceName = appointment.serviceNameSnapshot || appointment.serviceName || 'Servicio Médico';
    const providerName = appointment.providerNameSnapshot || 'Especialista';

    return t('share_text', { service: serviceName, provider: providerName, date: dateStr });
  };

  const handleShare = async () => {
    const shareData = {
      title: t('title'),
      text: generateShareText(),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleAddToCalendar = () => {
    if (!appointment) return;

    const startDate = new Date(appointment.startTime);
    const endDate = new Date(startDate.getTime() + (appointment.durationMinutes || 60) * 60000);
    const location = appointment.type === 'ONLINE'
      ? appointment.meetLink || 'Videollamada'
      : appointment.locationAddress || 'Consultorio';
    const serviceName = appointment.serviceNameSnapshot || appointment.serviceName || 'Cita';
    const providerName = appointment.providerNameSnapshot || 'Especialista';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cita con ${providerName}`)}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loading')}</p>
      </div>
    );
  }

  const formattedDateTime = formatInTimeZone(
    new Date(appointment.startTime),
    'UTC',
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'",
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans selection:bg-medical-500/30">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-medical-500/10 dark:bg-medical-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ top: '-10%', left: `${Math.random() * 100}%`, rotate: 0 }}
                animate={{ top: '110%', rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
                transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, ease: "linear" }}
                className="absolute"
              >
                <Sparkles
                  className={cn(
                    "w-6 h-6",
                    i % 3 === 0 ? "text-emerald-400" : "",
                    i % 3 === 1 ? "text-medical-400" : "",
                    i % 3 === 2 ? "text-pink-400" : "text-slate-400"
                  )}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Main Success Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <CardContent className="p-8 sm:p-10 text-center">

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto w-24 h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-500/30 mb-8 relative"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 animate-pulse" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  {t('title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-6 max-w-md mx-auto">
                  {t('subtitle')}
                </p>

                {appointment.consumerEmailSnapshot && (
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700">
                    <Mail className="w-4 h-4 text-medical-500" />
                    Recibo enviado a <span className="text-slate-900 dark:text-white">{appointment.consumerEmailSnapshot}</span>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <CardContent className="p-6 sm:p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                {t('qr_label')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center max-w-sm">
                {t('tip_arrive')}
              </p>

              <div className="bg-white p-4 rounded-2xl w-48 h-48 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-inner">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt={t('qr_label')}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <QhSpinner size="md" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center border-2 border-medical-200 dark:border-medical-500/30">
              <FileText className="w-5 h-5 text-medical-600 dark:text-medical-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('cart_summary') || 'Resumen'}</h2>
          </div>

          {/* Details Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Provider */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_provider')}</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {appointment.providerNameSnapshot || 'Médico Asignado'}
                    </p>
                    {appointment.providerPhoneSnapshot && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {appointment.providerPhoneSnapshot}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl">
                    <CalendarCheck className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_service')}</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {appointment.serviceNameSnapshot || appointment.serviceName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {appointment.durationMinutes ? `${appointment.durationMinutes} min` : 'Estándar'}
                      <span className="mx-1">•</span>
                      {appointment.type === 'ONLINE' ? 'En línea' : 'Presencial'}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_date')}</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg capitalize">{formattedDateTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_location')}</p>
                    <p className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-1">
                      {appointment.type === 'ONLINE' ? 'Enlace por correo' : (appointment.locationAddress || 'Por confirmar')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Banner */}
              <div className="mt-6 flex items-start gap-4 p-5 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-200 dark:border-medical-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-medical-200/30 dark:bg-medical-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-xl relative z-10">
                  <DollarSign className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                </div>
                <div className="flex-1 relative z-10">
                  <p className="text-xs font-bold text-medical-500/70 dark:text-medical-300/70 uppercase tracking-wider mb-1">{t('label_price')}</p>
                  <p className="font-bold text-3xl text-slate-900 dark:text-white">
                    ${(appointment.totalPrice || appointment.price || 0).toLocaleString('es-MX')}
                    <span className="text-lg text-medical-600 dark:text-medical-400 font-bold ml-1">
                      {appointment.currency || 'MXN'}
                    </span>
                  </p>
                </div>
                <Badge className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hidden sm:flex items-center mt-2 relative z-10">
                  <Check className="w-3 h-3 mr-1" /> Completado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Button
              onClick={handleAddToCalendar}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{t('btn_calendar')}</span>
            </Button>

            <Button
              onClick={downloadInvoice}
              variant="outline"
              disabled={isDownloading}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin text-medical-500" />
              ) : (
                <Download className="w-5 h-5 text-medical-500" />
              )}
              <span className="text-xs font-semibold">PDF</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Share className="w-5 h-5 text-blue-500" />
              )}
              <span className="text-xs font-semibold">{t('btn_share')}</span>
            </Button>

            <Button
              onClick={() => toast.info("Recordatorio configurado")}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <Bell className="w-5 h-5 text-pink-500" />
              <span className="text-xs font-semibold">Reminder</span>
            </Button>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/patient/appointments')}
              className="flex-1 h-14 bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 text-white text-base font-bold rounded-2xl shadow-lg"
            >
              {t('btn_appointments')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => router.push('/patient/dashboard')}
              variant="outline"
              className="flex-1 h-14 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-base font-bold rounded-2xl"
            >
              <Home className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
              {t('btn_home')}
            </Button>
          </div>

          {/* Security Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-emerald-500/70" />
            <span>Pago procesado de forma segura</span>
          </div>

        </motion.div>
      </div>
    </div>
  );
}