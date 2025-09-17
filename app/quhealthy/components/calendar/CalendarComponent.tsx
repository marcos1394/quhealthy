"use client";

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { es } from 'date-fns/locale/es';
import { CalendarEvent } from '@/app/quhealthy/types/calendar';

// Configuración de la localización en español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarComponentProps {
  events: CalendarEvent[];
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({ events }) => {
  return (
    <div className="h-full text-white calendar-container">
      <style jsx global>{`
        /* Calendar customization */
        .rbc-calendar {
          background: transparent;
          color: white;
          font-family: inherit;
        }

        /* Header styling */
        .rbc-header {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          color: rgb(203, 213, 225);
          padding: 12px 8px;
          border-bottom: 1px solid rgba(147, 51, 234, 0.2);
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rbc-header + .rbc-header {
          border-left: 1px solid rgba(147, 51, 234, 0.2);
        }

        /* Month view styling */
        .rbc-month-view {
          background: transparent;
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .rbc-date-cell {
          padding: 8px;
          background: rgba(30, 41, 59, 0.5);
          border-right: 1px solid rgba(147, 51, 234, 0.1);
          transition: background-color 0.2s ease;
        }

        .rbc-date-cell:hover {
          background: rgba(147, 51, 234, 0.1);
        }

        .rbc-date-cell > a {
          color: rgb(148, 163, 184);
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .rbc-date-cell > a:hover {
          color: rgb(196, 181, 253);
        }

        /* Today styling */
        .rbc-today {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%) !important;
          border: 1px solid rgba(147, 51, 234, 0.4);
        }

        .rbc-today > a {
          color: rgb(196, 181, 253) !important;
          font-weight: 700;
        }

        /* Off range dates */
        .rbc-off-range {
          color: rgb(71, 85, 105);
          background: rgba(15, 23, 42, 0.5);
        }

        .rbc-off-range-bg {
          background: rgba(15, 23, 42, 0.3);
        }

        /* Event styling */
        .rbc-event {
          background: linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          padding: 4px 8px;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
          transition: all 0.2s ease;
        }

        .rbc-event:hover {
          box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4);
          transform: translateY(-1px);
        }

        .rbc-event-continues-earlier,
        .rbc-event-continues-later {
          border-radius: 8px;
        }

        /* Toolbar styling */
        .rbc-toolbar {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
          padding: 16px 20px;
          margin-bottom: 0;
          border-bottom: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 12px 12px 0 0;
        }

        .rbc-toolbar button {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          border: 1px solid rgba(147, 51, 234, 0.3);
          color: rgb(203, 213, 225);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          margin: 0 2px;
        }

        .rbc-toolbar button:hover {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: rgba(147, 51, 234, 0.5);
          color: white;
          transform: translateY(-1px);
        }

        .rbc-toolbar button:active,
        .rbc-active {
          background: linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 100%) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
        }

        .rbc-toolbar-label {
          color: white;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          flex-grow: 1;
          background: linear-gradient(135deg, rgb(196, 181, 253) 0%, rgb(147, 197, 253) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Week and Day views */
        .rbc-time-view {
          background: transparent;
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .rbc-time-header {
          background: rgba(30, 41, 59, 0.5);
          border-bottom: 1px solid rgba(147, 51, 234, 0.2);
        }

        .rbc-time-content {
          background: rgba(15, 23, 42, 0.3);
        }

        .rbc-timeslot-group {
          border-bottom: 1px solid rgba(147, 51, 234, 0.1);
        }

        .rbc-time-slot {
          border-top: 1px solid rgba(147, 51, 234, 0.05);
        }

        .rbc-time-gutter {
          background: rgba(30, 41, 59, 0.5);
          border-right: 1px solid rgba(147, 51, 234, 0.2);
        }

        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid rgba(147, 51, 234, 0.1);
        }

        /* Time labels */
        .rbc-time-slot {
          color: rgb(148, 163, 184);
          font-size: 12px;
        }

        /* Agenda view */
        .rbc-agenda-view {
          background: transparent;
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 12px;
        }

        .rbc-agenda-view table.rbc-agenda-table {
          background: transparent;
        }

        .rbc-agenda-view tbody > tr > td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(147, 51, 234, 0.1);
          color: rgb(203, 213, 225);
        }

        .rbc-agenda-view .rbc-agenda-date-cell {
          background: rgba(30, 41, 59, 0.5);
          font-weight: 600;
          color: rgb(196, 181, 253);
        }

        .rbc-agenda-view .rbc-agenda-event-cell {
          color: white;
        }

        /* Show more button */
        .rbc-show-more {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .rbc-show-more:hover {
          background: linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 100%);
          transform: scale(1.05);
        }

        /* Current time indicator */
        .rbc-current-time-indicator {
          background: rgb(239, 68, 68);
          height: 2px;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }

        /* Selection styling */
        .rbc-slot-selection {
          background: rgba(147, 51, 234, 0.2);
          border: 2px dashed rgba(147, 51, 234, 0.5);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 12px;
          }

          .rbc-toolbar-label {
            order: -1;
            font-size: 18px;
            margin-bottom: 8px;
          }

          .rbc-btn-group {
            justify-content: center;
          }
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ 
          height: '100%',
          fontFamily: 'inherit'
        }}
        culture="es"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos programados para este período.",
          showMore: total => `+ Ver ${total} más`
        }}
        popup
        selectable
        step={30}
        showMultiDayTimes
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => {
            return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
          },
          agendaTimeRangeFormat: ({ start, end }) => {
            return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
          }
        }}
      />
    </div>
  );
};