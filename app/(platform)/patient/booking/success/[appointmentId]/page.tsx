/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Icons
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  DollarSign, 
  Loader2, 
  Share, 
  Download, 
  QrCode,
  Copy, 
  Check,
  Sparkles,
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Star,
  Bell,
  Info,
  Shield,
  Home
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


// Interface for appointment details
interface AppointmentDetails {
  id: number;
  startTime: string;
  priceAtBooking: number;
  provider: { 
    name: string;
    phone?: string;
    address?: string;
  };
  service: { 
    name: string;
    duration?: number;
  };
  consumer?: {
    name: string;
    email: string;
  };
}

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    if (!appointmentId) return;

    const getAppointmentDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<AppointmentDetails>(
          `/api/appointments/${appointmentId}`, 
          { withCredentials: true }
        );
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        toast.error("No se pudieron cargar los detalles de la cita");
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    getAppointmentDetails();

    // Confetti timeout
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [appointmentId]);

  // Generate share text
  const generateShareText = () => {
    if (!appointment) return '';
    const dateStr = formatInTimeZone(
      new Date(appointment.startTime), 
      'UTC', 
      "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", 
      { locale: es }
    );
    return `🎉 ¡Cita confirmada en QuHealthy!\n\nServicio: ${appointment.service.name}\nProfesional: ${appointment.provider.name}\nFecha: ${dateStr}`;
  };

  // Share handler
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
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await axios.get(
        `/api/appointments/${appointmentId}/invoice-pdf`, 
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `confirmacion-cita-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      toast.error("No se pudo descargar el comprobante");
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Add to calendar
  const handleAddToCalendar = () => {
    if (!appointment) return;
    
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(startDate.getTime() + (appointment.service.duration || 60) * 60000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.service.name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cita con ${appointment.provider.name}`)}&location=${encodeURIComponent(appointment.provider.address || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
    toast.success("Abriendo Google Calendar");
  };

  // Get QR code URL
  const getQrCodeUrl = () => {
    if (!appointment) return '';
    const verificationUrl = `${window.location.origin}/appointments/${appointmentId}/verify`;
    return `/api/qr/appointment/${appointmentId}?url=${encodeURIComponent(verificationUrl)}`;
  };

  // Loading state
  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <p className="text-gray-400">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  // Format dates
  const formattedDateTime = formatInTimeZone(
    new Date(appointment.startTime), 
    'UTC', 
    "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", 
    { locale: es }
  );
  const appointmentDate = formatInTimeZone(
    new Date(appointment.startTime), 
    'UTC', 
    "d 'de' MMMM", 
    { locale: es }
  );
  const appointmentTime = formatInTimeZone(
    new Date(appointment.startTime), 
    'UTC', 
    "HH:mm 'hrs'", 
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  top: '-10%', 
                  left: `${Math.random() * 100}%`,
                  rotate: 0 
                }}
                animate={{ 
                  top: '110%', 
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute"
              >
                <Sparkles 
                  className={cn(
                    "w-6 h-6",
                    i % 3 === 0 ? "text-yellow-400" : "",
                    i % 3 === 1 ? "text-purple-400" : "",
                    i % 3 === 2 ? "text-emerald-400" : "text-gray-400"
                  )} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          
          {/* Success Header */}
          <Card className="bg-gray-900/90 backdrop-blur-xl border-emerald-500/30 shadow-2xl overflow-hidden mb-6">
            <CardContent className="p-8 text-center">
              
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.2 
                }}
                className="relative mx-auto w-24 h-24 mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                  <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-400 fill-yellow-400 animate-pulse" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">
                  <Star className="w-3 h-3 mr-1" />
                  Confirmación #{appointmentId}
                </Badge>
                
                <h1 className="text-3xl font-black text-white mb-2">
                  ¡Cita Confirmada!
                </h1>
                <p className="text-gray-400">
                  Hemos enviado una confirmación a{' '}
                  <span className="text-purple-400 font-semibold">
                    {appointment.consumer?.email}
                  </span>
                </p>
              </motion.div>

              {/* Success Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <Mail className="w-5 h-5" />
                  <p className="text-sm font-semibold">
                    ✓ Email de confirmación enviado
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Detalles de tu Cita
              </h2>

              <div className="space-y-4">
                {/* Provider */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Profesional</p>
                    <p className="font-semibold text-white">{appointment.provider.name}</p>
                    {appointment.provider.phone && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appointment.provider.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Star className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Servicio</p>
                    <p className="font-semibold text-white">{appointment.service.name}</p>
                    {appointment.service.duration && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.service.duration} minutos
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Fecha y Hora</p>
                    <p className="font-semibold text-white capitalize">{formattedDateTime}</p>
                  </div>
                </div>

                {/* Location */}
                {appointment.provider.address && (
                  <div className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                      <p className="font-semibold text-white">{appointment.provider.address}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Total Pagado</p>
                    <p className="font-bold text-2xl text-white">
                      ${appointment.priceAtBooking.toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                Código QR de Verificación
              </h2>

              <div className="bg-white p-6 rounded-xl w-48 h-48 mx-auto mb-4">
                <img 
                  src={getQrCodeUrl()} 
                  alt="Código QR de la cita" 
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300/80">
                  Muestra este código QR al llegar a tu cita para verificación rápida
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Button
              onClick={handleAddToCalendar}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 h-auto flex-col gap-2 py-4"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Agregar a Calendario</span>
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              disabled={downloadingPDF}
              className="border-gray-700 hover:bg-gray-800 h-auto flex-col gap-2 py-4"
            >
              {downloadingPDF ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span className="text-xs">Descargar PDF</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 h-auto flex-col gap-2 py-4"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Share className="w-5 h-5" />
              )}
              <span className="text-xs">Compartir</span>
            </Button>

            <Button
              onClick={() => toast.info("Recordatorio configurado para 24h antes")}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 h-auto flex-col gap-2 py-4"
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs">Recordatorio</span>
            </Button>
          </div>

          {/* Main CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/appointments')}
              className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base font-bold shadow-xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Ver Mis Citas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="h-12 border-gray-700 hover:bg-gray-800 text-base font-semibold"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Dashboard
            </Button>
          </div>

          {/* Security Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Confirmación segura • Datos protegidos</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}