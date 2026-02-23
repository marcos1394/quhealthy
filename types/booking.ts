// types/booking.ts
import { StorefrontItem } from "./storefront";

export interface CheckoutParams {
  providerId: number;
  selectedDate: Date;
  selectedTime: string; // "HH:mm"
  cart: StorefrontItem[];
}

export interface CreateAppointmentRequest {
  providerId: number;
  startTime: string; // ISO LocalDateTime
  serviceIds: number[];
  packageIds: number[];
  notes?: string;
}

export interface StripeCheckoutResponse {
  url: string; // URL de redirección a Stripe
}