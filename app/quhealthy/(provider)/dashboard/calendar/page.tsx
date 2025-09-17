/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarComponent } from '@/app/quhealthy/components/calendar/CalendarComponent';
import { OperatingHoursModal } from '@/app/quhealthy/components/calendar/OperatingHoursModal';
import { TimeBlockModal } from '@/app/quhealthy/components/calendar/TimeBlockModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CalendarEvent, OperatingHour } from '@/app/quhealthy/types/calendar'; // <-- AÑADE ESTA LÍNEA



export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [operatingHours, setOperatingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false); // <-- Nuevo estado


  // Función para obtener todos los datos del calendario
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // En el futuro, aquí llamaríamos a un endpoint que traiga citas, bloqueos, etc.
      // Por ahora, solo traemos los horarios de operación
      const hoursRes = await axios.get('/api/calendar/operating-hours', { withCredentials: true });
      setOperatingHours(hoursRes.data);

      // (Aquí añadirías la lógica para convertir citas y bloqueos a 'events')

    } catch (error) {
      toast.error("No se pudieron cargar los datos del calendario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Agenda</h1>
          <p className="text-slate-400">Gestiona tu disponibilidad y tus citas.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="border-gray-600 hover:bg-purple-500/10 hover:text-purple-300">
            <Clock className="w-4 h-4 mr-2" />
            Editar Horarios
          </Button>
            <Button onClick={() => setIsBlockModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">

            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        </div>
      </div>

      <div className="h-[70vh] bg-gray-800/50 p-4 rounded-xl border border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <CalendarComponent events={events} />
        )}
      </div>

      <OperatingHoursModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialHours={operatingHours}
        onSaveSuccess={fetchCalendarData} // Recarga los datos al guardar
      />
      <TimeBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSaveSuccess={fetchCalendarData}
      />
    </motion.div>
  );
}