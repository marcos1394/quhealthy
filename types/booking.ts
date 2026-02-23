// types/booking.ts
import { StorefrontItem } from "./storefront";

export interface CheckoutParams {
  providerId: number;
  selectedDate: Date;
  selectedTime: string; // "HH:mm"
  cart: StorefrontItem[];
}

// types/booking.ts

export interface CreateAppointmentRequest {
  providerId: number;
  serviceId: number;      // 🚀 Cambiado de array a Long único
  startTime: string;      // ISO LocalDateTime
  appointmentType: 'IN_PERSON' | 'ONLINE'; // 🚀 Obligatorio
  paymentMethod: 'CREDIT_CARD' | 'CASH' | 'TRANSFER'; // 🚀 Obligatorio
  consumerSymptoms?: string; // 🚀 En lugar de 'notes'
}

export interface StripeCheckoutResponse {
  url: string; // URL de redirección a Stripe
}