// types/payment.ts

export interface StripeOnboardingResponse {
  url: string;
}

// Opcional pero recomendado: Tipar exactamente los estados que devuelve Java
export type MerchantStatus = 'ACTIVE' | 'PENDING' | 'NOT_CREATED';

export interface StripeAccountStatus {
  ready: boolean;
  status: MerchantStatus;
  
  // Estos vienen directo de Stripe/Base de datos cuando el status es PENDING o ACTIVE
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  
  // Por si tu backend manda un mensaje de error genérico
  message?: string;
}