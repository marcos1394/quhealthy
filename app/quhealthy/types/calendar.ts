/* eslint-disable @typescript-eslint/no-explicit-any */
// Este es el tipo para un evento genérico que se mostrará en el calendario
export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: {
    type: 'appointment' | 'block'; // Para diferenciar visualmente
    [key: string]: any; // Para datos adicionales
  };
}

// Este es el tipo para los horarios de operación que vienen del backend
export interface OperatingHour {
  id: number;
  provider_id: number;
  day_of_week: number; // 0=Domingo, 1=Lunes, etc.
  open_time: string;   // Formato "HH:MM:SS"
  close_time: string;  // Formato "HH:MM:SS"
}