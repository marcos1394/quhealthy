/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Calendar as CalendarIcon, Clock, Plus, Loader2, Settings, 
  Link as LinkIcon, CheckCircle 
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Componentes del Calendario (Rutas Limpias)
import { CalendarView, CalendarEvent } from '@/components/dashboard/CalendarView';
import { OperatingHoursModal, OperatingHour } from '@/components/dashboard/OperatingHours';
import { TimeBlockModal } from '@/components/dashboard/TimeBlockModal';

// Hooks & Stores
import { useSessionStore } from '@/stores/SessionStore';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { user, fetchSession } = useSessionStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- FETCH DATA ---
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener Horarios de Operación
      const hoursRes = await axios.get('/api/calendar/operating-hours', { withCredentials: true });
      setOperatingHours(hoursRes.data);

      // 2. Obtener Eventos (Citas + Bloqueos)
      const eventsRes = await axios.get('/api/calendar/events', { withCredentials: true });
      
      // Transformar datos para FullCalendar
      const formattedEvents = eventsRes.data.map((evt: any) => ({
        id: evt.id,
        title: evt.title || evt.serviceName, // Adaptar según tu API
        start: evt.startTime,
        end: evt.endTime,
        backgroundColor: evt.type === 'BLOCK' ? '#ef4444' : '#8b5cf6', // Rojo para bloqueos, morado para citas
        borderColor: 'transparent'
      }));
      
      setEvents(formattedEvents);

    } catch (error) {
      console.error(error);
      // En producción mostramos error, en desarrollo podríamos cargar mocks si falla
      // toast.error("No se pudo cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // --- GOOGLE CALENDAR SYNC HANDLING ---
  useEffect(() => {
    const syncStatus = searchParams.get('sync');
    if (syncStatus === 'success') {
      toast.success("¡Google Calendar conectado exitosamente!");
      fetchSession(); // Recargar usuario para actualizar estado
      router.replace('/dashboard/calendar'); // Limpiar URL
    } else if (syncStatus === 'error') {
      toast.error("Error al conectar con Google.");
      router.replace('/dashboard/calendar');
    }
  }, [searchParams, router, fetchSession]);

  const handleGoogleConnect = async () => {
    try {
      const { data } = await axios.get('/api/google/calendar/auth', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión.");
    }
  };

  const isGoogleConnected = !!(user as any)?.google_calendar_id;

  // --- HANDLERS ---
  const handleDateClick = (info: any) => {
    // Al hacer click en un día, abrimos el modal para bloquear tiempo en esa fecha
    setSelectedDate(new Date(info.date));
    setIsBlockModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8"
      >
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              Mi Agenda
            </h1>
            <p className="text-gray-400">Gestiona tu disponibilidad y eventos.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setIsHoursModalOpen(true)} 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              Configurar Horarios
            </Button>

            <Button 
              onClick={() => { setSelectedDate(undefined); setIsBlockModalOpen(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bloquear Tiempo
            </Button>
          </div>
        </div>

        {/* --- GOOGLE INTEGRATION CARD --- */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg">
                    {/* Placeholder si no tienes la imagen local, usa texto o icono */}
                    <span className="text-xl font-bold text-blue-500">G</span> 
                </div>
                <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                        Google Calendar
                        {isGoogleConnected && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Activo</span>}
                    </h3>
                    <p className="text-sm text-gray-400">Sincroniza tus eventos para evitar conflictos.</p>
                </div>
            </div>
            
            {isGoogleConnected ? (
                <Button variant="ghost" disabled className="text-green-500 hover:text-green-400 hover:bg-green-500/10">
                    <CheckCircle className="w-4 h-4 mr-2" /> Sincronizado
                </Button>
            ) : (
                <Button onClick={handleGoogleConnect} variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">
                    <LinkIcon className="w-4 h-4 mr-2" /> Conectar Cuenta
                </Button>
            )}
        </div>

        {/* --- CALENDARIO --- */}
        <div className="h-[75vh] min-h-[600px] relative">
            {loading && events.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 z-10 rounded-xl backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-gray-400 animate-pulse">Cargando agenda...</p>
                </div>
            ) : null}
            
            <CalendarView 
                events={events} 
                onDateClick={handleDateClick}
                onEventClick={(info) => toast.info(`Evento: ${info.event.title}`)}
            />
        </div>

        {/* --- QUICK STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800 p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Horario Configurado</p>
                    <p className="text-xl font-bold text-white">{operatingHours.filter((h: any) => h.isActive || h.day_of_week !== undefined).length} días/sem</p>
                </div>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                    <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Eventos Totales</p>
                    <p className="text-xl font-bold text-white">{events.length}</p>
                </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Estado del Sistema</p>
                    <p className="text-xl font-bold text-emerald-400">Operativo</p>
                </div>
            </Card>
        </div>

        {/* --- MODALES --- */}
        <OperatingHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => setIsHoursModalOpen(false)}
            initialHours={operatingHours}
            onSaveSuccess={fetchCalendarData}
        />

        <TimeBlockModal
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            onSaveSuccess={fetchCalendarData}
            initialDate={selectedDate} // Pasamos la fecha clickeada
        />

      </motion.div>
    </div>
  );
}