import axiosInstance from '@/lib/axios';

export enum ApprovalScope {
    EXECUTION = 'EXECUTION',
    TRANSFER = 'TRANSFER',
    COMMITMENT = 'COMMITMENT',
    ALL = 'ALL'
}

export enum ApprovalEntityType {
    EXECUTION = 'EXECUTION',
    TRANSFER = 'TRANSFER',
    COMMITMENT = 'COMMITMENT'
}

export enum ApprovalRequestStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum ApprovalDecisionType {
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED'
}

export interface ApprovalChainStepDTO {
    id?: number;
    stepOrder: number;
    approverId?: number;
    approverName?: string;
    minimumRole?: string;
    amountThreshold?: number;
    scope: ApprovalScope;
    active: boolean;
}

export interface ApprovalDecisionDTO {
    id: number;
    stepOrder: number;
    decidedBy: number;
    decidedByName?: string;
    decision: ApprovalDecisionType;
    comments?: string;
    decidedAt: string;
}

export interface ApprovalRequestDTO {
    id: number;
    providerId: number;
    entityType: ApprovalEntityType;
    entityId: number;
    amount: number;
    description: string;
    requestedBy: number;
    requestedByName?: string;
    currentStep: number;
    totalSteps: number;
    status: ApprovalRequestStatus;
    createdAt: string;
    resolvedAt?: string;
    decisions: ApprovalDecisionDTO[];
}

export interface ApprovalDecisionRequest {
    decision: ApprovalDecisionType;
    comments?: string;
}

const BASE = (providerId: number) =>
    `/api/v1/providers/${providerId}/finance/approvals`;

export const approvalService = {
    getApprovalChain: async (providerId: number): Promise<ApprovalChainStepDTO[]> => {
        const res = await axiosInstance.get(`${BASE(providerId)}/chain`);
        return res.data;
    },

    saveChainStep: async (providerId: number, step: ApprovalChainStepDTO): Promise<ApprovalChainStepDTO> => {
        const res = await axiosInstance.post(`${BASE(providerId)}/chain`, step);
        return res.data;
    },

    deleteChainStep: async (providerId: number, stepId: number): Promise<void> => {
        await axiosInstance.delete(`${BASE(providerId)}/chain/${stepId}`);
    },

    getPendingRequests: async (providerId: number): Promise<ApprovalRequestDTO[]> => {
        const res = await axiosInstance.get(`${BASE(providerId)}/requests/pending`);
        return res.data;
    },

    getRequestHistory: async (providerId: number): Promise<ApprovalRequestDTO[]> => {
        const res = await axiosInstance.get(`${BASE(providerId)}/requests/history`);
        return res.data;
    },

    processDecision: async (
        providerId: number,
        requestId: number,
        decision: ApprovalDecisionRequest
    ): Promise<ApprovalRequestDTO> => {
        const res = await axiosInstance.post(
            `${BASE(providerId)}/requests/${requestId}/decisions`,
            decision
        );
        return res.data;
    },
};
