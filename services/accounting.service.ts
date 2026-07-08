import axiosInstance from '@/lib/axios';
import { AccountDTO, CostCenterDTO } from '@/types/accounting';

const BASE_URL = '/api/payments/accounting';

export interface CostCenterRequestDTO {
  name: string;
  code: string;
  locationId: number;
}

export const accountingService = {
  // Cuentas Contables
  listAccounts: async (): Promise<AccountDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/accounts`);
    return response.data;
  },

  createAccount: async (data: Omit<AccountDTO, 'id' | 'active'>): Promise<AccountDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/accounts`, data);
    return response.data;
  },

  // Centros de Costos
  listCostCenters: async (): Promise<CostCenterDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/cost-centers`);
    return response.data;
  },

  createCostCenter: async (data: CostCenterRequestDTO): Promise<CostCenterDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/cost-centers`, data);
    return response.data;
  }
};
