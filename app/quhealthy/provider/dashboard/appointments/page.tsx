/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {  
  Check, Loader2, User, Clock, Calendar, Activity, 
  TrendingUp, Users, CheckCircle2, AlertCircle, 
  XCircle, Timer, Phone, Mail, MapPin, Star,
  Filter, Search, MoreVertical, Eye, MessageSquare,
  Award, Crown, Zap, Heart, Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { CompletionModal } from '@/app/quhealthy/components/dashboard/CompletionModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // <-- Importa el nuevo modal

// Interfaz para una cita
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string; // Necesitamos la hora de fin para la lógica
  consumer: { name: string };
  service: { name: string };
}

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- INICIO DE LA CORRECCIÓN ---
  // Estados para controlar el modal de completar cita
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{isOpen: boolean, appointment: Appointment | null}>({isOpen: false, appointment: null});
  const [isCanceling, setIsCanceling] = useState(false);
  

  // Función para obtener las citas del proveedor
  const fetchAppointments = useCallback(async () => {
    // Para la carga inicial, muestra el loader grande
    if (appointments.length === 0) setIsLoading(true); 
    try {
      const { data } = await axios.get('/api/appointments/provider', { withCredentials: true });
      setAppointments(data);
    } catch (error) {
      toast.error("No se pudieron cargar tus citas.");
    } finally {
      setIsLoading(false);
    }
  }, [appointments.length]);

  useEffect(() => {
    fetchAppointments();
  }, []); // Se ejecuta solo una vez al cargar el componente

  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    
    setIsCanceling(true);
    try {
      await axios.put(`/api/appointments/${cancelModalState.appointment.id}/cancel`, {}, { withCredentials: true });
      toast.success("Cita cancelada exitosamente.");
      setCancelModalState({ isOpen: false, appointment: null });
      fetchAppointments(); // Recarga la lista de citas
    } catch (error) {
      toast.error("No se pudo cancelar la cita.");
    } finally {
      setIsCanceling(false);
    }
  };

  // Nueva función que abre el modal con la cita seleccionada
  const handleOpenCompletionModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  // --- FIN DE LA CORRECCIÓN ---

  // Helper para el estilo de los badges de estado
  const getStatusBadgeStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'canceled_by_consumer':
      case 'canceled_by_provider': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    }
  };

  // Helper para obtener el icono del estado
  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'confirmed': return <Check className="w-4 h-4" />;
      case 'pending': return <Timer className="w-4 h-4" />;
      case 'canceled_by_consumer':
      case 'canceled_by_provider': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Helper para texto del estado
  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'canceled_by_consumer': return 'Cancelada por paciente';
      case 'canceled_by_provider': return 'Cancelada por ti';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-16 h-16 animate-spin text-purple-400 relative z-10 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando tus citas</h2>
            <p className="text-white/60">Un momento por favor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas para mostrar
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    canceled: appointments.filter(a => a.status.includes('canceled')).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Efectos adicionales flotantes */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="relative z-10 p-6 space-y-8"
      >
        {/* Header Premium */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl mr-4 shadow-lg shadow-purple-500/25">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Mis Citas
              </h1>
              <p className="text-white/60 text-lg">Panel Profesional</p>
            </div>
          </div>
        </div>

        {/* Estadísticas Premium */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl w-fit mx-auto mb-3 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-white/60 text-sm">Total</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl w-fit mx-auto mb-3 shadow-lg">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.pending}</p>
            <p className="text-white/60 text-sm">Pendientes</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl w-fit mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.confirmed}</p>
            <p className="text-white/60 text-sm">Confirmadas</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl w-fit mx-auto mb-3 shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completed}</p>
            <p className="text-white/60 text-sm">Completadas</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-xl w-fit mx-auto mb-3 shadow-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.canceled}</p>
            <p className="text-white/60 text-sm">Canceladas</p>
          </div>
        </div>

        {/* Contenedor de citas con diseño premium */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {appointments.length > 0 ? (
            <div className="divide-y divide-white/10">
              {appointments.map((appt) => {
                const appointmentDate = new Date(appt.startTime);
                const isToday = appointmentDate.toDateString() === new Date().toDateString();
                const isPast = appointmentDate < new Date();
                const isCompletable = new Date(appt.endTime) < new Date();

                
                return (
                  <div
                    key={appt.id}
                    className={`p-6 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group ${
                      isToday ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
                    }`}
                  >
                    {/* Indicador de cita de hoy */}
                    {isToday && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-400/50"></div>
                    )}

                    {/* Efecto de hover brillante */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                      {/* Información principal con avatar */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          {appt.status === 'completed' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {isToday && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-xl group-hover:text-purple-200 transition-colors">
                              {appt.service.name}
                            </p>
                            {isToday && (
                              <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/40 text-xs">
                                HOY
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-purple-200 flex items-center gap-2 text-lg font-medium">
                            <User className="w-5 h-5 text-purple-300"/>
                            {appt.consumer.name}
                          </p>
                          
                          <p className="text-white/70 flex items-center gap-2 text-base">
                            <Clock className="w-5 h-5 text-cyan-300"/>
                            {formatInTimeZone(new Date(appt.startTime), 'UTC', "eeee, d 'de' MMMM, yyyy 'a las' HH:mm 'hrs'", { locale: es })}
                          </p>
                        </div>
                      </div>

                      {/* Estado y acciones */}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Badge de estado mejorado */}
                        <Badge className={`${getStatusBadgeStyle(appt.status)} px-4 py-2 font-semibold text-base`}>

                          <div className="flex items-center gap-2">
                            {getStatusIcon(appt.status)}
                            {getStatusText(appt.status)}
                          </div>
                        </Badge>
                        {/* --- AÑADE ESTE BOTÓN --- */}
  {appt.status === 'confirmed' && !isPast && (
    <Button 
      size="sm"
      variant="destructive"
      onClick={() => setCancelModalState({ isOpen: true, appointment: appt })}
    >
      <X className="w-4 h-4 mr-2" />
      Cancelar
    </Button>
  )}
  {/* --- FIN DEL BOTÓN --- */}

                        {/* Botón de completar con estilo premium */}
                        {appt.status === 'confirmed' && (
    <Button 
      size="sm" 
      // --- INICIO DE LA CORRECCIÓN ---
      // Llama a la función que abre el modal, pasando la cita completa
      onClick={() => handleOpenCompletionModal(appt)}
      // Se deshabilita si la cita aún no ha terminado
      disabled={!isCompletable}
      title={!isCompletable ? "Solo puedes completar la cita después de su hora de fin" : "Marcar esta cita como completada"}
      // --- FIN DE LA CORRECCIÓN ---
    >
      <Check className="w-4 h-4 mr-2" />
      Marcar como Completada
    </Button>
  )}
</div>
                    </div>
                    {/* --- INICIO DE LA CORRECCIÓN --- */}
      {/* Añadimos el modal al final. Se mostrará cuando su estado 'isOpen' sea true. */}
      <CompletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        onComplete={fetchAppointments} // Pasamos la función para recargar las citas
      />
       <ConfirmationModal
      isOpen={cancelModalState.isOpen}
      onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
      onConfirm={handleCancelAppointment}
      title="¿Estás seguro de cancelar esta cita?"
      message={`Esta acción no se puede deshacer. Se notificará al cliente y se procesará un reembolso completo.`}
      isLoading={isCanceling}
    />

                    {/* Información adicional para citas importantes */}
                    {(isToday || appt.status === 'pending') && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-white/60">
                            <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">Contactar</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Mensaje</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                              <Star className="w-4 h-4" />
                              <span className="text-sm">Notas</span>
                            </button>
                          </div>
                          
                          {isToday && (
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                              <Zap className="w-4 h-4" />
                              <span className="text-sm">Cita de hoy</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Calendar className="w-16 h-16 text-white/40" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No tienes ninguna cita agendada
                </h3>
                <p className="text-white/60 max-w-md mx-auto text-lg">
                  Las nuevas citas aparecerán aquí cuando los pacientes las reserven contigo
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-white/40">
                <Heart className="w-5 h-5" />
                <span>Tu agenda está lista para recibir nuevas citas</span>
                <Heart className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="text-center">
          <p className="text-white/40 text-sm">
            💜 Panel diseñado para maximizar tu productividad profesional
          </p>
        </div>
      </motion.div>
    </div>
  );
}