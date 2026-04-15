// Ubicación: src/services/security.service.ts

import axiosInstance from '@/lib/axios';
import { MessageResponse } from '@/types/auth';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const securityService = {
  // 🔐 1. Cambiar Contraseña (Pendiente en Backend)
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/api/auth/change-password',
      data
    );
    return response.data;
  },

  // 💻 2. Obtener Sesiones Activas (Requiere HT-019)
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    try {
      const response = await axiosInstance.get<ActiveSession[]>('/api/auth/sessions');
      return response.data;
    } catch (error: any) {
      // 🛡️ MOCK temporal si el backend arroja 404 porque HT-019 no existe
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.warn("HT-019 no implementado. Retornando datos mock de sesiones.");
        return [
          {
            id: 'mock-1',
            device: 'MacBook Air (M2)', // Un pequeño guiño a tu entorno
            browser: 'Chrome',
            location: 'Sinaloa, México',
            lastActive: new Date().toISOString(),
            isCurrent: true,
          }
        ];
      }
      throw error;
    }
  },

  // 🚫 3. Revocar Sesión (Requiere HT-019)
  revokeSession: async (sessionId: string): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>(
      `/api/auth/sessions/${sessionId}`
    );
    return response.data;
  },

  // 🔔 4. Notificaciones (Usa el que ya existe o uno nuevo)
  updateNotificationPreferences: async (fcmToken: string): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(
      '/api/auth/device-token',
      { fcmToken }
    );
    return response.data;
  }
};