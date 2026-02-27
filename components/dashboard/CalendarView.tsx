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
  XCircle, AlertCircle, Zap, Info, Loader2, Trash2,
  CalendarDays, Video, MapPin
} from "lucide-react";
import { toast } from 'react-toastify';

// 🚀 IMPORTAMOS EL HOOK
import { useAppointments } from '@/hooks/useAppointment';
import { CalendarEvent } from '@/types/appointments';

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
    const newStartTime = info.event.start.toISOString();

    const success = await reschedule(appointmentId, newStartTime);
    
    if (!success) {
      info.revert();
    } else {
      loadEvents();
    }
  };

  // 5. CANCELAR CITA
  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    
    setIsCancelling(true);
    const success = await cancel(Number(selectedEvent.id), "Cancelado por el proveedor");
    
    if (success) {
      setSelectedEvent(null);
      loadEvents(); 
    }
    setIsCancelling(false);
  };

  // --- 🎨 ESTILOS APPLE-LIKE PARA LOS EVENTOS ---
  const getStatusTheme = (status?: string) => {
    const themes = {
      confirmed: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399', label: 'Confirmada' },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24', label: 'Pendiente' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#f87171', label: 'Cancelada' },
      completed: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#818cf8', label: 'Completada' }
    };
    return themes[status as keyof typeof themes] || { bg: 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: '#9ca3af', label: 'Sin estado' };
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
  };

  // Inyectamos los colores translúcidos a FullCalendar
  const processedEvents = events.map(ev => {
    const theme = getStatusTheme(ev.extendedProps?.status);
    return {
      ...ev,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      textColor: theme.text,
      className: 'apple-calendar-event'
    };
  });

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      
      {/* 🚀 HEADER DE ESTADÍSTICAS RÁPIDAS */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> {stats.confirmed} Confirmadas
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-sm font-medium">
            <Clock className="w-4 h-4 mr-1.5" /> {stats.pending} Pendientes
          </Badge>
        </div>
      </motion.div>

      {/* 🚀 CONTENEDOR PRINCIPAL DEL CALENDARIO */}
      <div className="relative flex-1 bg-gray-950/40 rounded-2xl border border-gray-800/60 shadow-inner overflow-hidden flex flex-col">
        
        {/* Loader Overlays */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-950/50 backdrop-blur-[2px] flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-300 font-medium">Sincronizando agenda...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 flex-1 calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            locale={esLocale}
            buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Agenda' }}
            height="100%"
            allDaySlot={false} // Oculta la fila de "todo el día" para más limpieza
            slotMinTime="07:00:00" // Empieza a una hora razonable
            slotMaxTime="22:00:00"
            expandRows={true}
            stickyHeaderDates={true}
            nowIndicator={true} // La línea roja de la hora actual
            
            // Datos e interactividad
            events={processedEvents as any}
            editable={true}
            droppable={true}
            selectable={true}
            dayMaxEvents={4}
            
            // Callbacks
            eventDrop={handleEventDrop}
            eventClick={(info) => {
              const clickedEvent = events.find(e => String(e.id) === String(info.event.id));
              if (clickedEvent) setSelectedEvent(clickedEvent);
            }}
            viewDidMount={(info) => setCurrentView(info.view.type as any)}
            
            // 🎨 Custom Rendering UI (El secreto del Look Apple/Cron)
            eventMouseEnter={(info) => setHoveredEvent(String(info.event.id))}
            eventMouseLeave={() => setHoveredEvent(null)}
            eventContent={(eventInfo) => {
              const theme = getStatusTheme(eventInfo.event.extendedProps?.status);
              const isHovered = hoveredEvent === String(eventInfo.event.id);
              const isMonthView = eventInfo.view.type === 'dayGridMonth';

              if (isMonthView) {
                // Vista de mes: Minimalista, solo un puntito y el título
                return (
                  <div className="flex items-center gap-1.5 overflow-hidden px-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.border }} />
                    <span className="text-xs font-medium truncate" style={{ color: theme.text }}>
                      {eventInfo.timeText} {eventInfo.event.title}
                    </span>
                  </div>
                );
              }

              // Vista de Semana/Día: Píldoras ricas en datos
              return (
                <div 
                  className={cn(
                    "flex flex-col h-full px-2 py-1 overflow-hidden transition-all duration-200",
                    isHovered ? "opacity-100" : "opacity-90"
                  )}
                  style={{ borderLeft: `3px solid ${theme.border}` }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.text }}>
                      {eventInfo.timeText}
                    </span>
                    {getStatusIcon(eventInfo.event.extendedProps?.status)}
                  </div>
                  <div className="text-xs font-bold leading-tight truncate text-white mb-1">
                    {eventInfo.event.title}
                  </div>
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: theme.text }}>
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* 🎨 CSS INYECTADO PARA EL TEMA OSCURO PREMIUM */}
        <style jsx global>{`
          .calendar-container {
            /* Variables maestras de FullCalendar */
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: rgba(31, 41, 55, 0.4);
            --fc-neutral-text-color: #9ca3af;
            --fc-border-color: rgba(55, 65, 81, 0.3); /* Bordes super sutiles */
            
            /* Botones del Header */
            --fc-button-text-color: #d1d5db;
            --fc-button-bg-color: rgba(31, 41, 55, 0.5);
            --fc-button-border-color: rgba(75, 85, 99, 0.4);
            --fc-button-hover-bg-color: rgba(55, 65, 81, 0.8);
            --fc-button-hover-border-color: rgba(107, 114, 128, 0.5);
            --fc-button-active-bg-color: rgba(168, 85, 247, 0.2);
            --fc-button-active-border-color: rgba(168, 85, 247, 0.5);
            
            /* Indicador de "Ahora" */
            --fc-now-indicator-color: #ec4899; /* Rosa vibrante */
          }

          /* Limpieza de bordes feos */
          .fc-theme-standard .fc-scrollgrid { border: none !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color); }
          .fc-scrollgrid-section-header > th { border-top: none !important; border-left: none !important; border-right: none !important; }
          
          /* Tipografía del Header (Días de la semana) */
          .fc-col-header-cell-cushion { 
            padding: 12px 4px !important; 
            font-size: 0.85rem; 
            font-weight: 600; 
            color: #9ca3af; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
          }
          .fc-day-today .fc-col-header-cell-cushion { color: #a855f7; font-weight: 800; }
          
          /* El Título (Mes / Año) */
          .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 800; color: white; letter-spacing: -0.02em; }
          
          /* Los Botones */
          .fc .fc-button-primary { border-radius: 8px; font-weight: 500; text-transform: capitalize; transition: all 0.2s ease; backdrop-filter: blur(4px); }
          .fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active {
            background-color: rgba(147, 51, 234, 0.2) !important; color: #c084fc !important; border-color: rgba(147, 51, 234, 0.3) !important;
          }

          /* Píldoras de Eventos */
          .apple-calendar-event {
            border: none !important;
            border-radius: 6px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            backdrop-filter: blur(4px);
            margin: 1px 2px !important;
          }
          
          /* Línea de tiempo actual */
          .fc-timegrid-now-indicator-line { border-width: 2px; }
          .fc-timegrid-now-indicator-arrow { border-width: 5px; border-color: var(--fc-now-indicator-color) transparent transparent transparent; }
        `}</style>
      </div>

      {/* 🚀 LEYENDA SUTIL */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {[{ status: 'confirmed' }, { status: 'pending' }, { status: 'completed' }].map((item) => {
          const theme = getStatusTheme(item.status);
          return (
            <div key={item.status} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.border, boxShadow: `0 0 8px ${theme.border}40` }} />
              <span className="text-xs font-medium text-gray-400">{theme.label}</span>
            </div>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* 🚀 MODAL DE DETALLES TIPO POPOVER (GLASSMORPHISM) */}
      {/* ========================================== */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 shadow-2xl text-white sm:max-w-md rounded-2xl overflow-hidden">
          {selectedEvent && (
            <>
              {/* Cinta de color superior según estado */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).border }} />
              
              <DialogHeader className="pt-4">
                <DialogTitle className="text-xl font-black text-white">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm font-medium flex items-center gap-1.5 mt-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  ID Reserva: #{selectedEvent.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                
                {/* Paciente y Horario */}
                <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Paciente</p>
                      <p className="text-sm font-bold text-white">{selectedEvent.extendedProps?.clientName || 'Paciente Nuevo'}</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-800/50" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-300">
                        {new Date(selectedEvent.start).toLocaleString('es-MX', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).bg,
                        color: getStatusTheme(selectedEvent.extendedProps?.status).border,
                        borderColor: getStatusTheme(selectedEvent.extendedProps?.status).border
                      }}
                      className="border-opacity-30 px-2 py-0.5"
                    >
                      {getStatusTheme(selectedEvent.extendedProps?.status).label}
                    </Badge>
                  </div>
                </div>

                {/* Modalidad y Notas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-950/50 rounded-xl p-3 border border-gray-800/60 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Modalidad</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      {selectedEvent.extendedProps?.modality === 'ONLINE' ? <Video className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-emerald-400" />}
                      <span className="font-medium">{selectedEvent.extendedProps?.modality === 'ONLINE' ? 'Videollamada' : 'En Clínica'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-950/50 rounded-xl p-3 border border-gray-800/60 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pago</p>
                    <p className="text-sm font-medium text-white">
                      {selectedEvent.extendedProps?.paymentStatus === 'SETTLED' ? 'Pagado' : 'Pendiente'}
                    </p>
                  </div>
                </div>

                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1.5">Notas del Paciente</p>
                    <p className="text-sm text-purple-100/90 leading-relaxed">{selectedEvent.extendedProps.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-3 sm:justify-between w-full pt-2">
                {selectedEvent.extendedProps?.status === 'confirmed' || selectedEvent.extendedProps?.status === 'pending' ? (
                  <Button 
                    variant="ghost" 
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="w-full sm:w-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Cancelar Cita
                  </Button>
                ) : (
                  <div /> // Espaciador para alinear el botón de cerrar a la derecha
                )}
                <Button 
                  onClick={() => setSelectedEvent(null)} 
                  className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-200 font-bold rounded-xl"
                >
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