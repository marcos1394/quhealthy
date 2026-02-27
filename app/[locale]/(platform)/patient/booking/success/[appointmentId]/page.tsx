/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// 🚀 FIX: Importamos el Hook personalizado que acabamos de crear
import { useAppointmentDetails } from '@/hooks/useAppointmentDetails';

// Icons
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

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extraemos el ID y nos aseguramos que sea un string válido para el hook
  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  // 🚀 FIX: Usamos el Custom Hook en lugar de hacer las llamadas manuales con axios aquí
  const { 
    appointment, 
    isLoading, 
    error, 
    isDownloading, 
    downloadInvoice,
    qrCodeUrl // 📱 NUEVO: Extraemos el QR del Hook
  } = useAppointmentDetails(appointmentId);

  // Estados locales solo para efectos visuales
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  // Efecto para apagar el confeti después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Manejo de redirección si hay un error al cargar la cita (ej. ID inválido)
  useEffect(() => {
    if (error) {
      toast.error("No se pudo cargar la confirmación de la cita.");
      // Opcional: router.replace('/patient/dashboard');
    }
  }, [error, router]);

  // Funciones de utilidad para la UI (Compartir y Calendario)
  const generateShareText = () => {
    if (!appointment) return '';
    const dateStr = formatInTimeZone(
      new Date(appointment.startTime), 
      'UTC', 
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", 
      { locale: es }
    );
    // Usamos los campos correctos del DTO (con fallback por seguridad)
    const serviceName = appointment.serviceNameSnapshot || appointment.serviceName || 'Servicio Médico';
    const providerName = appointment.providerNameSnapshot || 'Especialista';
    
    return `🎉 ¡Cita confirmada en QuHealthy!\n\nServicio: ${serviceName}\nProfesional: ${providerName}\nFecha: ${dateStr}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: '¡Cita Confirmada en QuHealthy!',
      text: generateShareText(),
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("¡Compartido exitosamente!");
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Detalles copiados al portapapeles");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  const handleAddToCalendar = () => {
    if (!appointment) return;
    
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(startDate.getTime() + (appointment.durationMinutes || 60) * 60000);
    
    // Determinamos la ubicación basándonos en el Enum de tu backend
    const location = appointment.type === 'ONLINE' 
      ? appointment.meetLink || 'Videollamada' 
      : appointment.locationAddress || 'Consultorio';
      
    const serviceName = appointment.serviceNameSnapshot || appointment.serviceName || 'Cita';
    const providerName = appointment.providerNameSnapshot || 'Especialista';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cita con ${providerName}`)}&location=${encodeURIComponent(location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Pantalla de Carga
  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Confirmando tu cita...</p>
      </div>
    );
  }

  // Pre-formateo de la fecha (usando el startTime que viene del backend)
  const formattedDateTime = formatInTimeZone(
    new Date(appointment.startTime), 
    'UTC', 
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", 
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pb-32">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Confetti Animation */}
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
                    i % 3 === 1 ? "text-purple-400" : "",
                    i % 3 === 2 ? "text-pink-400" : "text-gray-400"
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
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl overflow-hidden mb-8">
            <CardContent className="p-8 sm:p-10 text-center">
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30 mb-8 relative"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 animate-pulse" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                  ¡Cita Confirmada!
                </h1>
                <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
                  Tu reservación ha sido procesada con éxito y el profesional ha sido notificado.
                </p>

                {appointment.consumerEmailSnapshot && (
                  <div className="inline-flex items-center gap-2 bg-gray-950 text-gray-400 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-800">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Recibo enviado a <span className="text-white">{appointment.consumerEmailSnapshot}</span>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>

          {/* 📱 NUEVO: Tarjeta de Pase de Abordar (Código QR) */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl mb-8">
            <CardContent className="p-6 sm:p-8 flex flex-col items-center">
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                Pase de Abordar
              </h2>
              <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
                Muestra este código en la recepción al llegar a tu cita para un check-in rápido.
              </p>
              
              <div className="bg-white p-4 rounded-2xl w-48 h-48 flex items-center justify-center border-4 border-gray-800 shadow-inner">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Código QR de Check-in" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-xs text-gray-500 font-semibold">Generando...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Resumen de la Cita</h2>
          </div>

          {/* Details Card */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Profesional */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Especialista</p>
                    <p className="font-bold text-white text-lg">
                      {appointment.providerNameSnapshot || 'Médico Asignado'}
                    </p>
                    {appointment.providerPhoneSnapshot && (
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {appointment.providerPhoneSnapshot}
                      </p>
                    )}
                  </div>
                </div>

                {/* Servicio */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="p-3 bg-pink-500/10 rounded-xl">
                    <CalendarCheck className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Servicio</p>
                    <p className="font-bold text-white text-lg">
                      {appointment.serviceNameSnapshot || appointment.serviceName}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {appointment.durationMinutes ? `${appointment.durationMinutes} min` : 'Estándar'} 
                      <span className="mx-1">•</span> 
                      {appointment.type === 'ONLINE' ? 'En línea' : 'Presencial'}
                    </p>
                  </div>
                </div>

                {/* Fecha y Hora */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha y Hora</p>
                    <p className="font-bold text-white text-lg capitalize">{formattedDateTime}</p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ubicación</p>
                    <p className="font-bold text-white text-base leading-tight mt-1">
                      {appointment.type === 'ONLINE' ? 'Enlace de videollamada por correo' : (appointment.locationAddress || 'Por confirmar')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Banner */}
              <div className="mt-6 flex items-start gap-4 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="p-3 bg-purple-500/20 rounded-xl relative z-10">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 relative z-10">
                  <p className="text-xs font-bold text-purple-300/70 uppercase tracking-wider mb-1">Total Pagado</p>
                  <p className="font-black text-3xl text-white">
                    ${(appointment.totalPrice || appointment.price || 0).toLocaleString('es-MX')} 
                    <span className="text-lg text-purple-400 font-bold ml-1">
                      {appointment.currency || 'MXN'}
                    </span>
                  </p>
                </div>
                <Badge className="bg-gray-900 text-emerald-400 border-emerald-500/30 hidden sm:flex items-center mt-2 relative z-10">
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
              className="border-gray-800 bg-gray-900 hover:bg-gray-800 h-auto flex-col gap-2 py-4 rounded-2xl text-gray-300 hover:text-white"
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold">Calendario</span>
            </Button>

            <Button
              onClick={downloadInvoice}
              variant="outline"
              disabled={isDownloading}
              className="border-gray-800 bg-gray-900 hover:bg-gray-800 h-auto flex-col gap-2 py-4 rounded-2xl text-gray-300 hover:text-white"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              ) : (
                <Download className="w-5 h-5 text-purple-400" />
              )}
              <span className="text-xs font-semibold">Recibo PDF</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-800 bg-gray-900 hover:bg-gray-800 h-auto flex-col gap-2 py-4 rounded-2xl text-gray-300 hover:text-white"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Share className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-xs font-semibold">Compartir</span>
            </Button>

            <Button
              onClick={() => toast.info("Recordatorio configurado")}
              variant="outline"
              className="border-gray-800 bg-gray-900 hover:bg-gray-800 h-auto flex-col gap-2 py-4 rounded-2xl text-gray-300 hover:text-white"
            >
              <Bell className="w-5 h-5 text-pink-400" />
              <span className="text-xs font-semibold">Recordatorio</span>
            </Button>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/patient/appointments')}
              className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-purple-500/20"
            >
              Ver Mis Citas
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => router.push('/patient/dashboard')}
              variant="outline"
              className="flex-1 h-14 border-gray-800 bg-gray-900 hover:bg-gray-800 text-white text-base font-bold rounded-2xl"
            >
              <Home className="w-5 h-5 mr-2 text-gray-400" />
              Dashboard
            </Button>
          </div>

          {/* Security Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
            <Shield className="w-4 h-4 text-emerald-500/70" />
            <span>Pago procesado de forma segura</span>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}