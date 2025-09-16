"use client";

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import {es} from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/app/quhealthy/types/calendar'; // <-- Importamos el tipo centralizado

// Configuración de la localización en español
const locales = {
  'es': es,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes como inicio de semana
  getDay,
  locales,
});

interface CalendarComponentProps {
  events: CalendarEvent[];
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({ events }) => (
  <div className="h-full text-white">
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '100%' }}
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
          noEventsInRange: "No hay eventos en este rango.",
          showMore: total => `+ Ver más (${total})`
      }}
    />
  </div>
);