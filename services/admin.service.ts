import axiosInstance from '@/lib/axios';

export interface ChartPointDTO {
  date: string;
  subscriptions: number;
  commissions: number;
}

export interface FinanceMetricsDTO {
  totalSubscriptionsRevenue: number;
  totalCommissionsRevenue: number;
  totalRevenue: number;
  activeSubscriptionsCount: number;
  chartData: ChartPointDTO[];
}

export const adminService = {
  getFinanceMetrics: async (): Promise<FinanceMetricsDTO> => {
    const response = await axiosInstance.get<FinanceMetricsDTO>('/api/admin/payments/metrics');
    return response.data;
  }
};
