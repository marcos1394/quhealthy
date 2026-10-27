/**
 * QuHealthy - Telemetría y Analítica de Embudo (GA4) con Guardia Estricta Anti-PII
 * Cumplimiento con NOM-004, NOM-024, LFPDPPP y políticas de privacidad del paciente.
 */

export type ProviderFunnelStep =
  | 'view_business_landing'
  | 'signup_provider_start'
  | 'signup_provider_complete'
  | 'kyb_submitted'
  | 'referral_invite_sent';

export type PatientFunnelStep =
  | 'search_specialty'
  | 'view_provider_profile'
  | 'booking_initiated'
  | 'booking_confirmed';

export type FunnelEventName = ProviderFunnelStep | PatientFunnelStep;

export interface FunnelEventParams {
  specialty?: string;
  city?: string;
  providerId?: number | string;
  consultationType?: 'in_person' | 'telemedicine';
  leadSource?: string;
  stepNumber?: number;
  [key: string]: string | number | boolean | undefined;
}

// Lista negra estricta de campos que NUNCA deben enviarse a GA4 o analítica externa
const FORBIDDEN_PII_KEYS = new Set([
  'email',
  'phone',
  'telefono',
  'celular',
  'name',
  'fullname',
  'firstname',
  'lastname',
  'patientname',
  'paciente',
  'clinicalnotes',
  'notas',
  'diagnosis',
  'diagnostico',
  'prescription',
  'receta',
  'cedula',
  'curp',
  'rfc',
  'password',
  'token',
]);

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/;

/**
 * Sanitiza un payload eliminando cualquier campo o valor sospechoso de contener PII.
 */
export function sanitizeAnalyticsPayload(
  params?: FunnelEventParams
): Record<string, string | number | boolean> {
  if (!params) return {};

  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    const lowerKey = key.toLowerCase().replace(/[^a-z]/g, '');
    if (FORBIDDEN_PII_KEYS.has(lowerKey)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Anti-PII Guard] Campo prohibido descartado en analítica: "${key}"`);
      }
      continue;
    }

    if (typeof value === 'string') {
      if (EMAIL_REGEX.test(value) || PHONE_REGEX.test(value)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[Anti-PII Guard] Valor con patrón PII detectado y bloqueado en "${key}"`);
        }
        continue;
      }
      clean[key] = value.slice(0, 100); // Límite de longitud seguro
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    }
  }

  return clean;
}

/**
 * Dispara un evento a Google Analytics (gtag) si el objeto window está disponible
 * y el usuario otorgó consentimiento.
 */
export function trackFunnelEvent(
  eventName: FunnelEventName,
  params?: FunnelEventParams
): boolean {
  if (typeof window === 'undefined') return false;

  const sanitized = sanitizeAnalyticsPayload(params);

  try {
    const win = window as any;
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, sanitized);
      return true;
    }

    // Fallback: Si no hay gtag cargado (ej. dev o sin consentimiento aún), se registra en consola en dev
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics Event: ${eventName}]`, sanitized);
    }
  } catch (error) {
    console.error(`[Analytics Error] Failed to track ${eventName}:`, error);
  }

  return false;
}

/** Helper para embudo de proveedores/médicos */
export function trackProviderFunnel(
  step: ProviderFunnelStep,
  params?: FunnelEventParams
): boolean {
  return trackFunnelEvent(step, {
    ...params,
    funnel_type: 'provider',
  });
}

/** Helper para embudo de pacientes */
export function trackPatientFunnel(
  step: PatientFunnelStep,
  params?: FunnelEventParams
): boolean {
  return trackFunnelEvent(step, {
    ...params,
    funnel_type: 'patient',
  });
}

/**
 * 📢 Telemetría de referidos médico-a-médico o paciente-a-paciente (MKT-REF-01)
 * Registra 'referral_invite_sent' sin PII (solo canal y rol).
 */
export function trackReferralInviteSent(
  channel: 'whatsapp' | 'email' | 'copy_link' | 'qr',
  role: 'provider' | 'patient' = 'provider'
): boolean {
  return trackFunnelEvent('referral_invite_sent', {
    channel,
    referrer_role: role,
    funnel_type: role,
  });
}
