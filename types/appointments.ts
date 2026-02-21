// types/appointment.ts

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type AppointmentType = 'IN_PERSON' | 'ONLINE';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'CASH';

// El DTO que devuelve el backend (AppointmentResponse)
export interface Appointment {
  id: number;
  consumerId: number;
  providerId: number;
  serviceId: number;
  serviceName: string;
  consumerName: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  consumerSymptoms?: string;
  cancelReason?: string;
}

// El DTO para reprogramar
export interface ReschedulePayload {
  newStartTime: string; // ISO 8601
}

// ==========================================
// INTERFAZ PARA LA UI DEL CALENDARIO
// ==========================================
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string;
  end: Date | string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    status?: string;
    clientName?: string;
    providerName?: string;
    type?: string;
    notes?: string;
  };
}