import axiosInstance from '@/lib/axios';

export interface DeviceRegistrationPayload {
  token: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  locale?: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  deviceId?: string;
  registeredAt?: string;
}

export const deviceService = {
  /**
   * Registra el token de dispositivo Push (APNs / FCM) en el microservicio de notificaciones
   * POST /api/notifications/devices
   */
  registerDevice: async (
    payload: DeviceRegistrationPayload
  ): Promise<DeviceRegistrationResponse> => {
    if (!payload.token || !payload.platform) {
      throw new Error('El token de dispositivo y la plataforma son obligatorios');
    }

    const response = await axiosInstance.post<DeviceRegistrationResponse>(
      '/api/notifications/devices',
      payload
    );
    return response.data;
  },

  /**
   * Desregistra el token del dispositivo al cerrar sesión
   * DELETE /api/notifications/devices/{token}
   */
  unregisterDevice: async (token: string): Promise<void> => {
    if (!token) return;
    await axiosInstance.delete(`/api/notifications/devices/${encodeURIComponent(token)}`);
  },
};
