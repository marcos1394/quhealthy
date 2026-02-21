// components/provider/calendar/CalendarView.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { 
  Calendar as CalendarIcon, Clock, User, CheckCircle2, 
  XCircle, AlertCircle, ChevronLeft, ChevronRight, 
  List, Grid, Zap, Info, Loader2, X, Trash2
} from "lucide-react";
import { toast } from 'react-toastify';

// 🚀 IMPORTAMOS EL HOOK
import { useAppointments } from '@/hooks/useAppointment';
import { CalendarEvent } from '@/types/appointments'; // Asegúrate de exportar la interfaz en tu archivo de tipos

// ShadCN UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const CalendarView: React.FC = () => {
  // 1. 🔌 CONEXIÓN CON EL BACKEND
  const { fetchAppointments, reschedule, cancel, isLoading } = useAppointments();
  
  // 2. ESTADOS LOCALES
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('timeGridWeek');
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  
  // Estado para el modal de detalles de la cita
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // 3. CARGA INICIAL DE DATOS
  const loadEvents = useCallback(async () => {
    const data = await fetchAppointments();
    setEvents(data);
  }, [fetchAppointments]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 4. LÓGICA DE NEGOCIO (DRAG & DROP)
  const handleEventDrop = async (info: any) => {
    const appointmentId = Number(info.event.id);
    const newStartTime = info.event.start.toISOString(); // Formato esperado por Java

    // Optimizamos la UI asumiendo que el cambio será exitoso (Optimistic Update)
    const success = await reschedule(appointmentId, newStartTime);
    
    if (!success) {
      // Si el backend falla (ej. validación de horario), regresamos la tarjeta a su lugar
      info.revert();
    } else {
      // Recargamos silenciosamente para asegurar sincronía
      loadEvents();
    }
  };

  // 5. CANCELAR CITA
  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    
    setIsCancelling(true);
    // Hardcodeamos la razón por ahora, pero podrías agregar un Input en el Modal
    const success = await cancel(Number(selectedEvent.id), "Cancelado por el proveedor");
    
    if (success) {
      setSelectedEvent(null);
      loadEvents(); // Recargamos el calendario
    }
    setIsCancelling(false);
  };

  // --- HELPERS UI ---
  const getStatusColor = (status?: string) => {
    const colors = {
      confirmed: { bg: '#10b981', border: '#059669', text: 'Confirmada' },
      pending: { bg: '#f59e0b', border: '#d97706', text: 'Pendiente' },
      cancelled: { bg: '#ef4444', border: '#dc2626', text: 'Cancelada' },
      completed: { bg: '#6366f1', border: '#4f46e5', text: 'Completada' }
    };
    return colors[status as keyof typeof colors] || { bg: '#6b7280', border: '#4b5563', text: 'Sin estado' };
  };

  const getStatusIcon = (status?: string) => {
    const icons = {
      confirmed: <CheckCircle2 className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <Zap className="w-3 h-3" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="w-3 h-3" />;
  };

  const stats = {
    total: events.length,
    confirmed: events.filter(e => e.extendedProps?.status === 'confirmed').length,
    pending: events.filter(e => e.extendedProps?.status === 'pending').length,
    cancelled: events.filter(e => e.extendedProps?.status === 'cancelled').length,
  };

  const processedEvents = events.map(ev => {
    const statusColor = getStatusColor(ev.extendedProps?.status);
    return {
      ...ev,
      backgroundColor: ev.backgroundColor || statusColor.bg,
      borderColor: ev.borderColor || statusColor.border,
      className: 'calendar-event-custom'
    };
  });

  return (
    <div className="h-full w-full space-y-4">
      
      {/* HEADER DE ESTADÍSTICAS */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Calendario de Citas</h3>
            <p className="text-xs text-gray-500">{stats.total} citas este mes</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> {stats.confirmed} Confirmadas
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" /> {stats.pending} Pendientes
          </Badge>
        </div>
      </motion.div>

      {/* CONTENEDOR PRINCIPAL DEL CALENDARIO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative bg-gray-950/50 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
        
        {/* Loader Overlays */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-400 font-medium animate-pulse">Sincronizando agenda...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            locale={esLocale}
            buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' }}
            height="auto"
            contentHeight="auto"
            aspectRatio={1.8}
            
            // 🚀 Inyección de datos
            events={processedEvents as any}
            
            // 🚀 Interactividad
            editable={true} // Permite arrastrar (Drag & Drop)
            droppable={true}
            selectable={true}
            dayMaxEvents={3}
            
            // 🚀 Callbacks conectados al Hook
            eventDrop={handleEventDrop} // <--- SE DISPARA AL ARRASTRAR
            eventClick={(info) => {
              // Extraer datos del evento clickeado para el Modal
              const clickedEvent = events.find(e => String(e.id) === String(info.event.id));
              if (clickedEvent) setSelectedEvent(clickedEvent);
            }}
            viewDidMount={(info) => setCurrentView(info.view.type as any)}
            
            // Custom Rendering UI
            eventMouseEnter={(info) => {
              setHoveredEvent(String(info.event.id));
              info.el.style.transform = 'scale(1.02)';
              info.el.style.zIndex = '100';
            }}
            eventMouseLeave={(info) => {
              setHoveredEvent(null);
              info.el.style.transform = 'scale(1)';
              info.el.style.zIndex = '1';
            }}
            eventContent={(eventInfo) => {
              const status = eventInfo.event.extendedProps?.status;
              const isHovered = hoveredEvent === String(eventInfo.event.id);

              return (
                <div className={cn("flex flex-col px-2 py-1 overflow-hidden transition-all duration-200 cursor-pointer rounded", isHovered ? "shadow-lg" : "")}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {getStatusIcon(status)}
                    <span className="text-xs font-bold truncate">{eventInfo.timeText}</span>
                  </div>
                  <div className="text-xs font-semibold truncate mb-0.5">{eventInfo.event.title}</div>
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <User className="w-2.5 h-2.5" />
                      <span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
            dayCellContent={(arg) => {
              const today = new Date();
              const isToday = arg.date.toDateString() === today.toDateString();
              return (
                <div className={cn("relative flex items-center justify-center w-full h-full", isToday ? "bg-purple-500/10 font-bold" : "")}>
                  {arg.dayNumberText}
                  {isToday && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full" />}
                </div>
              );
            }}
          />
        </div>

        {/* Custom CSS Inyectado */}
        <style jsx global>{`
          .fc { --fc-border-color: rgb(31 41 55); --fc-button-bg-color: rgb(55 65 81); --fc-button-border-color: rgb(75 85 99); --fc-button-hover-bg-color: rgb(75 85 99); --fc-button-active-bg-color: rgb(109 40 217); --fc-today-bg-color: rgba(168, 85, 247, 0.1); }
          .fc-theme-standard td, .fc-theme-standard th { border-color: rgb(31 41 55); }
          .fc .fc-button { font-size: 0.875rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; text-transform: capitalize; }
          .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 800; color: white; text-transform: capitalize; }
          .fc-daygrid-day-number, .fc-col-header-cell-cushion { color: rgb(156 163 175); font-weight: 600; }
          .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { color: rgb(168 85 247); font-weight: 800; }
          .fc-event { border-radius: 0.375rem; margin: 2px; border-width: 2px; cursor: pointer; }
        `}</style>
      </motion.div>

      {/* LEYENDA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-500" />
          <p className="text-sm font-semibold text-gray-400">Leyenda interactiva</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ status: 'confirmed', label: 'Confirmada' }, { status: 'pending', label: 'Pendiente' }, { status: 'cancelled', label: 'Cancelada' }, { status: 'completed', label: 'Completada' }].map((item) => {
            const color = getStatusColor(item.status);
            return (
              <div key={item.status} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: color.bg, borderColor: color.border }} />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
      <p className="text-xs text-center text-gray-600 mt-2">Arrastra los eventos para reprogramarlos fácilmente.</p>

      {/* ========================================== */}
      {/* 🚀 MODAL DE DETALLES DE LA CITA */}
      {/* ========================================== */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-purple-400" />
                  Detalles de la Cita
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  ID de Reserva: #{selectedEvent.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Servicio</span>
                    <span className="text-sm font-bold text-white">{selectedEvent.title}</span>
                  </div>
                  <Separator className="bg-gray-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Paciente</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedEvent.extendedProps?.clientName || 'Desconocido'}
                    </span>
                  </div>
                  <Separator className="bg-gray-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fecha y Hora</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(selectedEvent.start).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <Separator className="bg-gray-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estado</span>
                    <Badge style={{ backgroundColor: getStatusColor(selectedEvent.extendedProps?.status).bg }}>
                      {getStatusColor(selectedEvent.extendedProps?.status).text}
                    </Badge>
                  </div>
                </div>

                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-blue-400 font-bold uppercase mb-1">Notas del Paciente</p>
                    <p className="text-sm text-blue-100">{selectedEvent.extendedProps.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 sm:justify-between w-full">
                {selectedEvent.extendedProps?.status !== 'cancelled' && selectedEvent.extendedProps?.status !== 'completed' ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="w-full sm:w-auto bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30"
                  >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Cancelar Cita
                  </Button>
                ) : (
                  <div /> // Espaciador
                )}
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 text-white">
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};