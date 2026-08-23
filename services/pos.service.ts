// services/pos.service.ts
import axiosInstance from '@/lib/axios';
import { PosCheckoutRequest, PosReceipt } from '@/types/pos';

const BASE_URL = '/api/payments/pos';

export const posService = {
  /**
   * Procesa un cobro multiforma (Split Payment) en Punto de Venta (POS)
   */
  processCheckout: async (data: PosCheckoutRequest): Promise<PosReceipt> => {
    const response = await axiosInstance.post<PosReceipt>(`${BASE_URL}/checkout`, data);
    return response.data;
  },

  /**
   * Obtiene un ticket POS por su ID
   */
  getReceiptById: async (id: number): Promise<PosReceipt> => {
    const response = await axiosInstance.get<PosReceipt>(`${BASE_URL}/receipts/${id}`);
    return response.data;
  },

  /**
   * Obtiene un ticket POS por su token público (para autofacturación)
   */
  getReceiptByToken: async (token: string): Promise<PosReceipt> => {
    const response = await axiosInstance.get<PosReceipt>(`${BASE_URL}/receipts/public/token/${token}`);
    return response.data;
  },

  /**
   * Obtiene el listado de tickets emitidos por el proveedor
   */
  getReceipts: async (page: number = 0, size: number = 20): Promise<{ content: PosReceipt[]; totalElements: number }> => {
    const response = await axiosInstance.get(`${BASE_URL}/receipts`, {
      params: { page, size },
    });
    return response.data;
  },
};
