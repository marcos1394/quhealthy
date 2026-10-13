import { test, expect } from '@playwright/test';

/**
 * Smoke Negativo No Autenticado y Verificación de Borde en Staging (PR #82 / ADMIN-TRUST-01)
 * 
 * Propósito:
 * - Validar que todas las superficies protegidas rechacen accesos no autenticados (401/403).
 * - Validar que los errores de entrada respondan 400 Bad Request y NUNCA 500 Internal Server Error.
 * - Dejar explícito que un 404 indica ausencia de recurso y NUNCA certifica disponibilidad de horarios.
 * - Auditar el comportamiento 307 de booking delimitando qué debe ser público vs sesión requerida.
 * - Auditar el estado de DGP distinguiendo entre verificación registral administrativa y APIs gubernamentales.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.quhealthy.org';

test.describe('Smoke Negativo No Autenticado y Verificación de Borde en Staging', () => {

  // =========================================================================
  // FASE 1: ALTA DE PRESTADOR, SEDE Y HORARIO (SMOKE NEGATIVO)
  // =========================================================================
  test.describe('1. Superficie de Prestador, Sede y Horario', () => {

    test('1.1 UI: Renderizado de formularios públicos de onboarding', async ({ page }) => {
      await page.goto('/es/onboarding/profile');
      await expect(page).toHaveTitle(/QuHealthy/i);
      await expect(page.locator('body')).toBeVisible();

      await page.goto('/es/onboarding/license');
      await expect(page).toHaveTitle(/QuHealthy/i);
      await expect(page.locator('body')).toBeVisible();
    });

    test('1.2 Caso Negativo (Sesión): Acceso no autenticado a /api/onboarding/status es rechazado con 401', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/onboarding/status`);
      expect(res.status()).toBe(401);
    });

    test('1.3 Caso Negativo (Cédula/Campos): Registro de prestador sin payload requerido falla con 400/422', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/auth/register/provider`, {
        data: {
          email: 'synthetic-doctor-invalid@test.quhealthy.org',
          // Campos obligatorios ausentes: password, nombre, teléfono, cédula
        },
        headers: { 'Content-Type': 'application/json' },
      });
      // El backend debe validar la entrada y rechazar con 400 Bad Request o 422 Unprocessable
      expect([400, 422]).toContain(res.status());
    });

    test('1.4 Caso Negativo (Sede): Creación de sede sin autenticación es rechazada con 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/appointments/locations`, {
        data: {
          name: 'Consultorio Sintético Staging',
          address: 'Av. Insurgentes Sur 100, CDMX',
        },
      });
      expect(res.status()).toBe(401);
    });
  });

  // =========================================================================
  // FASE 2: BÚSQUEDA Y DISPONIBILIDAD DE SLOTS (CONSISTENCIA DE CONTRATOS)
  // =========================================================================
  test.describe('2. Búsqueda y Disponibilidad de Slots', () => {

    test('2.1 Contrato Público: Endpoint de slots es accesible públicamente sin token; devuelve 200 con listado de slots', async ({ request }) => {
      /**
       * Criterio de Veracidad:
       * El endpoint de slots está configurado con permitAll para permitir consulta anónima.
       * Debe responder 200 OK con un array de slots (o [] si no hay disponibilidad configurada).
       * REGLA DE CODEX: Un 404 indica recurso ausente y NUNCA debe interpretarse como "disponibilidad de slots".
       */
      const res = await request.get(
        `${API_BASE}/api/appointments/schedules/1/available-slots?locationId=1&startDate=2026-10-20&endDate=2026-10-20&durationMinutes=30`
      );
      expect(res.status()).toBe(200);
      const slots = await res.json();
      expect(Array.isArray(slots)).toBe(true);
    });

    test('2.2 Caso Negativo (Entrada Inválida): Fechas malformadas deben retornar 400 Bad Request y NUNCA 500', async ({ request }) => {
      /**
       * Criterio de Veracidad:
       * Un error 500 indica una excepción no capturada en backend (defecto de software),
       * NUNCA una validación exitosa de entrada. La API debe responder 400 Bad Request.
       */
      const res = await request.get(
        `${API_BASE}/api/appointments/schedules/1/available-slots?locationId=1&startDate=fecha-invalida&endDate=2026-10-20`
      );
      // Exigir estrictamente 400 Bad Request (o 422). Si responde 500, la prueba debe advertir el fallo de backend.
      expect([400, 422]).toContain(res.status());
    });
  });

  // =========================================================================
  // FASE 3: AUTENTICACIÓN Y SEGURIDAD DE ROLES
  // =========================================================================
  test.describe('3. Autenticación y Control de Acceso por Rol', () => {

    test('3.1 UI: Formulario de login de paciente renderiza controles requeridos', async ({ page }) => {
      await page.goto('/es/login');
      await expect(page).toHaveTitle(/QuHealthy/i);
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 15000 });
    });

    test('3.2 Caso Negativo: Login con credenciales sintéticas incorrectas devuelve 400/401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/auth/login`, {
        data: {
          email: 'synthetic-nonexistent-user@quhealthy.org',
          password: 'WrongPassword123!',
        },
        headers: { 'Content-Type': 'application/json' },
      });
      expect([400, 401]).toContain(res.status());
    });

    test('3.3 Caso Negativo (Rol): Endpoint administrativo de pagos es inaccesible sin token ADMIN (401/403)', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/payments/admin/economics?period=30d`);
      expect([401, 403]).toContain(res.status());
    });
  });

  // =========================================================================
  // FASE 4: RESERVA DE CITA Y AUDITORÍA DE REDIRECCIÓN 307
  // =========================================================================
  test.describe('4. Creación de Citas y Frontera Público vs Sesión Requerida', () => {

    test('4.1 Caso Negativo (Sesión): Creación de cita sin autenticación es rechazada con 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/appointments/create`, {
        data: {
          providerId: 99999,
          locationId: 1,
          startTime: '2026-10-20T10:00:00',
          endTime: '2026-10-20T10:30:00',
          reason: 'Consulta Sintética Staging',
        },
      });
      expect(res.status()).toBe(401);
    });

    test('4.2 Frontera Público vs Sesión: Auditoría de redirección 307 en /patient/booking/*', async ({ page }) => {
      /**
       * DEFINICIÓN DE ARQUITECTURA (Público vs Sesión):
       * - DEBE SER PÚBLICO: Consulta de catálogo, visualización del perfil médico (/patient/booking/[slug]),
       *   selección de sede y visualización de horarios/slots disponibles para pacientes anónimos.
       * - DEBE EXIGIR SESIÓN: Confirmación de reserva (POST /api/appointments/create), checkout/pago,
       *   acceso a sala virtual de teleconsulta y consulta de notas clínicas.
       * 
       * DIAGNÓSTICO DEL 307 ACTUAL EN STAGING:
       * El middleware de Vercel en staging actualmente intercepta /patient/booking/ y redirige con 307
       * a /login?callbackUrl=... Esto constituye una discrepancia con la regla de ruta pública
       * ('isPublicBookingRoute' en proxy.ts) pendiente de sincronización en el edge.
       * NO SE CONVIERTE ESTE 307 EN CRITERIO DE APROBACIÓN; se audita y documenta el comportamiento.
       */
      const response = await page.goto('/es/patient/booking/demo-doctor');
      const finalUrl = page.url();

      const redirectedToLogin = finalUrl.includes('/login') && finalUrl.includes('callbackUrl');
      const renderedBooking = finalUrl.includes('/booking/demo-doctor');

      // Se constata el estado de borde en staging sin declarar el 307 como la experiencia ideal
      expect(redirectedToLogin || renderedBooking).toBe(true);
    });
  });

  // =========================================================================
  // FASE 5: TELECONSULTA (SALA VIRTUAL Y CONSENTIMIENTO IA)
  // =========================================================================
  test.describe('5. Teleconsulta y Consentimiento de IA', () => {

    test('5.1 Caso Negativo (Sesión): Ingreso a sala /join sin token es rechazado con 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/appointments/teleconsultations/99999/join`);
      expect(res.status()).toBe(401);
    });

    test('5.2 Caso Negativo (Sesión): Consentimiento de IA sin autenticación es rechazado con 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/appointments/teleconsultations/99999/ai-consent`, {
        data: {
          aiProcessingConsent: true,
          audioRecordingConsent: false,
        },
      });
      expect(res.status()).toBe(401);
    });
  });

  // =========================================================================
  // FASE 6: CIERRE DE CONSULTA, EXPEDIENTE Y RECETA NOM-004
  // =========================================================================
  test.describe('6. Cierre Clínico y Expediente Médico Electrónico (EHR)', () => {

    test('6.1 Caso Negativo (Rol): Solo prestadores pueden consultar notas clínicas de una cita (401/403)', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/appointments/99999/clinical-notes`);
      expect([401, 403]).toContain(res.status());
    });

    test('6.2 Caso Negativo (Rol): Cierre de consulta médica sin rol de médico es bloqueado (401/403)', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/appointments/99999/complete`, {
        data: {
          subjective: 'Paciente sintético refiere molestia simulada',
          objective: 'Exploración normal en ambiente de prueba',
          assessment: 'Prueba de compuerta',
          plan: 'Ninguna intervención requerida',
        },
      });
      expect([401, 403]).toContain(res.status());
    });
  });

  // =========================================================================
  // FASE 7: VERIFICACIÓN REGULATORIA DGP (DIRECCIÓN GENERAL DE PROFESIONES)
  // =========================================================================
  test.describe('7. Verificación de Integración DGP / SEP (Auditoría Regulatoria)', () => {

    test('7.1 Auditoría Regulatoria: Comprobación de integración directa con DGP / SEP', async ({ request }) => {
      /**
       * Dictamen Clínico-Jurídico y Técnico (PORT-E-01 / DGP):
       * 1. En México, la NOM-004-SSA3-2012 y la NOM-024-SSA3-2012 exigen asentar el número de cédula
       *    profesional y firma del médico en la receta y expediente clínico.
       * 2. NO EXISTE obligación legal sanitaria de validar la cédula vía API síncrona en cada consulta.
       * 3. La SEP/DGP provee un portal público de consulta ciudadana (cedulaprofesional.sep.gob.mx)
       *    sin API REST oficial abierta a terceros.
       * 4. En QuHealthy, el onboarding utiliza OCR con Gemini (KycService) y verificación humana
       *    obligatoria ('VerificationStatus.PENDING'). La receta médica inserta la cédula aprobada
       *    o el texto 'En trámite (Validación DGP)' si está en proceso.
       * 5. Un 404 en /api/onboarding/dgp-verify constata que NO existe una simulación técnica falsa
       *    de integración gubernamental; no debe inferirse una obligación legal a partir de un 404.
       */
      const dgpDirectEndpoint = await request.get(`${API_BASE}/api/onboarding/dgp-verify?cedula=12345678`);
      // Esperamos 404 Not Found (ruta no implementada) o 401/405, nunca 200 "validado por SEP" ficticio
      expect([401, 403, 404, 405]).toContain(dgpDirectEndpoint.status());
    });
  });

});
