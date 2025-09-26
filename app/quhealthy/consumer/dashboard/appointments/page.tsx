/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, User, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useRouter } from 'next/navigation';


// Definimos el tipo para una cita desde la perspectiva del consumidor
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string;
  provider: { name: string };
  service: { name: string };
}

export default function ConsumerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalState, setCancelModalState] = useState<{isOpen: boolean, appointment: Appointment | null}>({isOpen: false, appointment: null});
  const [isCanceling, setIsCanceling] = useState(false);
    const router = useRouter();
  

  // Función para obtener las citas del consumidor
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/appointments/consumer', { withCredentials: true });
      setAppointments(data);
    } catch (error) {
      toast.error("No se pudieron cargar tus citas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Función para que el consumidor cancele una cita
  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    
    setIsCanceling(true);
    try {
      await axios.put(`/api/appointments/${cancelModalState.appointment.id}/cancel`, {}, { withCredentials: true });
      toast.success("Cita cancelada exitosamente.");
      setCancelModalState({ isOpen: false, appointment: null });
      fetchAppointments(); // Recarga la lista de citas
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo cancelar la cita.");
    } finally {
      setIsCanceling(false);
    }
  };

  // Helpers para el estilo y texto de los badges de estado
  const getStatusBadgeStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'canceled_by_consumer':
      case 'canceled_by_provider': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
        case 'completed': return 'Completada';
        case 'confirmed': return 'Confirmada';
        case 'pending': return 'Pendiente';
        case 'canceled_by_consumer': return 'Cancelada por ti';
        case 'canceled_by_provider': return 'Cancelada por profesional';
        default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Mis Citas</h1>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
          <ul className="divide-y divide-gray-700">
            {appointments.length > 0 ? (
              appointments.map(appt => {
                const isPast = new Date(appt.endTime) < new Date();
                return (
                  <li key={appt.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-white text-lg">{appt.service.name}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-2"><User className="w-4 h-4"/>Con {appt.provider.name}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4"/>
                        {formatInTimeZone(new Date(appt.startTime), 'UTC', "eeee, d 'de' MMMM, yyyy 'a las' HH:mm 'hrs'", { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-center">
                      <Badge className={getStatusBadgeStyle(appt.status)}>{getStatusText(appt.status)}</Badge>
                      {/* El consumidor solo puede cancelar citas futuras y confirmadas */}
                      {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => setCancelModalState({ isOpen: true, appointment: appt })}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <p className="p-8 text-center text-gray-500">Aún no tienes ninguna cita agendada.</p>
            )}
          </ul>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleCancelAppointment}
        title="¿Seguro que quieres cancelar?"
        message="Esta acción no se puede deshacer. Se aplicará la política de cancelación del proveedor."
        isLoading={isCanceling}
      />
    </>
  );
}