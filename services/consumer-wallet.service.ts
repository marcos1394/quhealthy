import axiosInstance from '@/lib/axios';
import { ConsumerWalletResponse, WalletTopUpRequest, WalletTopUpResponse } from '@/types/wallet';

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
  topUpWallet: async (amount: number): Promise<WalletTopUpResponse> => {
    const payload: WalletTopUpRequest = { amount };
    const response = await axiosInstance.post<WalletTopUpResponse>('/api/payments/checkout/wallet/topup', payload);
    return response.data;
  }
};
