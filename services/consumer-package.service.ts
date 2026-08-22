// src/services/consumer-package.service.ts
import axiosInstance from "@/lib/axios";
import { ConsumerPackage } from "@/types/packages";

const BASE_URL = "/api/appointments/consumer-packages";

export const consumerPackageService = {
  /**
   * 🎒 Obtiene la billetera de salud completa del paciente con sus paquetes activos
   */
  getMyWallet: async (): Promise<ConsumerPackage[]> => {
    const response = await axiosInstance.get<ConsumerPackage[]>(`${BASE_URL}/me`);
    return response.data;
  },

  getMyPackages: async (): Promise<ConsumerPackage[]> => {
    const response = await axiosInstance.get<ConsumerPackage[]>(`${BASE_URL}/me`);
    return response.data;
  },
};