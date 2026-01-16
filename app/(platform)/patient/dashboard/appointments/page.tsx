/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Loader2, Clock, Video, Calendar, MapPin
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Componentes Compartidos
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// Tipos
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string;
  provider: { 
    name: string;
    specialty?: string; // Opcional
    image?: string;     // Opcional
  };
  service: { 
    name: string;
    serviceDeliveryType: 'in_person' | 'video_call'; 
  };
  location?: string;
}

// Mock Data (Para visualizar si falla el backend)
const mockAppointments: Appointment[] = [
  {
    id: 1,
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Mañana
    endTime: new Date(Date.now() + 90000000).toISOString(),
    provider: { name: "Dr. Roberto Casas", specialty: "Dentista" },
    service: { name: "Limpieza Dental", serviceDeliveryType: 'in_person' },
    location: "Av. Reforma 222, Consultorio 301"
  },
  {
    id: 2,
    status: 'completed',
    startTime: new Date(Date.now() - 86400000 * 5).toISOString(), // Hace 5 días
    endTime: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
    provider: { name: "Dra. Elena Gómez", specialty: "Nutrióloga" },
    service: { name: "Consulta Nutricional", serviceDeliveryType: 'video_call' }
  }
];

export default function ConsumerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const router = useRouter();

  // Estado del Modal de Cancelación
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean; 
    appointment: Appointment | null;
  }>({
    isOpen: false, 
    appointment: null
  });

  const fetchAppointments = useCallback(async () => {
    // setIsLoading(true); // Opcional: solo en carga inicial
    try {
      // Intentamos backend real
      // const { data } = await axios.get('/api/appointments/consumer', { withCredentials: true });
      // setAppointments(data);
      
      // Simulación (Fallback)
      await new Promise(r => setTimeout(r, 600));
      setAppointments(mockAppointments);

    } catch (error) {
      console.error(error);
      toast.error("No se pudieron actualizar las citas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    
    setIsCanceling(true);
    try {
      // Simulación de llamada
      await new Promise(r => setTimeout(r, 1000));
      // await axios.put(`/api/appointments/${cancelModalState.appointment.id}/cancel`, {}, { withCredentials: true });
      
      toast.success("Cita cancelada correctamente.");
      
      // Actualización optimista
      setAppointments(prev => prev.map(a => 
        a.id === cancelModalState.appointment?.id 
          ? { ...a, status: 'canceled_by_consumer' } 
          : a
      ));
      
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error: any) {
      toast.error("Error al cancelar la cita.");
    } finally {
      setIsCanceling(false);
    }
  };

  // Helpers Visuales
  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': 
        return { label: 'Completada', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'confirmed': 
        return { label: 'Confirmada', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'pending': 
        return { label: 'Pendiente', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
      case 'canceled_by_consumer': 
        return { label: 'Cancelada por ti', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'canceled_by_provider': 
        return { label: 'Cancelada por médico', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: 
        return { label: 'Desconocido', className: 'bg-gray-500/10 text-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Citas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus reservas y consulta tu historial.
        </p>
      </div>

      {/* Lista de Citas */}
      <div className="space-y-4">
        <AnimatePresence>
            {appointments.length > 0 ? (
                appointments.map((appt) => {
                    const statusConfig = getStatusConfig(appt.status);
                    const isPast = new Date(appt.endTime) < new Date();
                    const isVideo = appt.service.serviceDeliveryType === 'video_call';

                    return (
                        <motion.div
                            key={appt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                        >
                            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        
                                        {/* Fecha / Estado (Columna Izquierda) */}
                                        <div className="bg-gray-50 dark:bg-gray-950/50 p-6 flex flex-col justify-center items-center md:items-start min-w-[180px] border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 gap-3">
                                            <div className="text-center md:text-left">
                                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                                    {formatInTimeZone(new Date(appt.startTime), 'UTC', "MMM", { locale: es })}
                                                </p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {formatInTimeZone(new Date(appt.startTime), 'UTC', "d", { locale: es })}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatInTimeZone(new Date(appt.startTime), 'UTC', "yyyy", { locale: es })}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`${statusConfig.className} border`}>
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        {/* Detalles (Centro) */}
                                        <div className="p-6 flex-1 flex flex-col justify-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {appt.service.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {formatInTimeZone(new Date(appt.startTime), 'UTC', "h:mm a", { locale: es })} - 
                                                        {formatInTimeZone(new Date(appt.endTime), 'UTC', "h:mm a", { locale: es })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={appt.provider.image} />
                                                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
                                                        {appt.provider.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900 dark:text-white">{appt.provider.name}</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{appt.provider.specialty || 'Especialista'}</p>
                                                </div>
                                            </div>

                                            {appt.location && !isVideo && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {appt.location}
                                                </div>
                                            )}
                                        </div>

                                        {/* Acciones (Derecha) */}
                                        <div className="p-6 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800">
                                            
                                            {/* Botón de Video */}
                                            {isVideo && (appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                                                <Button 
                                                    size="sm"
                                                    onClick={() => router.push(`/video-call/${appt.id}`)}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                                                >
                                                    <Video className="w-4 h-4 mr-2" /> Unirse
                                                </Button>
                                            )}

                                            {/* Botón Cancelar */}
                                            {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => setCancelModalState({ isOpen: true, appointment: appt })}
                                                >
                                                    Cancelar
                                                </Button>
                                            )}

                                            {/* Botón Re-agendar (para citas pasadas) */}
                                            {isPast && (
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(`/search?provider=${appt.provider.name}`)}>
                                                    Agendar de nuevo
                                                </Button>
                                            )}
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes citas programadas</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Busca un especialista y agenda tu próxima consulta.</p>
                    <Button onClick={() => router.push('/search')} className="bg-purple-600 hover:bg-purple-700">
                        Buscar Especialista
                    </Button>
                </div>
            )}
        </AnimatePresence>
      </div>

      {/* Modal de Cancelación */}
      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleCancelAppointment}
        title="Cancelar Cita"
        message={`¿Estás seguro que deseas cancelar tu cita de ${cancelModalState.appointment?.service.name}?`}
        isLoading={isCanceling}
        variant="destructive"
      />

    </div>
  );
}