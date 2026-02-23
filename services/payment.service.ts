// services/payment.service.ts
import axiosInstance from '@/lib/axios';
import { StripeCheckoutResponse } from '@/types/booking';

const BASE_URL = '/api/payments';

export const paymentService = {
  /**
   * Genera una sesión de Stripe Checkout para una cita específica.
   * El backend debe recibir el appointmentId y devolver la URL de Stripe.
   */
  createCheckoutSession: async (appointmentId: number): Promise<string> => {
    const response = await axiosInstance.post<StripeCheckoutResponse>(
      `${BASE_URL}/appointments/checkout`, 
      { appointmentId }
    );
    return response.data.url;
  }
};