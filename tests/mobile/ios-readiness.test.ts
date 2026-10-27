import { describe, it, expect, vi } from 'vitest';
import { GET as getAASA } from '@/app/.well-known/apple-app-site-association/route';
import { deviceService, DeviceRegistrationPayload } from '@/services/device.service';
import axiosInstance from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ENG-IOS-01: Paridad Mobile iOS, Universal Links y Push Devices', () => {
  it('expone el manifiesto Universal Links (apple-app-site-association) con formato y rutas válidas', async () => {
    const response = await getAASA();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.applinks).toBeDefined();
    expect(data.applinks.details).toHaveLength(1);
    expect(data.applinks.details[0].appID).toContain('org.quhealthy.app');
    expect(data.applinks.details[0].paths).toContain('/patient/appointments/*');
    expect(data.applinks.details[0].paths).toContain('/especialistas/*');
    expect(data.webcredentials.apps).toContain('9Q87J44R49.org.quhealthy.app');
  });

  it('registra correctamente el token Push (APNs / FCM) con metadata de dispositivo', async () => {
    const payload: DeviceRegistrationPayload = {
      token: 'apns-test-device-token-12345',
      platform: 'ios',
      appVersion: '1.2.0',
      deviceModel: 'iPhone 15 Pro',
      osVersion: 'iOS 18.1',
      locale: 'es-MX',
    };

    (axiosInstance.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        deviceId: 'device-uuid-9988',
        registeredAt: '2026-10-26T20:00:00Z',
      },
    });

    const res = await deviceService.registerDevice(payload);
    expect(res.success).toBe(true);
    expect(res.deviceId).toBe('device-uuid-9988');
    expect(axiosInstance.post).toHaveBeenCalledWith('/api/notifications/devices', payload);
  });

  it('lanza error si falta el token o la plataforma en el registro', async () => {
    await expect(
      deviceService.registerDevice({ token: '', platform: 'ios' })
    ).rejects.toThrow('El token de dispositivo y la plataforma son obligatorios');
  });
});
