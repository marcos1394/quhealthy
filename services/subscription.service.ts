// services/subscription.service.ts
import axiosInstance from '@/lib/axios';

export interface CurrentSubscription {
  id: string;
  planId: number;
  planName: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'PAUSED';
  gateway: 'STRIPE' | 'MERCADOPAGO' | 'MANUAL' | 'FREE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  active: boolean;
  cancelAtPeriodEnd: boolean;
}

export const subscriptionService = {
  /**
   * Consulta la suscripción activa del provider autenticado.
   * Retorna null si el provider no tiene suscripción activa (204 No Content).
   */
  getCurrentSubscription: async (): Promise<CurrentSubscription | null> => {
    const response = await axiosInstance.get('/api/subscriptions/current', {
      validateStatus: (status) => status === 200 || status === 204,
    });
    if (response.status === 204 || !response.data) {
      return null;
    }
    return response.data;
  },
};
