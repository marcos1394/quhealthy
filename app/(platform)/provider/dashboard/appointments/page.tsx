"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Check, Loader2, User, Clock, Calendar, Activity, 
  CheckCircle2, XCircle, Timer, Phone, 
  MessageSquare, Star, Zap, X, Video, Heart, Sparkles, 
  Award
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// --- SHADCN UI ---
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- COMPONENTES IMPORTADOS ---
// Asegúrate de que estas rutas coincidan con donde guardaste los archivos
import { CompletionModal } from '@/components/dashboard/CompletionModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// --- TIPOS ---
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string;
  provider: { name: string };
  consumer: { name: string };
  service: { 
    name: string;
    serviceDeliveryType: 'in_person' | 'video_call'; 
  };
}

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // --- ESTADOS PARA MODALES ---
  // Modal de Completar Cita
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Modal de Cancelar Cita
  const [cancelModalState, setCancelModalState] = useState<{isOpen: boolean, appointment: Appointment | null}>({
    isOpen: false, 
    appointment: null
  });
  const [isCanceling, setIsCanceling] = useState(false);

  // --- CARGA DE DATOS (BACKEND REAL) ---
  const fetchAppointments = useCallback(async () => {
    // Solo mostramos loader full-screen si no tenemos datos previos
    if (appointments.length === 0) setIsLoading(true); 
    
    try {
      const { data } = await axios.get('/api/appointments/provider', { withCredentials: true });
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al sincronizar la agenda.");
    } finally {
      setIsLoading(false);
    }
  }, [appointments.length]);

  // Cargar al montar el componente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- HANDLERS (ACCIONES) ---

  // 1. Abrir Modal de Cancelación
  const handleOpenCancelModal = (appointment: Appointment) => {
    setCancelModalState({ isOpen: true, appointment });
  };

  // 2. Confirmar Cancelación (Llamada a API)
  const handleConfirmCancel = async () => {
    if (!cancelModalState.appointment) return;
    
    setIsCanceling(true);
    try {
      await axios.put(
        `/api/appointments/${cancelModalState.appointment.id}/cancel`, 
        {}, // Body vacío si no requieres motivo obligatorio
        { withCredentials: true }
      );
      
      toast.success("Cita cancelada correctamente.");
      
      // Actualización Optimista: Cambiamos el estado localmente para que la UI responda rápido
      setAppointments(prev => prev.map(a => 
        a.id === cancelModalState.appointment?.id 
          ? { ...a, status: 'canceled_by_provider' } 
          : a
      ));
      
      // Cerramos modal
      setCancelModalState({ isOpen: false, appointment: null });
      
      // Opcional: Recargar datos reales para asegurar consistencia
      fetchAppointments();

    } catch (error) {
      console.error(error);
      toast.error("No se pudo cancelar la cita. Intenta de nuevo.");
    } finally {
      setIsCanceling(false);
    }
  };

  // 3. Abrir Modal de Completar
  const handleOpenCompletionModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCompleteModalOpen(true);
  };

  // --- HELPERS VISUALES ---
  const getStatusBadgeStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'canceled_by_consumer':
      case 'canceled_by_provider': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'confirmed': return <Check className="w-4 h-4" />;
      case 'pending': return <Timer className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'canceled_by_consumer': return 'Cancelada (Cliente)';
      case 'canceled_by_provider': return 'Cancelada (Tú)';
      default: return status === 'canceled_by_provider' ? 'Cancelada' : status;
    }
  };

  // Estadísticas Rápidas
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    canceled: appointments.filter(a => a.status.includes('canceled')).length
  };

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center">
        <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 relative z-10 mb-4" />
        </div>
        <p className="text-gray-400 animate-pulse font-medium">Sincronizando tu agenda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-500" />
                Mis Citas
            </h1>
            <p className="text-gray-400 mt-1">Gestiona tu agenda y pacientes en tiempo real.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
            <Zap className="w-4 h-4 mr-2" /> Nueva Cita Manual
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
         {[
            { label: 'Total', value: stats.total, color: 'text-white', icon: Activity, bg: 'bg-gray-800' },
            { label: 'Pendientes', value: stats.pending, color: 'text-yellow-400', icon: Timer, bg: 'bg-yellow-500/5' },
            { label: 'Confirmadas', value: stats.confirmed, color: 'text-blue-400', icon: CheckCircle2, bg: 'bg-blue-500/5' },
            { label: 'Completadas', value: stats.completed, color: 'text-emerald-400', icon: Award, bg: 'bg-emerald-500/5' },
            { label: 'Canceladas', value: stats.canceled, color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/5' },
         ].map((stat, i) => (
             <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${stat.bg} border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-gray-700 transition-colors`}
             >
                 <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                 <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                 <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{stat.label}</span>
             </motion.div>
         ))}
      </div>

      {/* Lista de Citas */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
            {appointments.length > 0 ? (
                appointments.map((appt, index) => {
                    const appointmentDate = new Date(appt.startTime);
                    const isToday = appointmentDate.toDateString() === new Date().toDateString();
                    // Lógica de negocio: ¿Se puede completar? Solo si ya pasó la hora de fin O si estamos muy cerca.
                    // Ajusta esta lógica según tus reglas de negocio.
                    const isCompletable = new Date() >= new Date(appt.startTime); 
                    const isPast = new Date() > new Date(appt.endTime);

                    return (
                        <motion.div
                            key={appt.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all ${isToday ? 'bg-gradient-to-r from-gray-900 to-purple-900/10 border-purple-500/30' : ''}`}
                        >
                            {isToday && (
                                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1 z-10">
                                    <Sparkles className="w-3 h-3" /> HOY
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-0">
                                
                                {/* Info Principal */}
                                <div className="flex items-start gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shrink-0">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                            {appt.service.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-sm mt-1">
                                            <span className="text-white font-medium">{appt.consumer.name}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="flex items-center gap-1 text-cyan-400">
                                                <Clock className="w-3 h-3" />
                                                {formatInTimeZone(new Date(appt.startTime), 'UTC', "d MMM, HH:mm", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones y Estado */}
                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                                    <Badge className={`${getStatusBadgeStyle(appt.status)} px-3 py-1.5 h-9`}>
                                        <span className="flex items-center gap-1.5">
                                            {getStatusIcon(appt.status)}
                                            {getStatusText(appt.status)}
                                        </span>
                                    </Badge>

                                    {/* Video Call Button */}
                                    {appt.service.serviceDeliveryType === 'video_call' && (appt.status === 'confirmed' || appt.status === 'pending') && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => router.push(`/video-call/${appt.id}`)} 
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20"
                                        >
                                            <Video className="w-4 h-4 mr-2" /> Unirse
                                        </Button>
                                    )}

                                    {/* Cancelar Button */}
                                    {appt.status === 'confirmed' && !isPast && (
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-transparent hover:border-red-900/30"
                                            onClick={() => handleOpenCancelModal(appt)}
                                        >
                                            <X className="w-4 h-4" /> <span className="hidden sm:inline ml-2">Cancelar</span>
                                        </Button>
                                    )}

                                    {/* Completar Button */}
                                    {appt.status === 'confirmed' && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleOpenCompletionModal(appt)}
                                            disabled={!isCompletable}
                                            className={`
                                                ${isCompletable 
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20' 
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                                            `}
                                            title={!isCompletable ? "Podrás completar la cita cuando llegue la hora de inicio" : "Finalizar servicio"}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Completar
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Footer de Acciones Rápidas (Solo visibles si no está cancelada/completada) */}
                            {['confirmed', 'pending'].includes(appt.status) && (
                                <div className="mt-4 pt-4 border-t border-gray-800 flex gap-6 text-xs font-medium text-gray-500">
                                    <button className="hover:text-purple-400 flex items-center gap-1.5 transition-colors">
                                        <Phone className="w-3.5 h-3.5" /> Llamar
                                    </button>
                                    <button className="hover:text-purple-400 flex items-center gap-1.5 transition-colors">
                                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                    <button className="hover:text-yellow-400 flex items-center gap-1.5 transition-colors">
                                        <Star className="w-3.5 h-3.5" /> Ver Historial
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    );
                })
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30"
                >
                    <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No hay citas programadas</h3>
                    <p className="text-gray-400 max-w-sm mx-auto text-sm">
                        Tu agenda está libre por ahora. Comparte tu perfil para empezar a recibir pacientes.
                    </p>
                    <Button variant="link" className="mt-4 text-purple-400">
                        Copiar enlace de perfil
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* --- MODALES --- */}
      
      {/* 1. Completar Cita */}
      <CompletionModal 
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        appointment={selectedAppointment}
        onComplete={() => {
            fetchAppointments(); // Recargar datos del backend
            setIsCompleteModalOpen(false);
        }}
      />

      {/* 2. Cancelar Cita */}
      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmCancel}
        title="Cancelar Cita"
        message="¿Estás seguro de que deseas cancelar esta cita? Se notificará al paciente y se procesará el reembolso si aplica. Esta acción es irreversible."
        isLoading={isCanceling}
        variant="destructive"
      />

    </div>
  );
}