// services/dashboard.service.ts

import axiosInstance from '@/lib/axios';
import { ProviderDashboardResponse } from '@/types/dashboard';

const BASE_URL = '/api/appointments/dashboard';

export const dashboardService = {
  
  /**
   * Obtiene el resumen consolidado para el Dashboard del Proveedor.
   * Trae métricas financieras, plan actual, estatus de tienda y próximas citas.
   */
  getSummary: async (): Promise<ProviderDashboardResponse> => {
    const response = await axiosInstance.get<ProviderDashboardResponse>(`${BASE_URL}/summary`);
    return response.data;
  }
  
};