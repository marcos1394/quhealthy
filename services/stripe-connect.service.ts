// services/stripe-connect.service.ts
import axiosInstance from '@/lib/axios'; // Ajusta la ruta a tu instancia de Axios
import { StripeOnboardingResponse, StripeAccountStatus } from '@/types/payment';

const BASE_URL = '/api/payments/connect';

export const stripeConnectService = {
  
  /**
   * Llama al backend para generar el link mágico de Stripe.
   * Retorna la URL a la que debemos redirigir al doctor.
   */
  startOnboarding: async (): Promise<string> => {
    const response = await axiosInstance.post<StripeOnboardingResponse>(`${BASE_URL}/onboarding`);
    return response.data.url;
  },

  /**
   * Consulta si el doctor ya terminó su configuración en Stripe
   * y si ya está listo para recibir pagos.
   */
  getAccountStatus: async (): Promise<StripeAccountStatus> => {
    const response = await axiosInstance.get<StripeAccountStatus>(`${BASE_URL}/status`);
    return response.data;
  }
};