import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureAndStoreAttribution,
  getStoredAttribution,
  clearStoredAttribution,
  withAttribution,
  sanitizeAnalyticsPayload,
} from '@/lib/analytics/funnel-events';

describe('MKT-PAID-01: Motor de Atribución UTM / SEM y Guardia Anti-PII', () => {
  beforeEach(() => {
    clearStoredAttribution();
    sessionStorage.clear();
  });

  it('captura y almacena parámetros UTM y gclid válidos en sessionStorage', () => {
    const search = '?utm_source=google&utm_medium=cpc&utm_campaign=cardiologia_cdmx&gclid=test-gclid-1234';
    const attr = captureAndStoreAttribution(search);

    expect(attr).toBeDefined();
    expect(attr?.utm_source).toBe('google');
    expect(attr?.utm_medium).toBe('cpc');
    expect(attr?.utm_campaign).toBe('cardiologia_cdmx');
    expect(attr?.gclid).toBe('test-gclid-1234');

    const stored = getStoredAttribution();
    expect(stored?.utm_source).toBe('google');
    expect(stored?.gclid).toBe('test-gclid-1234');
  });

  it('elimina rigurosamente cualquier valor que contenga PII (correo electrónico o teléfono)', () => {
    const maliciousParams = {
      utm_source: 'google',
      utm_campaign: 'paciente_juan@correo.com', // PII en campaña
      phone: '5512345678', // Campo PII prohibido
      gclid: 'valid-click-id',
    };

    const sanitized = sanitizeAnalyticsPayload(maliciousParams as any);
    expect(sanitized.utm_source).toBe('google');
    expect(sanitized.gclid).toBe('valid-click-id');
    expect(sanitized.utm_campaign).toBeUndefined(); // Descartado por contener correo
    expect(sanitized.phone).toBeUndefined(); // Descartado por lista negra PII
  });

  it('adjunta la atribución guardada al evento de conversión con withAttribution', () => {
    captureAndStoreAttribution('?utm_source=meta&utm_medium=cpm&utm_campaign=doctores_onboarding');

    const conversionPayload = withAttribution({
      specialty: 'Dermatología',
      consultationType: 'in_person',
    });

    expect(conversionPayload.specialty).toBe('Dermatología');
    expect(conversionPayload.utm_source).toBe('meta');
    expect(conversionPayload.utm_medium).toBe('cpm');
    expect(conversionPayload.utm_campaign).toBe('doctores_onboarding');
  });

  it('permite limpiar la atribución tras la conversión', () => {
    captureAndStoreAttribution('?utm_source=google');
    expect(getStoredAttribution()?.utm_source).toBe('google');

    clearStoredAttribution();
    expect(getStoredAttribution()).toBeNull();
  });
});
