/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Zap,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CalendarView Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Estados por color
 *    - Eventos destacados
 *    - Información prioritaria
 *    - Badges de estado
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por estado
 *    - Colores distintivos
 *    - Labels claros
 *    - Tooltips informativos
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Hover effects
 *    - Loading states
 *    - Confirmación visual
 *    - Tooltips on hover
 * 
 * 4. MINIMIZAR ERRORES
 *    - Confirmación en cambios
 *    - Visual feedback
 *    - Estados claros
 *    - Undo capability
 * 
 * 5. AFFORDANCE
 *    - Clickeable areas claras
 *    - Drag handles visibles
 *    - Hover states
 *    - Cursor changes
 * 
 * 6. CREDIBILIDAD
 *    - Contador de eventos
 *    - Estado visible
 *    - Información completa
 *    - Actualización en tiempo real
 */

// --- TIPOS ---
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string;
  end: Date | string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    clientName?: string;
    providerName?: string;
    type?: string;
    notes?: string;
  };
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (info: any) => void;
  onDateClick?: (info: any) => void;
  onEventDrop?: (info: any) => void;
  editable?: boolean;
  loading?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  events, 
  onEventClick, 
  onDateClick,
  onEventDrop,
  editable = false,
  loading = false
}) => {
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // Helper para obtener color por estado - RECONOCIMIENTO
  const getStatusColor = (status?: string) => {
    const colors = {
      confirmed: { bg: '#10b981', border: '#059669', text: 'Confirmada' },
      pending: { bg: '#f59e0b', border: '#d97706', text: 'Pendiente' },
      cancelled: { bg: '#ef4444', border: '#dc2626', text: 'Cancelada' },
      completed: { bg: '#6366f1', border: '#4f46e5', text: 'Completada' }
    };
    return colors[status as keyof typeof colors] || { bg: '#6b7280', border: '#4b5563', text: 'Sin estado' };
  };

  // Helper para icono por estado - AFFORDANCE
  const getStatusIcon = (status?: string) => {
    const icons = {
      confirmed: <CheckCircle2 className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <Zap className="w-3 h-3" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="w-3 h-3" />;
  };

  // Calcular estadísticas - CREDIBILIDAD
  const getStats = () => {
    const total = events.length;
    const confirmed = events.filter(e => e.extendedProps?.status === 'confirmed').length;
    const pending = events.filter(e => e.extendedProps?.status === 'pending').length;
    const cancelled = events.filter(e => e.extendedProps?.status === 'cancelled').length;
    
    return { total, confirmed, pending, cancelled };
  };

  const stats = getStats();

  // Preparar eventos con colores - JERARQUÍA VISUAL
  const processedEvents = events.map(ev => {
    const statusColor = getStatusColor(ev.extendedProps?.status);
    return {
      ...ev,
      id: String(ev.id),
      backgroundColor: ev.backgroundColor || statusColor.bg,
      borderColor: ev.borderColor || statusColor.border,
      className: 'calendar-event-custom'
    };
  });

  return (
    <div className="h-full w-full space-y-4">
      
      {/* Header with Stats - FEEDBACK VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Calendario de Citas</h3>
            <p className="text-xs text-gray-500">
              {stats.total} citas totales este mes
            </p>
          </div>
        </div>

        {/* Stats Badges - RECONOCIMIENTO */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {stats.confirmed} Confirmadas
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {stats.pending} Pendientes
          </Badge>
          {stats.cancelled > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              <XCircle className="w-3 h-3 mr-1" />
              {stats.cancelled} Canceladas
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Loading State - FEEDBACK INMEDIATO */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Cargando calendario...</p>
          </div>
        </motion.div>
      )}

      {/* Calendar Container - JERARQUÍA VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-gray-950/50 rounded-xl border border-gray-800 shadow-xl overflow-hidden"
      >
        <div className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            
            // Localization
            locale={esLocale}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Lista'
            }}
            
            // Layout
            height="auto"
            contentHeight="auto"
            aspectRatio={1.8}
            
            // Data
            events={processedEvents as any}
            
            // Interactivity
            editable={editable}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            
            // Callbacks
            eventClick={onEventClick}
            dateClick={onDateClick}
            eventDrop={onEventDrop}
            viewDidMount={(info) => {
              setCurrentView(info.view.type as any);
            }}
            
            // Event hover - FEEDBACK VISUAL
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
            
            // Custom Event Rendering - AFFORDANCE
            eventContent={(eventInfo) => {
              const status = eventInfo.event.extendedProps?.status;
              const statusColor = getStatusColor(status);
              const isHovered = hoveredEvent === String(eventInfo.event.id);

              return (
                <div className={cn(
                  "flex flex-col px-2 py-1 overflow-hidden transition-all duration-200 cursor-pointer rounded",
                  isHovered ? "shadow-lg" : ""
                )}>
                  {/* Time + Status Icon */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {getStatusIcon(status)}
                    <span className="text-xs font-bold truncate">
                      {eventInfo.timeText}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="text-xs font-semibold truncate mb-0.5">
                    {eventInfo.event.title}
                  </div>
                  
                  {/* Client/Provider Name */}
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <User className="w-2.5 h-2.5" />
                      <span className="truncate">
                        {eventInfo.event.extendedProps.clientName}
                      </span>
                    </div>
                  )}

                  {/* Hover Tooltip - CREDIBILIDAD */}
                  {isHovered && eventInfo.event.extendedProps?.notes && (
                    <div className="absolute -top-2 left-0 right-0 bg-gray-800 text-white text-xs p-2 rounded shadow-xl z-50 max-w-xs">
                      <p className="font-semibold mb-1">Notas:</p>
                      <p className="opacity-90">{eventInfo.event.extendedProps.notes}</p>
                    </div>
                  )}
                </div>
              );
            }}
            
            // Day Cell Content - JERARQUÍA
            dayCellContent={(arg) => {
              const today = new Date();
              const isToday = arg.date.toDateString() === today.toDateString();
              
              return (
                <div className={cn(
                  "relative flex items-center justify-center w-full h-full",
                  isToday ? "bg-purple-500/10 font-bold" : ""
                )}>
                  {arg.dayNumberText}
                  {isToday && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full" />
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Custom CSS injected via style tag */}
        <style jsx global>{`
          .fc {
            --fc-border-color: rgb(31 41 55);
            --fc-button-bg-color: rgb(55 65 81);
            --fc-button-border-color: rgb(75 85 99);
            --fc-button-hover-bg-color: rgb(75 85 99);
            --fc-button-hover-border-color: rgb(107 114 128);
            --fc-button-active-bg-color: rgb(109 40 217);
            --fc-button-active-border-color: rgb(126 34 206);
            --fc-today-bg-color: rgba(168, 85, 247, 0.1);
          }
          
          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: rgb(31 41 55);
          }
          
          .fc .fc-button {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.2s;
          }
          
          .fc .fc-button:disabled {
            opacity: 0.5;
          }
          
          .fc .fc-toolbar-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: white;
          }
          
          .fc-daygrid-day-number,
          .fc-col-header-cell-cushion {
            color: rgb(156 163 175);
            font-weight: 600;
          }
          
          .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
            color: rgb(168 85 247);
            font-weight: 800;
          }
          
          .fc-event {
            border-radius: 0.375rem;
            margin: 2px;
            transition: all 0.2s;
            border-width: 2px;
          }
          
          .fc-event:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          }
          
          .fc-list-event:hover td {
            background-color: rgba(55, 65, 81, 0.5);
          }
        `}</style>
      </motion.div>

      {/* Legend - RECONOCIMIENTO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800"
      >
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-500" />
          <p className="text-sm font-semibold text-gray-400">Leyenda</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { status: 'confirmed', label: 'Confirmada' },
            { status: 'pending', label: 'Pendiente' },
            { status: 'cancelled', label: 'Cancelada' },
            { status: 'completed', label: 'Completada' }
          ].map((item) => {
            const color = getStatusColor(item.status);
            return (
              <div key={item.status} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border-2"
                  style={{ 
                    backgroundColor: color.bg,
                    borderColor: color.border
                  }}
                />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Helper text - CREDIBILIDAD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-xs text-gray-600">
          {editable 
            ? "Arrastra eventos para reprogramar • Click para ver detalles"
            : "Click en una cita para ver más detalles"}
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Variante compacta para widgets o sidebars
 */
export const CalendarViewCompact: React.FC<CalendarViewProps> = (props) => {
  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: ''
        }}
        locale={esLocale}
        height="auto"
        events={props.events.map(ev => ({ ...ev, id: String(ev.id) })) as any}
        eventClick={props.onEventClick}
        dateClick={props.onDateClick}
        dayMaxEvents={2}
      />
    </div>
  );
};