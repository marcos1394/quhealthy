// types/appointment.ts

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

// El DTO que devuelve el backend (AppointmentResponse)
export interface Appointment {
  id: number;
  
  // Actores
  providerId: number;
  consumerId: number;
  
  // Servicio (Snapshot)
  serviceId: number;
  serviceName: string;
  durationMinutes?: number;
  
  // Agenda
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  
  // Modalidad
  type: AppointmentType;
  appointmentType?: AppointmentType; // Por retrocompatibilidad si lo usabas
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
  productsToDeliver?: Record<string, any>;
  
  // Extras
  consumerSymptoms?: string;
  cancellationReason?: string;
  cancelReason?: string; // Por retrocompatibilidad
  
  // Snapshots para la UI de éxito
  serviceNameSnapshot?: string;
  providerNameSnapshot?: string;
  providerPhoneSnapshot?: string;
  consumerNameSnapshot?: string;
  consumerName?: string; // Por retrocompatibilidad
  consumerEmailSnapshot?: string;
  totalPrice?: number;
  
  // Tiempos
  cancelledAt?: string; // ISO 8601
  createdAt?: string;   // ISO 8601
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