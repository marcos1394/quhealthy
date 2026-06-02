// services/cash-register.service.ts
import axiosInstance from '@/lib/axios';
import { 
  CashRegister, 
  CashRegisterReportDto, 
  OpenRegisterRequest, 
  CloseRegisterRequest 
} from '@/types/cash-register';

const BASE_URL = '/api/payments/cash/registers';

export const cashRegisterService = {
  
  /**
   * Obtiene la caja actual (abierta) del proveedor
   * Devuelve 404 si no hay caja abierta, por lo que manejamos el error para devolver null
   */
  getCurrentRegister: async (locationId?: number): Promise<CashRegister | null> => {
    try {
      const params = locationId ? { locationId } : {};
      const response = await axiosInstance.get<CashRegister>(`${BASE_URL}/current`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Abre una nueva caja
   */
  openRegister: async (data: OpenRegisterRequest): Promise<CashRegister> => {
    const response = await axiosInstance.post<CashRegister>(`${BASE_URL}/open`, data);
    return response.data;
  },

  /**
   * Cierra una caja existente
   */
  closeRegister: async (registerId: number, data: CloseRegisterRequest): Promise<CashRegister> => {
    const response = await axiosInstance.patch<CashRegister>(`${BASE_URL}/${registerId}/close`, data);
    return response.data;
  },

  /**
   * Obtiene el reporte detallado de una caja (abierta o cerrada)
   */
  getRegisterReport: async (registerId: number): Promise<CashRegisterReportDto> => {
    const response = await axiosInstance.get<CashRegisterReportDto>(`${BASE_URL}/${registerId}/report`);
    return response.data;
  }
};
