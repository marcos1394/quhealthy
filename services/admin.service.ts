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

export interface SalesVolumeDTO {
  itemType: string;
  volumeCount: number;
  revenue: number;
}

export interface ProviderEarningsDTO {
  providerId: number;
  providerName: string;
  totalEarned: number;
}

export interface UnitEconomicsDTO {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalSubscriptionsRevenue: number;
  totalCommissionsRevenue: number;
  cloudCosts: number;
  marketingCosts: number;
  stripeFees: number;
  topProviders: ProviderEarningsDTO[];
  salesByType: SalesVolumeDTO[];
  arpu: number;
  costPerUser: number;
  grossMargin: number;
  netProfit: number;
}

export interface AdminDashboardDTO {
  appointmentsToday: number;
  appointmentsThisMonth: number;
  activeProvidersThisMonth: number;
  newProvidersThisMonth: number;
  completedAppointmentsThisMonth: number;
  cancelledAppointmentsThisMonth: number;
  noShowAppointmentsThisMonth: number;
  revenueThisMonth: number;
  generatedAt: string;
}

export const adminService = {
  getFinanceMetrics: async (): Promise<FinanceMetricsDTO> => {
    const response = await axiosInstance.get<FinanceMetricsDTO>('/api/payments/admin/metrics');
    return response.data;
  },
  getUnitEconomics: async (): Promise<UnitEconomicsDTO> => {
    const response = await axiosInstance.get<UnitEconomicsDTO>('/api/payments/admin/economics');
    return response.data;
  },
  getDashboardMetrics: async (): Promise<AdminDashboardDTO> => {
    const response = await axiosInstance.get<AdminDashboardDTO>('/api/appointments/admin/metrics/dashboard');
    return response.data;
  },
  getTransactionsReport: async (limitDays: number = 30): Promise<TransactionReportDTO[]> => {
    const response = await axiosInstance.get<TransactionReportDTO[]>(`/api/payments/admin/transactions/report?limitDays=${limitDays}`);
    return response.data;
  }
};

export interface TransactionReportDTO {
  date: string;
  transactionId: string;
  chargeId: string;
  grossAmount: number;
  stripeFee: number;
  quhealthyCommission: number;
  providerEarnings: number;
  transactionType: string;
  description: string;
}
