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
  },

  /**
   * 📊 Obtiene métricas de retención de pacientes para el Dashboard del Proveedor
   * GET /api/appointments/dashboard/retention
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRetentionMetrics: async (): Promise<any> => {
    const response = await axiosInstance.get(`${BASE_URL}/retention`);
    return response.data;
  },

  /**
   * 📊 Obtiene la serie de tiempo financiera (ingresos mensuales)
   * GET /api/appointments/dashboard/financial
   */
  getFinancialTimeseries: async (months: number = 6): Promise<{ name: string, revenue: number }[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/financial`, { params: { months } });
    return response.data;
  }
  
};