// services/payment.service.ts (o checkout.service.ts)
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/payments';

export const paymentService = {
  /**
   * Genera la sesión de Stripe Checkout para una cita específica.
   */
  createCheckoutSession: async (appointmentId: number): Promise<string> => {
    // Asumiendo que tu endpoint es un POST que recibe el ID de la cita
    // y devuelve un objeto { url: "https://checkout.stripe.com/..." }
    const response = await axiosInstance.post<{ url: string }>(
      `${BASE_URL}/appointments/checkout`, 
      { appointmentId }
    );
    return response.data.url;
  }
};