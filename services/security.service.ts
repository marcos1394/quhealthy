// Ubicación: src/services/security.service.ts

import axiosInstance from '@/lib/axios';
import { MessageResponse } from '@/types/auth';
import { ActiveSessionResponse, MfaEnableResponse, MfaSetupResponse } from '@/types/security';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const securityService = {
  // 🔐 1. Cambiar Contraseña
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(
      '/api/auth/password',
      data
    );
    return response.data;
  },

  // 🛡️ MFA (Autenticación en 2 pasos)
  setupMfa: async (): Promise<MfaSetupResponse> => {
    const response = await axiosInstance.post<MfaSetupResponse>('/api/auth/mfa/setup');
    return response.data;
  },

  enableMfa: async (code: string): Promise<MfaEnableResponse> => {
    const response = await axiosInstance.post<MfaEnableResponse>('/api/auth/mfa/enable', { code });
    return response.data;
  },

  disableMfa: async (password: string): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>('/api/auth/mfa', { data: { password } });
    return response.data;
  },

  // 💻 2. Obtener Sesiones Activas
  getActiveSessions: async (): Promise<ActiveSessionResponse[]> => {
    const response = await axiosInstance.get<ActiveSessionResponse[]>('/api/auth/sessions');
    return response.data;
  },

  // 🚫 3. Revocar Sesión
  revokeSession: async (sessionId: string): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>(
      `/api/auth/sessions/${sessionId}`
    );
    return response.data;
  },

  revokeAllExceptCurrent: async (): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>('/api/auth/sessions/all-except-current');
    return response.data;
  },

  // 🔔 4. Notificaciones
  updateNotificationPreferences: async (fcmToken: string): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(
      '/api/auth/device-token',
      { fcmToken }
    );
    return response.data;
  },

  // ⚠️ 5. Eliminar Cuenta
  deleteAccount: async (password: string): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>('/api/auth/account', { data: { password } });
    return response.data;
  }
};