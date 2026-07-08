import axiosInstance from '@/lib/axios';

export interface BudgetPeriodDTO {
    id: string;
    year: number;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'ACTIVE' | 'CLOSED';
}

const BASE_URL = '/api/finance';

export const financeService = {
  // Budget Periods (Años Fiscales)
  listBudgetPeriods: async (): Promise<BudgetPeriodDTO[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/budgets/periods`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch budget periods, returning empty");
      return [];
    }
  }
};
