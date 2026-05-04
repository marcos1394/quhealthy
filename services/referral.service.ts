import axiosInstance from '@/lib/axios';
import { ReferralDashboardResponse } from '@/types/referral';

export const referralService = {
  /**
   * 📊 Obtiene las métricas y el historial de referidos del doctor autenticado
   */
  getDashboard: async (): Promise<ReferralDashboardResponse> => {
    const response = await axiosInstance.get('/api/referrals/dashboard');
    return response.data;
  }
};
