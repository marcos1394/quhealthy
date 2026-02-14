/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  Clock, 
  Video, 
  Calendar, 
  MapPin,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Components
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { cn } from '@/lib/utils';

/**
 * ConsumerAppointmentsPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Tab filters (Upcoming/Past/Cancelled)
 *    - Visual status badges
 *    - Clear action buttons
 *    - Search functionality
 * 
 * 2. SATISFICING
 *    - Quick filters
 *    - One-click actions
 *    - Video call button prominent
 *    - Easy rescheduling
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Loading states
 *    - Success toasts
 *    - Optimistic updates
 *    - Real-time filtering
 * 
 * 4. JERARQUÍA VISUAL
 *    - Upcoming appointments first
 *    - Color-coded statuses
 *    - Date prominence
 *    - Action buttons visible
 * 
 * 5. MINIMIZAR ERRORES
 *    - Confirmation modals
 *    - Clear cancel warnings
 *    - Undo options
 *    - Error handling
 * 
 * 6. CREDIBILIDAD
 *    - Professional design
 *    - Stats summary
 *    - Provider details
 *    - Service information
 */

// Types
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string;
  provider: { 
    name: string;
    specialty?: string;
    image?: string;
    rating?: number;
  };
  service: { 
    name: string;
    serviceDeliveryType: 'in_person' | 'video_call'; 
  };
  location?: string;
  priceAtBooking?: number;
}

// Mock Data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    provider: { 
      name: "Dr. Roberto Casas", 
      specialty: "Dentista",
      rating: 4.8
    },
    service: { name: "Limpieza Dental", serviceDeliveryType: 'in_person' },
    location: "Av. Reforma 222, Consultorio 301",
    priceAtBooking: 800
  },
  {
    id: 2,
    status: 'confirmed',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    endTime: new Date(Date.now() + 176400000).toISOString(),
    provider: { 
      name: "Dra. Elena Gómez", 
      specialty: "Nutrióloga",
      rating: 4.9
    },
    service: { name: "Consulta Nutricional", serviceDeliveryType: 'video_call' },
    priceAtBooking: 650
  },
  {
    id: 3,
    status: 'completed',
    startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
    provider: { 
      name: "Dr. Carlos Méndez", 
      specialty: "Medicina General",
      rating: 4.7
    },
    service: { name: "Consulta General", serviceDeliveryType: 'in_person' },
    location: "Calle Norte 15, Piso 2",
    priceAtBooking: 500
  },
];

type TabValue = 'upcoming' | 'past' | 'cancelled';

export default function ConsumerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [sortBy, setSortBy] = useState<'date' | 'provider'>('date');
  const router = useRouter();

  // Cancel modal state
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean; 
    appointment: Appointment | null;
  }>({
    isOpen: false, 
    appointment: null
  });

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      await new Promise(r => setTimeout(r, 800));
      setAppointments(mockAppointments);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las citas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter and sort appointments
  useEffect(() => {
    let filtered = [...appointments];
    const now = new Date();

    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(a => 
        new Date(a.startTime) >= now && 
        (a.status === 'confirmed' || a.status === 'pending')
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(a => 
        new Date(a.endTime) < now || 
        a.status === 'completed'
      );
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(a => 
        a.status === 'canceled_by_consumer' || 
        a.status === 'canceled_by_provider'
      );
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.provider.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else {
      filtered.sort((a, b) => 
        a.provider.name.localeCompare(b.provider.name)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, activeTab, searchQuery, sortBy]);

  // Calculate stats
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => 
      new Date(a.startTime) >= new Date() && 
      (a.status === 'confirmed' || a.status === 'pending')
    ).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => 
      a.status === 'canceled_by_consumer' || 
      a.status === 'canceled_by_provider'
    ).length
  };

  // Handle cancel
  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    
    setIsCanceling(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      toast.success("Cita cancelada correctamente");
      
      setAppointments(prev => prev.map(a => 
        a.id === cancelModalState.appointment?.id 
          ? { ...a, status: 'canceled_by_consumer' } 
          : a
      ));
      
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error: any) {
      toast.error("Error al cancelar la cita");
    } finally {
      setIsCanceling(false);
    }
  };

  // Status config
  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': 
        return { 
          label: 'Completada', 
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        };
      case 'confirmed': 
        return { 
          label: 'Confirmada', 
          icon: CheckCircle2,
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
        };
      case 'pending': 
        return { 
          label: 'Pendiente', 
          icon: AlertCircle,
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
        };
      case 'canceled_by_consumer': 
        return { 
          label: 'Cancelada', 
          icon: XCircle,
          className: 'bg-red-500/10 text-red-400 border-red-500/20' 
        };
      case 'canceled_by_provider': 
        return { 
          label: 'Cancelada por proveedor', 
          icon: XCircle,
          className: 'bg-red-500/10 text-red-400 border-red-500/20' 
        };
      default: 
        return { 
          label: 'Desconocido', 
          icon: AlertCircle,
          className: 'bg-gray-500/10 text-gray-400' 
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        <p className="text-gray-400">Cargando tus citas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-500" />
              Mis Citas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestiona tus reservas y consulta tu historial
            </p>
          </div>
          <Button
            onClick={() => router.push('/discover')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {stats.total}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Próximas</p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {stats.upcoming}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completadas</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Canceladas</p>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">
                    {stats.cancelled}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Próximas
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  Pasadas
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  Canceladas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por proveedor o servicio..."
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'provider')}>
              <SelectTrigger className="w-full md:w-40 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Por Fecha</SelectItem>
                <SelectItem value="provider">Por Proveedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt, index) => {
              const statusConfig = getStatusConfig(appt.status);
              const StatusIcon = statusConfig.icon;
              const isPast = new Date(appt.endTime) < new Date();
              const isVideo = appt.service.serviceDeliveryType === 'video_call';
              const canJoinVideo = isVideo && !isPast && (appt.status === 'confirmed' || appt.status === 'pending');

              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        
                        {/* Date Column */}
                        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 p-6 flex flex-col justify-center items-center lg:items-start min-w-[180px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 gap-3">
                          <div className="text-center lg:text-left">
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                              {formatInTimeZone(new Date(appt.startTime), 'UTC', "MMM", { locale: es })}
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                              {formatInTimeZone(new Date(appt.startTime), 'UTC', "d", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              {formatInTimeZone(new Date(appt.startTime), 'UTC', "yyyy", { locale: es })}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn("border", statusConfig.className)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {isVideo && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>

                        {/* Details Column */}
                        <div className="p-6 flex-1 space-y-4">
                          {/* Service Name */}
                          <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {appt.service.name}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">
                                {formatInTimeZone(new Date(appt.startTime), 'UTC', "h:mm a", { locale: es })}
                                {' - '}
                                {formatInTimeZone(new Date(appt.endTime), 'UTC', "h:mm a", { locale: es })}
                              </span>
                            </div>
                          </div>

                          {/* Provider Info */}
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                              <AvatarImage src={appt.provider.image} />
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-bold">
                                {appt.provider.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {appt.provider.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                  {appt.provider.specialty || 'Especialista'}
                                </p>
                                {appt.provider.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                      {appt.provider.rating}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Location or Price */}
                          <div className="flex items-center justify-between">
                            {appt.location && !isVideo && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{appt.location}</span>
                              </div>
                            )}
                            {appt.priceAtBooking && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                                  ${appt.priceAtBooking}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Column */}
                        <div className="p-6 flex flex-col items-stretch justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 min-w-[200px]">
                          
                          {/* Video Call Button */}
                          {canJoinVideo && (
                            <Button 
                              onClick={() => router.push(`/video-call/${appt.id}`)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg group"
                            >
                              <Video className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Unirse a Video
                            </Button>
                          )}

                          {/* View Details */}
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/appointments/${appt.id}`)}
                            className="w-full border-gray-300 dark:border-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>

                          {/* Cancel Button */}
                          {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                            <Button
                              variant="outline"
                              onClick={() => setCancelModalState({ isOpen: true, appointment: appt })}
                              className="w-full border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          )}

                          {/* Reschedule Button */}
                          {isPast && (
                            <Button 
                              variant="outline"
                              onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.provider.name)}`)}
                              className="w-full border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Agendar de Nuevo
                            </Button>
                          )}

                          {/* Download Receipt */}
                          {appt.status === 'completed' && (
                            <Button
                              variant="ghost"
                              onClick={() => toast.info("Descargando comprobante...")}
                              className="w-full text-gray-600 dark:text-gray-400"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Comprobante
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"
            >
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {searchQuery 
                  ? 'No se encontraron citas' 
                  : activeTab === 'upcoming' 
                    ? 'No tienes citas próximas'
                    : activeTab === 'past'
                      ? 'No tienes citas pasadas'
                      : 'No tienes citas canceladas'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Busca un especialista y agenda tu próxima consulta'}
              </p>
              <Button 
                onClick={() => router.push('/discover')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buscar Especialista
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleCancelAppointment}
        title="Cancelar Cita"
        message={
          cancelModalState.appointment 
            ? `¿Estás seguro que deseas cancelar tu cita de ${cancelModalState.appointment.service.name} con ${cancelModalState.appointment.provider.name}?`
            : ''
        }
        isLoading={isCanceling}
        variant="destructive"
      />
    </div>
  );
}