/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

// --- TIPOS ---
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string; // FullCalendar acepta ISO strings
  end: Date | string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    status?: string;
    clientName?: string;
  };
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (info: any) => void;
  onDateClick?: (info: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, onDateClick }) => {
  
  return (
    <div className="h-full w-full bg-gray-950/50 rounded-xl border border-gray-800 p-4 shadow-sm overflow-hidden">
      
      {/* --- ESTILOS PERSONALIZADOS (FULLCALENDAR DARK THEME) --- */}
      <style jsx global>{`
        :root {
          --fc-border-color: #1f2937; /* gray-800 */
          --fc-daygrid-event-dot-width: 8px;
          --fc-list-event-dot-width: 8px;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #111827; /* gray-900 */
          --fc-neutral-text-color: #9ca3af; /* gray-400 */
          --fc-today-bg-color: rgba(139, 92, 246, 0.1); /* purple-500/10 */
          --fc-now-indicator-color: #8b5cf6; /* purple-500 */
        }

        /* Botones del Toolbar */
        .fc .fc-button-primary {
          background-color: #1f2937; /* gray-800 */
          border-color: #374151; /* gray-700 */
          color: #e5e7eb; /* gray-200 */
          font-weight: 500;
          text-transform: capitalize;
          transition: all 0.2s;
        }
        .fc .fc-button-primary:hover {
          background-color: #374151; /* gray-700 */
          border-color: #4b5563; /* gray-600 */
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #7c3aed; /* purple-600 */
          border-color: #7c3aed;
          color: white;
        }
        
        /* Título del Toolbar */
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        /* Celdas y Encabezados */
        .fc .fc-col-header-cell-cushion {
          color: #d1d5db; /* gray-300 */
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 8px 0;
        }
        .fc .fc-daygrid-day-number {
          color: #9ca3af; /* gray-400 */
          font-size: 0.875rem;
          padding: 8px;
        }
        
        /* Eventos */
        .fc-event {
          cursor: pointer;
          border-radius: 4px;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.1s;
        }
        .fc-event:hover {
          transform: scale(1.01);
          filter: brightness(1.1);
        }
        
        /* Vista de Tiempo (TimeGrid) */
        .fc .fc-timegrid-slot-label-cushion {
          color: #6b7280; /* gray-500 */
          font-size: 0.75rem;
        }
        .fc-timegrid-event-harness {
            margin-left: 2px;
        }

        /* Vista de Lista */
        .fc-list {
            border: none;
        }
        .fc-list-day-cushion {
            background-color: #1f2937 !important; /* gray-800 */
        }
        .fc-list-event:hover td {
            background-color: #374151 !important; /* gray-700 */
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        locale={esLocale}
        height="100%"
        contentHeight="auto"
        aspectRatio={1.8}
        
        // --- Datos y Eventos ---
                events={events.map(ev => ({ ...ev, id: String(ev.id) })) as any}
                editable={true} // Cambiar a true si quieres Drag & Drop
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
        
        // --- Callbacks ---
        eventClick={onEventClick}
        dateClick={onDateClick}
        
        // --- Renderizado Custom de Eventos (Opcional para más detalle) ---
        eventContent={(eventInfo) => (
          <div className="flex flex-col px-1 py-0.5 overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold truncate">
                {eventInfo.timeText}
              </span>
            </div>
            <div className="text-xs truncate font-medium">
              {eventInfo.event.title}
            </div>
          </div>
        )}
        
        // --- Clases para Tailwind ---
        // FullCalendar maneja bien las clases pero inyectamos variables CSS arriba
        // para el control fino del tema oscuro.
      />
    </div>
  );
};