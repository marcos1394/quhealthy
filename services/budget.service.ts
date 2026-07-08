import axiosInstance from '@/lib/axios';

export interface BudgetDTO {
    id: number;
    name: string;
    totalProjectedIncome: number;
    totalProjectedExpense: number;
    status?: string; // e.g. "APPROVED", "CLOSED", or we map from BudgetPeriodStatus
}

export interface BudgetAlertDTO {
    category: string;
    type: string; // "WARNING" or "DANGER"
    message: string;
}

export interface BudgetSummaryDTO {
    budgetId: number;
    name: string;
    totalProjectedIncome: number;
    totalActualIncome: number;
    incomeCompletionPercentage: number;
    totalProjectedExpense: number;
    totalActualExpense: number;
    expenseConsumptionPercentage: number;
    alerts: BudgetAlertDTO[];
}

export const budgetService = {
  // Lista los presupuestos
  listBudgets: async (): Promise<BudgetDTO[]> => {
    const response = await axiosInstance.get('/api/payments/finance/budgets');
    // Assuming backend returns a list of Budget entity objects which might differ slightly from the frontend mock
    return response.data;
  },

  // Obtiene el summary analítico del presupuesto
  getBudgetSummary: async (budgetId: number): Promise<BudgetSummaryDTO> => {
    const response = await axiosInstance.get(`/api/analytics/budgets/${budgetId}/summary`);
    return response.data;
  }
};
