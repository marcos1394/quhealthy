// services/calendar-integration.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/appointments/integrations/calendar';

export const calendarIntegrationService = {
  
  /**
   * Verifica si el proveedor tiene su cuenta de Google Calendar vinculada.
   */
  getStatus: async (): Promise<{ connected: boolean }> => {
    const response = await axiosInstance.get<{ connected: boolean }>(`${BASE_URL}/status`);
    return response.data;
  },

  /**
   * Obtiene la URL de OAuth2 de Google para redirigir al usuario.
   */
  getConnectUrl: async (provider: string = 'GOOGLE_CALENDAR'): Promise<string> => {
    const response = await axiosInstance.get<string>(`${BASE_URL}/connect/${provider}`);
    return response.data;
  }
};