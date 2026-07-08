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

export interface BudgetLineItemDTO {
    id: number;
    name: string;
    category: string;
    type: string; // INCOME or EXPENSE
}

export interface BudgetExecutionLogDTO {
    id: number;
    amount: number;
    description: string;
    cfdiUuid: string | null;
    createdAt: string;
    budgetLineItem: BudgetLineItemDTO;
}

export interface BudgetRequestDTO {
    name: string;
    periodId: number;
    costCenterId?: number | null;
    operatingAreaId?: number | null;
}

export const budgetService = {
  // Lista los presupuestos
  listBudgets: async (): Promise<BudgetDTO[]> => {
    const response = await axiosInstance.get('/api/payments/finance/budgets');
    return response.data;
  },

  getBudgetSummary: async (budgetId: number): Promise<BudgetSummaryDTO> => {
    const { useSessionStore } = await import('@/stores/SessionStore');
    const providerId = useSessionStore.getState().user?.id;
    const response = await axiosInstance.get(`/api/intelligence/finance/budgets/${budgetId}/summary`, {
        headers: {
            'X-Provider-Id': providerId ? providerId.toString() : '1'
        }
    });
    return response.data;
  },

  // Obtiene el historial de ejecución real
  getExecutionHistory: async (budgetId: number): Promise<BudgetExecutionLogDTO[]> => {
    const response = await axiosInstance.get(`/api/payments/finance/budgets/${budgetId}/execution`);
    return response.data;
  },

  // Crea un nuevo presupuesto
  createBudget: async (data: BudgetRequestDTO): Promise<BudgetDTO> => {
    const response = await axiosInstance.post('/api/payments/finance/budgets', data);
    return response.data;
  }
};
