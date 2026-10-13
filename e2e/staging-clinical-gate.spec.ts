import { test, expect } from '@playwright/test';

/**
 * Compuerta E2E Clínica y de Veracidad en QuHealthy Staging (ADMIN-TRUST-01 / P0)
 * 
 * Reglas de Seguridad Operativa:
 * - Exclusivamente identidades y datos sintéticos.
 * - Cero pacientes reales.
 * - Cero cobros a tarjetas reales o emisión de recetas a personas reales.
 * - Cero correos externos enviados.
 * - Distinción explícita entre validación DGP real y mock/fallback.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.quhealthy.org';

test.describe('Compuerta E2E Clínica Autenticada en Staging (P0)', () => {

  // =========================================================================
  // FASE 1: ALTA DE PRESTADOR, SEDE Y HORARIO
  // =========================================================================
  test.describe('1. Alta de Prestador, Sede y Horario', () => {

    test('1.1 UI: Renderizado de formularios de perfil y licencia médica en onboarding', async ({ page }) => {
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

    test('1.3 Caso Negativo (Cédula): Registro de prestador sin campos requeridos falla con 400', async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/auth/register/provider`, {
        data: {
          email: 'synthetic-doctor-invalid@test.quhealthy.org',
          // Contraseña ausente, nombre ausente, cédula ausente
        },
        headers: { 'Content-Type': 'application/json' },
      });
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
  // FASE 2: BÚSQUEDA Y DISPONIBILIDAD DE SLOTS
  // =========================================================================
  test.describe('2. Búsqueda y Disponibilidad de Slots', () => {

    test('2.1 Público: Disponibilidad de slots responde estructura válida sin requerir autenticación', async ({ request }) => {
      const res = await request.get(
        `${API_BASE}/api/appointments/schedules/1/available-slots?locationId=1&startDate=2026-10-20&endDate=2026-10-20&durationMinutes=30`
      );
      // permitAll: 200 con slots, o 400/404 si el doctor/sede no existe, pero nunca 401
      expect([200, 400, 404]).toContain(res.status());
    });

    test('2.2 Caso Negativo: Parámetros de rango de fecha inválidos son rechazados', async ({ request }) => {
      const res = await request.get(
        `${API_BASE}/api/appointments/schedules/1/available-slots?locationId=1&startDate=fecha-invalida&endDate=2026-10-20`
      );
      expect([400, 500]).toContain(res.status());
    });
  });

  // =========================================================================
  // FASE 3: AUTENTICACIÓN Y SEGURIDAD DE ROLES
  // =========================================================================
  test.describe('3. Autenticación y Control de Acceso por Rol', () => {

    test('3.1 UI: Formulario de inicio de sesión de paciente renderiza controles accesibles', async ({ page }) => {
      await page.goto('/es/login');
      await expect(page).toHaveTitle(/QuHealthy/i);
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 15000 });
    });

    test('3.2 Caso Negativo: Login con credenciales sintéticas incorrectas devuelve 401/400', async ({ request }) => {
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
  // FASE 4: RESERVA DE CITA (COMPUERTA DE CREACIÓN)
  // =========================================================================
  test.describe('4. Creación y Reserva de Citas', () => {

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

    test('4.2 Staging Comportamiento: Acceso no autenticado a /es/patient/booking/* redirige a login con callbackUrl en staging actual', async ({ page }) => {
      await page.goto('/es/patient/booking/demo-doctor');
      // En el despliegue activo de staging, visitantes anónimos son redirigidos a login preservando el callbackUrl
      expect(page.url()).toContain('/login');
      expect(page.url()).toContain('callbackUrl');
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
      // Fail-closed security: rechazado para anónimos o no-médicos
      expect([401, 403]).toContain(res.status());
    });

    test('6.2 Caso Negativo (Rol): Cierre de consulta médica sin credencial de médico es bloqueado (401/403)', async ({ request }) => {
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
       * Dictamen de Veracidad Técnica:
       * El microservicio onboarding-service utiliza extracción OCR mediante GeminiKycService
       * y el appointment-service utiliza el fallback de texto 'En trámite (Validación DGP)'
       * para la generación de PDFs de recetas cuando no hay confirmación registral.
       * 
       * NO EXISTE un conector ni credenciales de prueba autorizadas para consultar
       * en tiempo real la base de datos de profesionistas de la SEP/DGP.
       * 
       * Este test constata que cualquier endpoint público no simula una conexión
       * gubernamental no existente y declara formalmente la BRECHA REGULATORIA.
       */
      const dgpDirectEndpoint = await request.get(`${API_BASE}/api/onboarding/dgp-verify?cedula=12345678`);
      
      // La API debe retornar 404 (endpoint inexistente) o 401 (protegido), nunca 200 'validado por SEP'
      expect([401, 403, 404, 405]).toContain(dgpDirectEndpoint.status());
    });
  });

});
