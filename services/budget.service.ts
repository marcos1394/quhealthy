import axiosInstance from '@/lib/axios';

// ─── DTOs existentes ──────────────────────────────────────────────────────────

export interface BudgetDTO {
    id: number;
    name: string;
    totalProjectedIncome: number;
    totalProjectedExpense: number;
    budgetFamilyId?: string;
    version?: number;
    versionReason?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'CLOSED' | 'ARCHIVED';
}

export interface BudgetAlertDTO {
    category: string;
    type: 'WARNING' | 'DANGER';
    message: string;
}

export interface BudgetSummaryDTO {
    budgetId: number;
    name: string;
    totalProjectedIncome: number;
    totalActualIncome: number;
    incomeCompletionPercentage: number;
    totalProjectedExpense: number;
    totalCommittedExpense?: number; // Añadido
    totalActualExpense: number;
    totalAvailableExpense?: number; // Añadido
    expenseConsumptionPercentage: number;
    alerts: BudgetAlertDTO[];
}

export interface BudgetLineItemDTO {
    id: number;
    name: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    projectedAmount: number;
    actualAmount: number;
    costCenterId?: number | null;
}

export interface BudgetExecutionLogDTO {
    id: number;
    amount: number;
    description: string;
    cfdiUuid: string | null;
    cfdiUrl: string | null;
    createdAt: string;
    costCenterId?: number | null;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'RETURNED' | 'PARTIALLY_APPROVED';
    budgetLineItem: BudgetLineItemDTO;
}

export interface BudgetExecutionRequest {
    budgetLineItemId: number;
    transactionId?: number | null;
    amount: number;
    description: string;
    debitAccountId?: string | null;
    creditAccountId?: string | null;
    // Tesorería
    paymentMethodCode?: string;
    bankCode?: string;
    currencyCode?: string;
    exchangeRate?: number;
    // Centro de costo
    costCenterId?: number | null;
}

export interface BudgetRequestDTO {
    name: string;
    periodId: number;
    costCenterId?: number | null;
    operatingAreaId?: number | null;
}

// ─── DTOs nuevos Épica 11 ─────────────────────────────────────────────────────

export type CommitmentStatus = 'ACTIVE' | 'EXECUTED' | 'CANCELLED';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'RETURNED' | 'PARTIALLY_APPROVED';

export interface BudgetCommitmentDTO {
    id: number;
    lineItem: BudgetLineItemDTO;
    amount: number;
    reason: string;
    status: CommitmentStatus;
    costCenterId?: number | null;
    expectedExecutionDate?: string | null;
    purchaseOrderId?: number | null;
    createdAt: string;
}

export interface BudgetTransferDTO {
    id: number;
    fromLineItem: BudgetLineItemDTO;
    toLineItem: BudgetLineItemDTO;
    amount: number;
    reason: string;
    status: TransferStatus;
    requestedAt: string;
    effectiveDate?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    approvalComments?: string | null;
}

export interface BudgetPolicyDTO {
    id?: number;
    providerId?: number;
    allowNegativeBudget: boolean;
    allowOverExecution: boolean;
    overExecutionMode: 'BLOCK' | 'WARN' | 'AUTHORIZE';
    approvalLevels: number;
    transferLimitPercentage?: number | null;
    allowCrossDepartmentTransfer: boolean;
    monthlyControlEnabled: boolean;
}

export interface BudgetMonthlyDistributionDTO {
    id?: number;
    month: number;
    projectedAmount: number;
    actualAmount: number;
    committedAmount: number;
    // Calculado en frontend: variance = actual - projected
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const budgetService = {

    // ── Presupuestos ──────────────────────────────────────────────────────────

    listBudgets: async (): Promise<BudgetDTO[]> => {
        const response = await axiosInstance.get('/api/payments/finance/budgets');
        return response.data;
    },

    getBudgetLineItems: async (budgetId: number): Promise<BudgetLineItemDTO[]> => {
        const response = await axiosInstance.get(`/api/payments/finance/budgets/${budgetId}/lines`);
        return response.data;
    },

    getBudgetSummary: async (budgetId: number): Promise<BudgetSummaryDTO> => {
        const { useSessionStore } = await import('@/stores/SessionStore');
        const providerId = useSessionStore.getState().user?.id;
        const response = await axiosInstance.get(`/api/intelligence/finance/budgets/${budgetId}/summary`, {
            headers: { 'X-Provider-Id': providerId ? providerId.toString() : '1' }
        });
        return response.data;
    },

    createBudget: async (data: BudgetRequestDTO): Promise<BudgetDTO> => {
        const response = await axiosInstance.post('/api/payments/finance/budgets', data);
        return response.data;
    },

    /** HU 11-04: Crear nueva versión del presupuesto */
    createNewVersion: async (budgetId: number, reason: string): Promise<BudgetDTO> => {
        const response = await axiosInstance.post(`/api/payments/finance/budgets/${budgetId}/new-version`, { reason });
        return response.data;
    },

    /** HU 11-04: Activar presupuesto en DRAFT */
    activateBudget: async (budgetId: number): Promise<BudgetDTO> => {
        const response = await axiosInstance.patch(`/api/payments/finance/budgets/${budgetId}/activate`);
        return response.data;
    },

    // ── Ejecución ─────────────────────────────────────────────────────────────

    getExecutionHistory: async (budgetId: number): Promise<BudgetExecutionLogDTO[]> => {
        const response = await axiosInstance.get(`/api/payments/finance/budgets/${budgetId}/execution`);
        return response.data;
    },

    recordExecution: async (budgetId: number, data: BudgetExecutionRequest): Promise<BudgetExecutionLogDTO> => {
        const response = await axiosInstance.post(`/api/payments/finance/budgets/${budgetId}/execution`, data);
        return response.data;
    },

    // ── Compromisos (HU 11-07) ────────────────────────────────────────────────

    listCommitments: async (): Promise<BudgetCommitmentDTO[]> => {
        const response = await axiosInstance.get('/api/payments/finance/commitments');
        return response.data;
    },

    createCommitment: async (data: { lineItemId: number; amount: number; reason: string }): Promise<BudgetCommitmentDTO> => {
        const response = await axiosInstance.post('/api/payments/finance/commitments', data);
        return response.data;
    },

    cancelCommitment: async (id: number): Promise<BudgetCommitmentDTO> => {
        const response = await axiosInstance.patch(`/api/payments/finance/commitments/${id}/cancel`);
        return response.data;
    },

    executeCommitment: async (id: number, executionLogId: number): Promise<BudgetCommitmentDTO> => {
        const response = await axiosInstance.patch(`/api/payments/finance/commitments/${id}/execute`, { executionLogId });
        return response.data;
    },

    // ── Reasignaciones (HU 11-05) ─────────────────────────────────────────────

    listTransfers: async (): Promise<BudgetTransferDTO[]> => {
        const response = await axiosInstance.get('/api/payments/finance/transfers');
        return response.data;
    },

    requestTransfer: async (data: {
        fromLineItemId: number;
        toLineItemId: number;
        amount: number;
        reason: string;
        effectiveDate?: string;
    }): Promise<BudgetTransferDTO> => {
        const response = await axiosInstance.post('/api/payments/finance/transfers', data);
        return response.data;
    },

    approveTransfer: async (id: number, comments?: string): Promise<BudgetTransferDTO> => {
        const response = await axiosInstance.patch(`/api/payments/finance/transfers/${id}/approve`, { comments });
        return response.data;
    },

    rejectTransfer: async (id: number, comments?: string): Promise<BudgetTransferDTO> => {
        const response = await axiosInstance.patch(`/api/payments/finance/transfers/${id}/reject`, { comments });
        return response.data;
    },

    // ── Políticas (HU 11-13) ──────────────────────────────────────────────────

    getPolicy: async (): Promise<BudgetPolicyDTO> => {
        const response = await axiosInstance.get('/api/payments/finance/policy');
        return response.data;
    },

    savePolicy: async (data: BudgetPolicyDTO): Promise<BudgetPolicyDTO> => {
        const response = await axiosInstance.put('/api/payments/finance/policy', data);
        return response.data;
    },

    // ── Calendario mensual (HU 11-09) ─────────────────────────────────────────

    getMonthlyDistribution: async (lineItemId: number): Promise<BudgetMonthlyDistributionDTO[]> => {
        const response = await axiosInstance.get(`/api/payments/finance/line-items/${lineItemId}/monthly`);
        return response.data;
    },

    saveMonthlyDistribution: async (lineItemId: number, data: BudgetMonthlyDistributionDTO[]): Promise<void> => {
        await axiosInstance.put(`/api/payments/finance/line-items/${lineItemId}/monthly`, data);
    },
};
