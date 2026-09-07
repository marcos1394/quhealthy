import axiosInstance from '@/lib/axios';
import { ConsumerWalletResponse, WalletTopUpRequest, WalletTopUpResponse } from '@/types/wallet';
import { idempotencyHeaders } from '@/lib/idempotency';

export const consumerWalletService = {
  
  /**
   * Obtiene el balance actual de la billetera del paciente
   */
  getMyWallet: async (): Promise<ConsumerWalletResponse> => {
    const response = await axiosInstance.get<ConsumerWalletResponse>('/api/appointments/consumer-wallet/me');
    return response.data;
  },

  /**
   * Genera la sesión de Stripe para recargar la billetera
   */
  topUpWallet: async (amount: number, idempotencyKey?: string): Promise<WalletTopUpResponse> => {
    const payload: WalletTopUpRequest = { amount };
    const response = await axiosInstance.post<WalletTopUpResponse>(
      '/api/payments/checkout/wallet/topup', payload, { headers: idempotencyHeaders(idempotencyKey) }
    );
    return response.data;
  }
};
