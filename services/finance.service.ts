import axiosInstance from '@/lib/axios';

export interface BudgetPeriodDTO {
    id: string;
    year: number;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'ACTIVE' | 'CLOSED';
}

const BASE_URL = '/api/payments/finance';

export const financeService = {
  // Budget Periods (Años Fiscales)
  listBudgetPeriods: async (): Promise<BudgetPeriodDTO[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/periods`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch budget periods, returning empty");
      return [];
    }
  },

  createBudgetPeriod: async (year: number): Promise<BudgetPeriodDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/periods`, { year });
    return response.data;
  },

  getBudgets: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/budgets`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch budgets", error);
      return [];
    }
  },

  getBudget: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`${BASE_URL}/budgets/${id}`);
    return response.data;
  },

  updateBudget: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.put(`${BASE_URL}/budgets/${id}`, data);
    return response.data;
  }
};
