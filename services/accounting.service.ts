import axiosInstance from '@/lib/axios';
import { AccountDTO, CostCenterDTO } from '@/types/accounting';
export type { AccountDTO, CostCenterDTO };

const BASE_URL = '/api/payments/accounting';

export interface CostCenterRequestDTO {
  name: string;
  code: string;
  locationId: number;
  parentId?: string | null;
}

export interface JournalEntryLineDTO {
    id?: number;
    accountId: number;
    account?: AccountDTO;
    costCenterId?: number;
    description: string;
    debit: number;
    credit: number;

    // SAT Anexo 24 Metadata
    cfdiUuid?: string;
    thirdPartyRfc?: string;
    cfdiTotalAmount?: number;
    currencyCode?: string;
    exchangeRate?: number;
    paymentMethodCode?: string;
    nationalBankCode?: string;
    foreignBankCode?: string;
    originAccount?: string;
    destinationAccount?: string;
    beneficiaryName?: string;
    checkNumber?: string;
}

export interface JournalEntryDTO {
    id?: number;
    providerId: number;
    entryDate: string;
    type: 'INCOME' | 'EXPENSE' | 'JOURNAL';
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'POSTED' | 'CANCELLED';
    description: string;
    cfdiUuid?: string; // Nivel póliza (opcional, si aplica a todas las líneas)
    createdBy: number;
    
    // SAT Metadata cabecera
    satRequestType?: string;
    satOrderNumber?: string;
    satProcedureNumber?: string;

    lines: JournalEntryLineDTO[];
}

export interface JournalEntryRequest {
    entryDate: string;
    type: 'INCOME' | 'EXPENSE' | 'JOURNAL';
    description: string;
    cfdiUuid?: string;
    satRequestType?: string;
    satOrderNumber?: string;
    satProcedureNumber?: string;
    lines: JournalEntryLineDTO[];
}

export const accountingService = {
  // Cuentas Contables
  listAccounts: async (): Promise<AccountDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/accounts`);
    return response.data;
  },

  getChartOfAccounts: async (): Promise<AccountDTO[]> => {
    const response = await axiosInstance.get('/api/payments/finance/accounting/accounts');
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
  },

  // Pólizas Contables
  getJournalEntries: async (): Promise<JournalEntryDTO[]> => {
    const response = await axiosInstance.get('/api/payments/finance/accounting/journals');
    return response.data;
  },

  createJournalEntry: async (request: JournalEntryRequest): Promise<JournalEntryDTO> => {
    const response = await axiosInstance.post('/api/payments/finance/accounting/journals', request);
    return response.data;
  },

  postJournalEntry: async (id: number): Promise<JournalEntryDTO> => {
    const response = await axiosInstance.post(`/api/payments/finance/accounting/journals/${id}/post`);
    return response.data;
  },

  // SAT Catalogs
  getSatBanks: async (): Promise<{ code: string; shortName: string; fullName: string; }[]> => {
    const response = await axiosInstance.get('/api/payments/accounting/sat/banks');
    return response.data;
  },
  
  getSatPaymentMethods: async (): Promise<{ code: string; name: string; }[]> => {
    const response = await axiosInstance.get('/api/payments/accounting/sat/payment-methods');
    return response.data;
  },

  getSatCurrencies: async (): Promise<{ code: string; name: string; }[]> => {
    const response = await axiosInstance.get('/api/payments/accounting/sat/currencies');
    return response.data;
  },

  // Account Mapping
  getCategoryMappings: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/api/payments/accounting/mapping/category');
    return response.data;
  },

  saveCategoryMapping: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/api/payments/accounting/mapping/category', data);
    return response.data;
  },

  getBankMappings: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/api/payments/accounting/mapping/bank');
    return response.data;
  },

  saveBankMapping: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/api/payments/accounting/mapping/bank', data);
    return response.data;
  }
};
