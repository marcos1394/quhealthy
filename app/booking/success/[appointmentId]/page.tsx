"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle2, Calendar, User, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interfaz para el objeto de la cita que esperamos de la API
interface AppointmentDetails {
  id: number;
  startTime: string;
  priceAtBooking: number;
  provider: { name: string };
  // Añade aquí más campos si tu endpoint los devuelve
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
              <p className="font-semibold text-white">
                {new Date(appointment.startTime).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' a las '}
                {new Date(appointment.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
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
        
        <div className="mt-8 flex gap-4">
            <Button variant="outline" className="flex-1 border-gray-600">Añadir al Calendario</Button>
            <Button onClick={() => router.push('/consumer/appointments')} className="flex-1 bg-purple-600 hover:bg-purple-700">Ir a Mis Citas</Button>
        </div>
      </div>
    </div>
  );
}