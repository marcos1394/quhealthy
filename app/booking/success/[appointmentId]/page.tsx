/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import { 
  CheckCircle2, Calendar, User, DollarSign, Loader2, Share, Download, QrCode,
  Copy, Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interfaz para los detalles de la cita
interface AppointmentDetails {
  id: number;
  startTime: string;
  priceAtBooking: number;
  provider: { name: string };
  service: { name: string };
}

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const getAppointmentDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<AppointmentDetails>(`/api/appointments/${appointmentId}`, {
          withCredentials: true,
        });
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    getAppointmentDetails();

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [appointmentId]);
  
  // --- FUNCIONES PRODUCTIVAS ---

  const generateShareText = () => {
    if (!appointment) return '';
    const dateStr = formatInTimeZone(new Date(appointment.startTime), 'UTC', "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", { locale: es });
    return `🎉 ¡Cita confirmada en QuHealthy!\n\nServicio: ${appointment.service.name}\nProfesional: ${appointment.provider.name}\nFecha: ${dateStr}`;
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
      } else {
        // Fallback para escritorios o navegadores sin Web Share API
        await navigator.clipboard.writeText(shareData.text);
        toast.success("¡Detalles de la cita copiados al portapapeles!");
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`/api/appointments/${appointmentId}/invoice-pdf`, {
        withCredentials: true,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante-cita-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("No se pudo descargar el comprobante.");
    }
  };

  const getQrCodeUrl = () => {
    if (!appointment) return '';
    // La URL pública que el QR va a codificar
    const verificationUrl = `${window.location.origin}/citas/${appointmentId}/verificar`;
    // La URL de NUESTRA API que genera la IMAGEN del QR
    return `/api/qr/appointment/${appointmentId}?url=${encodeURIComponent(verificationUrl)}`;
  };
  
  // --- RENDERIZADO ---
  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  const formattedDateTime = formatInTimeZone(new Date(appointment.startTime), 'UTC', "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", { locale: es });
  const appointmentDate = formatInTimeZone(new Date(appointment.startTime), 'UTC', "d 'de' MMMM", { locale: es });
  const appointmentTime = formatInTimeZone(new Date(appointment.startTime), 'UTC', "HH:mm 'hrs'", { locale: es });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Confetti efecto */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">¡Cita Confirmada!</h1>
        <p className="text-gray-300 mb-8">Hemos enviado una confirmación a tu correo.</p>

        <div className="text-left space-y-4 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <User className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Profesional</p>
              <p className="font-semibold text-white">{appointment.provider.name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Fecha y Hora</p>
              <p className="font-semibold text-white capitalize">{formattedDateTime}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Total Pagado</p>
              <p className="font-semibold text-white">${appointment.priceAtBooking}</p>
            </div>
          </div>
        </div>
        
        {/* Código QR */}
        <div className="bg-white p-4 rounded-lg w-40 h-40 mx-auto mt-8">
            <img src={getQrCodeUrl()} alt="Código QR de la cita" className="w-full h-full" />
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Muestra este código al llegar a tu cita</p>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
            <Button onClick={handleDownloadPDF} variant="outline" className="border-gray-600"><Download className="w-4 h-4 mr-2"/>PDF</Button>
            <Button onClick={handleShare} variant="outline" className="border-gray-600"><Share className="w-4 h-4 mr-2"/>Compartir</Button>
        </div>

        <Button onClick={() => router.push('/consumer/appointments')} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Ir a Mis Citas</Button>
      </motion.div>
    </div>
  );
}