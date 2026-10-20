import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { resolveApiBaseUrl } from '@/lib/api-config';
import { PlatformStats } from '@/types/public';

export const publicService = {
  /**
   * Descarga la receta pública validando los últimos 4 dígitos del celular.
   */
  verifyAndDownloadPrescription: async (appointmentId: number, phoneLast4: string): Promise<Blob> => {
    const apiUrl = resolveApiBaseUrl();
    const response = await axios.post(
      `${apiUrl}/api/appointments/public/${appointmentId}/prescription/pdf`,
      { phoneLast4 },
      { 
        responseType: 'blob', // 🚀 CRÍTICO: Le decimos a Axios que esperamos un archivo binario
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      }
    );
    return response.data;
  },

  /**
   * Obtiene las estadísticas públicas de la plataforma.
   */
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await axiosInstance.get<PlatformStats>('/api/intelligence/public/stats');
    return response.data;
  }
};
