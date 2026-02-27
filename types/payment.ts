// types/payment.ts

export interface StripeOnboardingResponse {
  url: string;
}

export type MerchantStatus = 'ACTIVE' | 'PENDING' | 'NOT_CREATED';

export interface StripeAccountStatus {
  ready: boolean;
  status: MerchantStatus;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  message?: string;
}

// 🚀 NUEVO: Tipos para el historial de facturación
export interface TransactionHistory {
  id: string; // UUID
  amount: number;
  currency: string;
  status: string; // 'SUCCEEDED', 'FAILED', 'REFUNDED'
  type: string; // 'APPOINTMENT_PAYMENT', 'SUBSCRIPTION_CHARGE'
  date: string; // ISO date
  receiptUrl: string | null;
  appointmentId: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}