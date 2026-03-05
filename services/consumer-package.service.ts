// src/services/consumer-package.service.ts
import axiosInstance from '@/lib/axios';
import { ConsumerPackage } from '@/types/packages';

const BASE_URL = '/api/consumer/packages';

export const consumerPackageService = {
  
  /**
   * 🎒 Obtiene la billetera completa del paciente, agrupada por paquetes
   */
  getMyWallet: async (): Promise<ConsumerPackage[]> => {
    // Apunta al endpoint expuesto por tu Controller en Java
    const response = await axiosInstance.get<ConsumerPackage[]>(`${BASE_URL}/my-wallet`);
    return response.data;
  }
  
};