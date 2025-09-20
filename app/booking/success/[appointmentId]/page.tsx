"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle2, Calendar, User, DollarSign, Loader2, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInTimeZone } from 'date-fns-tz'; // 1. Importamos la función clave
import { es } from 'date-fns/locale';


// Interfaz para el objeto de la cita que esperamos de la API
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

  // Estados para manejar la carga de datos en el cliente
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;

    const getAppointmentDetails = async () => {
      try {
        const { data } = await axios.get<AppointmentDetails>(`/api/appointments/${appointmentId}`, {
          withCredentials: true,
        });
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        // Si hay un error (ej. no autorizado, no encontrado), redirigimos
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    getAppointmentDetails();
  }, [appointmentId]);

  // 2. Nueva función para compartir en WhatsApp
  const handleShare = () => {
    if (!appointment) return;

    const dateStr = formatInTimeZone(new Date(appointment.startTime), 'UTC', "eeee d 'de' MMMM 'a las' HH:mm 'hrs'", { locale: es });
    const text = `¡Hola! Te comparto los detalles de mi cita agendada a través de QuHealthy:\n\n*Servicio:* ${appointment.service.name}\n*Profesional:* ${appointment.provider.name}\n*Cuándo:* ${dateStr}\n\n¡Encuentra a tus profesionales en QuHealthy!`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return notFound();
  }

    const formattedDateTime = formatInTimeZone(new Date(appointment.startTime), 'UTC', "eeee, d 'de' MMMM 'a las' HH:mm 'hrs'", { locale: es });

 return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 text-center">
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
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button onClick={handleShare} variant="outline" className="flex-1 border-gray-600">
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button onClick={() => router.push('/consumer/appointments')} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Ir a Mis Citas
            </Button>
        </div>
      </div>
    </div>
  );
}