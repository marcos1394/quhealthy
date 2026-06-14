// types/booking.ts
import { StorefrontItem } from "./storefront";

export interface CheckoutParams {
  providerId: number;
  consumerId?: number; 
  dependentId?: number | null; 
  selectedDate: Date | null;
  selectedTime: string | null;
  cart: StorefrontItem[];
  consumerSymptoms?: string; 
  shippingAddress?: string;
  // 🚀 Espera un JSON en String ej: '{"12": "consumers/5/prescriptions/abc.jpg"}'
  prescriptionUrls?: string;
  pickupTime?: string;
  destinationState?: string;
  scheduleNow?: boolean;
  shareVaultAccess?: boolean;
  allowedDocumentIds?: string[];
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
  destinationState?: string;
  pickupTime?: string;
  prescriptionUrls?: string;
  cartItems: CartItemRequest[];
}