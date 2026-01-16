"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Store
import { useSessionStore } from '@/stores/SessionStore';

// Tipos
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  startTime: string;
  provider: { 
    name: string; 
    image?: string; 
    specialty?: string 
  };
  service: { name: string };
  location?: string;
}

// Mock Data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Mañana
    provider: { name: "Dr. Roberto Casas", specialty: "Dentista" },
    service: { name: "Limpieza Dental Profunda" },
    location: "Av. Reforma 222, CDMX"
  }
];

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga
    setTimeout(() => {
        setAppointments(mockAppointments);
        setIsLoading(false);
    }, 800);

    // Producción:
    /*
    axios.get('/api/appointments/consumer', { withCredentials: true })
      .then(res => setAppointments(res.data))
      .catch(err => console.error("Error fetching appointments:", err))
      .finally(() => setIsLoading(false));
    */
  }, []);

  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(appt => new Date(appt.startTime) > new Date() && appt.status === 'confirmed')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);
  
  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-gray-400 font-medium">Cargando tu bienestar...</p>
        </div>
    );
  }

  // Nombre seguro (fallback si user es null)
  const firstName = user?.name ? user.name.split(' ')[0] : 'Paciente';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Hola, {firstName} 👋
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Gestiona tu salud y bienestar desde aquí.
        </p>
      </div>

      {/* Tarjeta de Próxima Cita (Destacada) */}
      {nextAppointment ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-900 p-8 shadow-2xl border border-purple-500/30">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> Próxima Cita
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white leading-tight">
                        {nextAppointment.service.name}
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-purple-100">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-purple-400/50">
                                <AvatarFallback className="bg-purple-800 text-white font-bold">
                                    {nextAppointment.provider.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-white">{nextAppointment.provider.name}</p>
                                <p className="text-xs text-purple-300">{nextAppointment.provider.specialty}</p>
                            </div>
                        </div>
                        
                        <div className="h-10 w-[1px] bg-purple-500/30 hidden sm:block"></div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-300" />
                                <span className="font-medium">
                                    {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "EEEE d 'de' MMMM", { locale: es })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-300" />
                                <span>
                                    {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "h:mm a", { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <Button 
                        onClick={() => router.push(`/patient/appointments/${nextAppointment.id}`)}
                        className="w-full md:w-auto bg-white text-purple-900 hover:bg-purple-50 font-bold py-6 px-8 rounded-xl shadow-xl transition-all hover:scale-105"
                    >
                        Ver Detalles
                    </Button>
                </div>
            </div>
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Todo despejado</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    No tienes citas programadas próximamente. ¿Es hora de un chequeo?
                </p>
                <Button 
                    onClick={() => router.push('/search')} // Ruta de búsqueda
                    className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                >
                    Buscar Especialista
                </Button>
            </CardContent>
        </Card>
      )}

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card 
            className="hover:border-purple-500/50 transition-all cursor-pointer group"
            onClick={() => router.push('/patient/appointments')}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Historial</CardTitle>
                <Clock className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 mb-4">Revisa tus citas pasadas y recetas.</p>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center">
                    Ver historial completo <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </CardContent>
        </Card>

        <Card 
            className="hover:border-purple-500/50 transition-all cursor-pointer group"
            onClick={() => router.push('/patient/settings')}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Mi Perfil</CardTitle>
                <User className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 mb-4">Actualiza tus datos y preferencias.</p>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center">
                    Gestionar cuenta <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}