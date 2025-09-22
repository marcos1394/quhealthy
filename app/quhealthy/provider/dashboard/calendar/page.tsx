/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarComponent } from '@/app/quhealthy/components/calendar/CalendarComponent';
import { OperatingHoursModal } from '@/app/quhealthy/components/calendar/OperatingHoursModal';
import { TimeBlockModal } from '@/app/quhealthy/components/calendar/TimeBlockModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CalendarEvent, OperatingHour } from '@/app/quhealthy/types/calendar';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [operatingHours, setOperatingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Función para obtener todos los datos del calendario
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const hoursRes = await axios.get('/api/calendar/operating-hours', { withCredentials: true });
      setOperatingHours(hoursRes.data);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 space-y-8"
      >
        {/* Enhanced header section */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Mi Agenda
              </h1>
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <p className="text-slate-400 text-lg">
              Gestiona tu disponibilidad y organiza tus citas de forma inteligente
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <Button 
              onClick={() => setIsModalOpen(true)} 
              variant="outline" 
              size="lg"
              className="group border-purple-500/30 bg-gradient-to-r from-transparent to-purple-500/5 hover:from-purple-500/10 hover:to-purple-500/20 hover:border-purple-400/50 transition-all duration-300 text-purple-200 hover:text-white shadow-lg hover:shadow-purple-500/25"
            >
              <div className="p-1 bg-purple-500/20 rounded-lg mr-3 group-hover:bg-purple-500/30 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-medium">Configurar Horarios</span>
            </Button>

            <Button 
              onClick={() => setIsBlockModalOpen(true)} 
              size="lg"
              className="group bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 text-white border-0"
            >
              <div className="p-1 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-medium">Crear Evento</span>
            </Button>
          </motion.div>
        </div>

        {/* Enhanced calendar container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden">
            {/* Calendar header decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
            
            <div className="p-6 h-[75vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animate-reverse" style={{ animationDuration: '0.8s' }}></div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-purple-300 font-medium text-lg">Cargando tu agenda...</p>
                    <p className="text-slate-400 text-sm">Preparando tus eventos y configuración</p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <CalendarComponent events={events} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick stats or additional info could go here */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-4 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Horarios Configurados</p>
                <p className="text-lg font-semibold text-white">{operatingHours.length} días</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Eventos Activos</p>
                <p className="text-lg font-semibold text-white">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Settings className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Estado</p>
                <p className="text-lg font-semibold text-green-400">Activo</p>
              </div>
            </div>
          </div>
        </motion.div>

        <OperatingHoursModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialHours={operatingHours}
          onSaveSuccess={fetchCalendarData}
        />

        <TimeBlockModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onSaveSuccess={fetchCalendarData}
        />
      </motion.div>
    </div>
  );
}