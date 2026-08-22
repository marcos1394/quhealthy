import axiosInstance from "@/lib/axios";
import {
  PatientClinicalBudgetDTO,
  CreatePatientBudgetDTO,
  AcceptPatientBudgetDTO,
  PatientBudgetStatus,
} from "@/types/clinical-budget";

const BASE_URL = "/api/payments/clinical-budgets";
const PUBLIC_URL = "/api/payments/public/clinical-budgets";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const clinicalBudgetService = {
  // Provider / Staff endpoints
  getBudgets: async (
    status?: PatientBudgetStatus,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<PatientClinicalBudgetDTO>> => {
    const params: Record<string, any> = { page, size };
    if (status) params.status = status;
    const response = await axiosInstance.get<PageResponse<PatientClinicalBudgetDTO>>(BASE_URL, {
      params,
    });
    return response.data;
  },

  getBudgetById: async (id: number): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.get<PatientClinicalBudgetDTO>(`${BASE_URL}/${id}`);
    return response.data;
  },

  createBudget: async (dto: CreatePatientBudgetDTO): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.post<PatientClinicalBudgetDTO>(BASE_URL, dto);
    return response.data;
  },

  sendBudget: async (id: number): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.post<PatientClinicalBudgetDTO>(`${BASE_URL}/${id}/send`);
    return response.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Public / Patient endpoints (No auth required)
  getPublicBudget: async (folio: string): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.get<PatientClinicalBudgetDTO>(`${PUBLIC_URL}/${folio}`);
    return response.data;
  },

  acceptPublicBudget: async (
    folio: string,
    dto: AcceptPatientBudgetDTO
  ): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.post<PatientClinicalBudgetDTO>(
      `${PUBLIC_URL}/${folio}/accept`,
      dto
    );
    return response.data;
  },

  rejectPublicBudget: async (
    folio: string,
    reason: string
  ): Promise<PatientClinicalBudgetDTO> => {
    const response = await axiosInstance.post<PatientClinicalBudgetDTO>(
      `${PUBLIC_URL}/${folio}/reject`,
      { reason }
    );
    return response.data;
  },
};
