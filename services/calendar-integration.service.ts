// services/calendar-integration.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/appointments/integrations/calendar';

// Respuesta del backend para auth-url
interface AuthUrlResponse {
  url: string;
}

// Respuesta del backend para status
interface IntegrationStatusResponse {
  connected: boolean;
  provider?: string;
  lastSyncedAt?: string;
}

export const calendarIntegrationService = {
  
  /**
   * Verifica si el proveedor tiene su cuenta de Google Calendar vinculada.
   */
  getStatus: async (): Promise<IntegrationStatusResponse> => {
    const response = await axiosInstance.get<IntegrationStatusResponse>(`${BASE_URL}/status`);
    return response.data;
  },

  /**
   * 🚀 FIX RUTA CRÍTICA: Antes llamaba a /connect/{provider} que NO existe.
   * El backend expone GET /auth-url?provider=GOOGLE_CALENDAR
   */
  getConnectUrl: async (provider: string = 'GOOGLE_CALENDAR'): Promise<string> => {
    const response = await axiosInstance.get<AuthUrlResponse>(`${BASE_URL}/auth-url`, {
      params: { provider }
    });
    return response.data.url;
  },

  /**
   * 🍎 Conectar Apple iCal vía URL
   * POST /connect/ical
   */
  connectIcal: async (icalUrl: string): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/connect/ical`, icalUrl, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  /**
   * 🔄 Forzar sincronización manual del calendario
   * POST /sync
   */
  syncNow: async (): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/sync`);
  },

  /**
   * ❌ Desconectar calendario vinculado
   * POST /disconnect
   */
  disconnect: async (): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/disconnect`);
  }
};