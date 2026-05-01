// src/types/appointment.ts

// ==========================================
// ENUMS Y TIPOS LITERALES (Backend Match)
// ==========================================

export type AppointmentStatus = 
  | 'PENDING' 
  | 'PENDING_PAYMENT' 
  | 'PENDING_APPROVAL' 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELED_BY_CONSUMER' 
  | 'CANCELED_BY_PROVIDER' 
  | 'NO_SHOW' 
  | 'RESCHEDULED' 
  | 'WAITING_ROOM';

export type AppointmentType = 'IN_PERSON' | 'ONLINE' | 'HOME_VISIT';

export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'CASH' | 'PACKAGE_BALANCE';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PENDING_PAYMENT' 
  | 'SETTLED' 
  | 'REFUNDED' 
  | 'REFUND_PENDING' 
  | 'FAILED';

// ==========================================
// INTERFACES DE DOMINIO (Entidades)
// ==========================================

/**
 * Representa una cita completa tal cual llega del Backend.
 * Incluye snapshots para evitar joins costosos en la UI.
 */
export interface Appointment {
  id: number;
  
  // Actores
  providerId: number;
  consumerId: number;
  patientDirectoryId?: number; // 🚀 NUEVO: ID del paciente en el directorio local del doctor
  
  // Servicio (Snapshot)
  serviceId: number;
  serviceName: string;
  durationMinutes?: number;
  
  // Agenda
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  
  // Modalidad
  type: AppointmentType;
  appointmentType?: AppointmentType; // Retrocompatibilidad
  meetLink?: string;
  locationAddress?: string;
  
  // Estados
  status: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  
  // Finanzas
  price?: number;
  amountPaid?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  
  // Paquetes & Productos
  packageReferenceId?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productsToDeliver?: Record<string, any>;
  
  // Extras / Notas
  consumerSymptoms?: string;
  cancellationReason?: string;
  cancelReason?: string; // Retrocompatibilidad
  
  // Snapshots para la UI (Campos calculados o nombres directos)
  serviceNameSnapshot?: string;
  providerNameSnapshot: string; // 🚀 Requerido, el backend siempre lo debe mandar
  providerPhoneSnapshot?: string;
  consumerNameSnapshot?: string;
  consumerName?: string; // Retrocompatibilidad
  consumerEmailSnapshot?: string;
  totalPrice?: number;
  
  // 🚀 NUEVOS: Datos visuales del Doctor para la UI del Paciente
  providerImageUrl?: string;
  providerSpecialty?: string;
  providerRating?: number;
  
  // Tiempos de sistema
  cancelledAt?: string; // ISO 8601
  createdAt?: string;   // ISO 8601

  // Relaciones anidadas (si el endpoint las incluye)
  provider?: {
    name: string;
    image?: string;
    specialty?: string;
  };
  consumer?: {
    name: string;
    email?: string;
  };
}

// 🚀 ALIAS: Para que coincida exactamente con el nombre del DTO en Java
export type AppointmentResponse = Appointment;

/**
 * Estructura específica para la lista detallada del Proveedor/Doctor
 */
export interface ProviderAppointment {
  id: number;
  status: AppointmentStatus; // O string, dependiendo de cómo manejes el enum en TS
  startTime: string; 
  endTime: string;
  arrivedAt?: string; // 🚀 NUEVO: Hora en la que llegó a sala de espera
  startedAt?: string; // 🚀 NUEVO: Hora en la que inició la consulta
  provider: { 
    name: string; 
  };
  consumer: { 
    name: string; 
  };
  service: { 
    name: string;
    serviceDeliveryType: 'IN_PERSON' | 'ONLINE' | string; 
  };
}

// ==========================================
// PAYLOADS (Peticiones al API)
// ==========================================

export interface ReschedulePayload {
  newStartTime: string; // ISO 8601
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ==========================================
// INTERFAZ PARA LA UI DEL CALENDARIO (FullCalendar/Custom)
// ==========================================

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string;
  end: Date | string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
  
  extendedProps?: {
    status?: string; 
    rawStatus?: AppointmentStatus; 
    clientName?: string;
    providerName?: string;
    type?: AppointmentType; 
    notes?: string;
    modality?: AppointmentType;
    paymentStatus?: PaymentStatus;
  };
}