// services/payment.service.ts
import axiosInstance from '@/lib/axios';
import { StripeCheckoutResponse } from '@/types/booking';
// 🚀 NUEVO: Importamos los tipos
import { TransactionHistory, PageResponse } from '@/types/payment';

const BASE_URL = '/api/payments';

export const paymentService = {
  /**
   * Genera una sesión de Stripe Checkout para una cita específica.
   */
  createCheckoutSession: async (appointmentId: number): Promise<string> => {
    const response = await axiosInstance.post<StripeCheckoutResponse>(
      `${BASE_URL}/appointments/checkout`, 
      { appointmentId }
    );
    return response.data.url;
  },

  // 🚀 NUEVO: Obtener el historial de pagos (Ingresos del doctor)
  getBillingHistory: async (page: number = 0, size: number = 20): Promise<PageResponse<TransactionHistory>> => {
    const response = await axiosInstance.get<PageResponse<TransactionHistory>>(
      `${BASE_URL}/billing/history?page=${page}&size=${size}`
    );
    return response.data;
  },

  // 🚀 NUEVO: Método para cobrar el carrito híbrido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHybridCheckout: async (payload: any): Promise<string> => {
    const response = await axiosInstance.post<{checkoutUrl: string}>(
      `${BASE_URL}/hybrid-checkout`, 
      payload
    );
    return response.data.checkoutUrl;
  }
};