"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Usaremos el tipo de cita que ya definimos
interface Appointment {
  id: number;
  status: string;
  startTime: string;
  provider: { name: string };
  service: { name: string };
}

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtenemos las citas del consumidor
    axios.get('/api/appointments/consumer', { withCredentials: true })
      .then(res => setAppointments(res.data))
      .catch(err => console.error("Error fetching appointments:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Usamos useMemo para calcular la próxima cita de forma eficiente
  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(appt => new Date(appt.startTime) > new Date() && appt.status === 'confirmed')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);
  
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header de Bienvenida */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          ¡Hola, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-lg text-gray-400 mt-2">Bienvenido/a a tu espacio de bienestar.</p>
      </div>

      {/* Tarjeta de Próxima Cita o Mensaje de Bienvenida */}
      {nextAppointment ? (
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Tu Próxima Cita</h2>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-white">{nextAppointment.service.name}</div>
            <div className="text-lg text-gray-300 flex items-center gap-2"><User className="w-5 h-5"/> {nextAppointment.provider.name}</div>
            <div className="text-lg text-gray-300 flex items-center gap-2">
              <Calendar className="w-5 h-5"/>
              {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "eeee, d 'de' MMMM", { locale: es })}
            </div>
            <div className="text-lg text-gray-300 flex items-center gap-2">
              <Clock className="w-5 h-5"/>
              {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "HH:mm 'hrs'", { locale: es })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white">Todo listo para empezar</h2>
          <p className="text-gray-400 mt-2 mb-6">No tienes citas próximas. ¿Buscas a tu próximo especialista?</p>
          <Button onClick={() => router.push('/discover')} size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Search className="w-5 h-5 mr-2" />
            Descubrir Profesionales
          </Button>
        </div>
      )}

      {/* Botones de Acción Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Historial de Citas</h3>
            <p className="text-sm text-gray-400">{appointments.length} citas en total</p>
          </div>
          <Button onClick={() => router.push('/consumer/appointments')}>
            Ver Todas <ArrowRight className="w-4 h-4 ml-2"/>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Configuración</h3>
            <p className="text-sm text-gray-400">Gestiona tu perfil</p>
          </div>
          <Button onClick={() => router.push('/consumer/settings')}>
            Ir a Perfil <ArrowRight className="w-4 h-4 ml-2"/>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}