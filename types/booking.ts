// types/booking.ts
import { StorefrontItem } from "./storefront";

export interface CheckoutParams {
  providerId: number;
  consumerId?: number; 
  dependentId?: number | null; 
  selectedDate: Date | null; // 🚀 Ahora acepta null si son solo productos
  selectedTime: string | null; // 🚀 Ahora acepta null si son solo productos
  cart: StorefrontItem[];
  consumerSymptoms?: string; 
  shippingAddress?: string; // 🚀 NUEVO: Para enviar productos físicos
}

export interface CreateAppointmentRequest {
  providerId: number;
  consumerId?: number; 
  dependentId?: number | null; 
  serviceId: number;      
  startTime: string;      
  appointmentType: 'IN_PERSON' | 'ONLINE'; 
  paymentMethod: 'CREDIT_CARD' | 'CASH' | 'TRANSFER'; 
  consumerSymptoms?: string; 
}

export interface StripeCheckoutResponse {
  url: string; 
}

// 🚀 NUEVOS TIPOS PARA EL CHECKOUT HÍBRIDO (Para que coincida con el backend)
export interface CartItemRequest {
  catalogItemId: number;
  itemType: string;
  quantity: number;
  startTime?: string | null;
  appointmentType?: string;
}

export interface CheckoutHybridRequest {
  providerId: number;
  consumerId?: number;
  dependentId?: number | null;
  paymentMethod: string;
  consumerSymptoms?: string;
  shippingAddress?: string;
  cartItems: CartItemRequest[];
}