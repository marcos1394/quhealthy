// types/payment.ts

export interface StripeOnboardingResponse {
  url: string;
}

export interface StripeAccountStatus {
  ready?: boolean;
  status?: string;
  message?: string;
  // Puedes agregar más campos si tu MerchantAccountRepository devuelve más detalles luego
}