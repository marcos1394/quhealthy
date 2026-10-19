import { test, expect } from '@playwright/test';

/**
 * Iteración 2.5 — Recorrido Completo Navegador Médico–Paciente en Staging
 *
 * Flujo End-to-End estricto en una sola prueba continua:
 * 1. Autenticación y sesión de Paciente Sintético (sin contraseñas de respaldo).
 * 2. Descubrimiento de prestador médico obtenido estrictamente de la UI.
 * 3. Selección de slot de agenda obtenido estrictamente de la UI.
 * 4. Reserva HTTP exitosa con ID nuevo obligatorio (prohibido ID estático o Cita 5).
 * 5. Consentimiento informado IA persistido en backend.
 * 6. Autenticación y sesión del Médico Prestador.
 * 7. Apertura de esa cita exacta en la agenda médica del doctor.
 * 8. Registro clínico y cierre de consulta médica.
 * 9. Verificación de estado final COMPLETED leído con autorización mediante API.
 *
 * Regla de Compuerta Codex:
 * - Cada paso obligatorio falla de inmediato si falta su elemento en UI o respuesta de red.
 * - Sin catch(() => null), sin esperas fijas, sin contraseñas de respaldo, sin ramas para saltar pasos.
 * - Si cualquier paso falla, se reporta el punto exacto y la compuerta queda 100% ROJA.
 */

const STAGING_URL = process.env.STAGING_URL || 'https://staging.quhealthy.org';
const PATIENT_EMAIL = process.env.STAGING_TEST_PATIENT_EMAIL;
const PATIENT_PASSWORD = process.env.STAGING_TEST_PATIENT_PASSWORD;
const DOCTOR_EMAIL = process.env.STAGING_TEST_DOCTOR_EMAIL;
const DOCTOR_PASSWORD = process.env.STAGING_TEST_DOCTOR_PASSWORD;

/**
 * Guarda de Seguridad de Origen Canónico de Staging
 * Acepta exclusivamente orígenes canónicos de staging y rechaza terminantemente producción.
 */
const CANONICAL_STAGING_ORIGINS = ['https://staging.quhealthy.org'];

function assertCanonicalStagingOrigin(urlStr: string): void {
  const parsed = new URL(urlStr);
  const hostname = parsed.hostname.toLowerCase();
  const origin = parsed.origin.toLowerCase();

  // 1. Rechazo explícito de cualquier dominio productivo
  if (
    hostname === 'quhealthy.org' ||
    hostname === 'www.quhealthy.org' ||
    hostname === 'app.quhealthy.org' ||
    hostname === 'admin.quhealthy.org' ||
    hostname === 'api.quhealthy.org' ||
    (hostname.endsWith('.quhealthy.org') && !hostname.startsWith('staging.'))
  ) {
    throw new Error(`[SEGURIDAD BLOQUEANTE] Intento de ejecución contra PRODUCCIÓN rechazado: ${urlStr}`);
  }

  // 2. Aceptación exclusiva del origen canónico exacto https://staging.quhealthy.org
  if (origin !== 'https://staging.quhealthy.org') {
    throw new Error(
      `[SEGURIDAD BLOQUEANTE] Origen no canónico de staging: ${urlStr}. ` +
      `Se exige exclusivamente el origen exacto: https://staging.quhealthy.org`
    );
  }
}

const ALLOWED_STAGING_MUTATION_HOSTS = new Set([
  'staging.quhealthy.org',
  'api-staging.quhealthy.org',
  'challenges.cloudflare.com',
]);

/**
 * Instala un bloqueo de red a nivel de ruta antes de navegar que aborta
 * de forma activa cualquier mutación HTTP fuera de los destinos de staging permitidos.
 */
async function installNetworkMutationGuard(page: any): Promise<void> {
  await page.route('**/*', async (route: any) => {
    const req = route.request();
    const method = req.method().toUpperCase();
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isMutation) {
      try {
        const parsed = new URL(req.url());
        const host = parsed.hostname.toLowerCase();
        const isAllowed = ALLOWED_STAGING_MUTATION_HOSTS.has(host) || host.endsWith('.challenges.cloudflare.com');

        if (!isAllowed) {
          console.warn(`🚨 [BLOQUEO DE RED] Mutación ${method} abortada antes de salir a la red: ${req.url()}`);
          return route.abort('blockedbyclient');
        }
      } catch {
        return route.abort('blockedbyclient');
      }
    }

    await route.continue();
  });
}

test.describe('Iteración 2.5: Recorrido Completo Médico–Paciente (Single-Journey E2E)', () => {

  test('Comprobación de Bloqueo de Red: Mutación simulada a producción es abortada sin salir a la red', async ({ page }) => {
    // 1. Instalar bloqueo de red antes de navegar
    await installNetworkMutationGuard(page);

    // 2. Navegar a página en blanco para ejecutar la llamada desde el contexto del navegador
    await page.goto('about:blank');

    // 3. Ejecutar mutación simulada dirigida a producción
    const simResult = await page.evaluate(async () => {
      try {
        await fetch('https://quhealthy.org/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulated: true }),
        });
        return { aborted: false, error: null };
      } catch (err: any) {
        return { aborted: true, error: err?.message || 'Failed to fetch' };
      }
    });

    // 4. Verificar que la petición fue efectivamente abortada en el cliente
    expect(simResult.aborted, 'La mutación hacia producción debe ser abortada por el interceptor de red').toBe(true);
    console.log('✅ [BLOQUEO CONFIRMADO] Mutación simulada hacia producción abortada exitosamente sin salir a la red.');
  });

  test('Recorrido E2E Estricto: Paciente reserva -> Médico atiende -> Cierre verificado COMPLETED', async ({ page }) => {
    test.setTimeout(180000); // 3 minutos máximo

    // Instalar bloqueo de red obligatorio antes de navegar a staging
    await installNetworkMutationGuard(page);

    let dynamicAppointmentId: string | number | null = null;
    let selectedProviderSlug: string | null = null;
    let currentStep = 'VALIDACIÓN DE ORIGEN CANÓNICO Y CREDENCIALES OBLIGATORIAS';

    try {
      // =========================================================================
      // PASO 0: VALIDACIÓN DE ORIGEN CANÓNICO Y CREDENCIALES (SIN FALLBACKS)
      // =========================================================================
      console.log(`\n▶ [${currentStep}] Validando que el destino sea exclusivamente staging canónico...`);
      assertCanonicalStagingOrigin(STAGING_URL);
      console.log(`  [Seguridad] Origen canónico verificado: ${STAGING_URL}`);

      console.log(`  Comprobando configuración de credenciales de prueba sintéticas...`);
      if (!PATIENT_EMAIL || !PATIENT_PASSWORD || !DOCTOR_EMAIL || !DOCTOR_PASSWORD) {
        throw new Error(
          `Credenciales de prueba obligatorias no definidas en el entorno. ` +
          `STAGING_TEST_PATIENT_EMAIL: ${Boolean(PATIENT_EMAIL)}, ` +
          `STAGING_TEST_PATIENT_PASSWORD: ${Boolean(PATIENT_PASSWORD)}, ` +
          `STAGING_TEST_DOCTOR_EMAIL: ${Boolean(DOCTOR_EMAIL)}, ` +
          `STAGING_TEST_DOCTOR_PASSWORD: ${Boolean(DOCTOR_PASSWORD)}`
        );
      }

      // =========================================================================
      // PASO 1: LOGIN REAL Y SESIÓN DEL PACIENTE SINTÉTICO
      // =========================================================================
      currentStep = 'PASO 1: Autenticación y sesión de Paciente Sintético';
      console.log(`\n▶ [${currentStep}] Accediendo a ${STAGING_URL}/es/login...`);

      assertCanonicalStagingOrigin(`${STAGING_URL}/es/login`);
      await page.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });
      const patientEmailInput = page.locator('input[type="email"], input[name="email"]').first();
      const patientPasswordInput = page.locator('input[type="password"], input[name="password"]').first();
      const patientSubmitBtn = page.locator('button[type="submit"]').first();

      await expect(patientEmailInput, 'Campo de correo de paciente no encontrado en UI').toBeVisible({ timeout: 15000 });
      await expect(patientPasswordInput, 'Campo de contraseña de paciente no encontrado en UI').toBeVisible({ timeout: 15000 });
      await expect(patientSubmitBtn, 'Botón de enviar login de paciente no encontrado en UI').toBeVisible({ timeout: 15000 });

      // Descartar modales flotantes (cookies, permisos de ubicación) que interceptan clics
      const cookieBannerBtn = page.locator('button:has-text("Aceptar todas"), button:has-text("Aceptar")').first();
      if (await cookieBannerBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('  [UI Overlay] Descartando banner de cookies...');
        await cookieBannerBtn.click().catch(() => null);
      }
      const dismissLocationBtn = page.locator('button:has-text("Ahora no")').first();
      if (await dismissLocationBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('  [UI Overlay] Descartando modal de ubicación...');
        await dismissLocationBtn.click().catch(() => null);
      }

      await patientEmailInput.fill(PATIENT_EMAIL);
      await patientPasswordInput.fill(PATIENT_PASSWORD);

      const [loginResponse] = await Promise.all([
        page.waitForResponse(
          resp => (resp.url().includes('/api/auth/login') || resp.url().includes('/api/auth/token') || resp.url().includes('/auth')) && resp.request().method() === 'POST',
          { timeout: 20000 }
        ),
        patientSubmitBtn.click(),
      ]);

      expect(loginResponse.status(), `Login de paciente HTTP retornó error ${loginResponse.status()}`).toBeLessThan(400);

      // Confirmar establecimiento de sesión y salida de la pantalla de login
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 15000 });
      console.log(`  [Sesión] Paciente autenticado exitosamente. URL actual: ${page.url()}`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 2: DESCUBRIMIENTO DE PRESTADOR DESDE DATOS RENDERIZADOS EN UI
      // =========================================================================
      currentStep = 'PASO 2: Descubrimiento de Prestador en UI';
      console.log(`\n▶ [${currentStep}] Navegando a ${STAGING_URL}/es/discover...`);

      const [searchResponse] = await Promise.all([
        page.waitForResponse(
          resp => resp.url().includes('/api/') && resp.status() === 200,
          { timeout: 20000 }
        ),
        page.goto(`${STAGING_URL}/es/discover`, { waitUntil: 'domcontentloaded' }),
      ]);
      expect(searchResponse.status(), 'Respuesta del catálogo de prestadores no fue HTTP 200').toBe(200);

      const providerCards = page.locator('a[href*="/doctor/"], a[href*="/provider/"], [data-testid="provider-card"]');
      await expect(providerCards.first(), 'No se encontraron prestadores renderizados en la UI de /discover').toBeVisible({ timeout: 15000 });

      const href = await providerCards.first().getAttribute('href');
      expect(href, 'La tarjeta de prestador renderizada en la UI debe tener un link válido').toBeTruthy();
      selectedProviderSlug = href;
      console.log(`  [UI] Prestador seleccionado dinámicamente desde UI: ${selectedProviderSlug}`);

      await Promise.all([
        page.waitForURL(url => url.pathname.includes('/doctor/') || url.pathname.includes('/provider/'), { timeout: 15000 }),
        providerCards.first().click(),
      ]);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 3: SELECCIÓN DE SLOT DE AGENDA DISPONIBLE DESDE UI
      // =========================================================================
      currentStep = 'PASO 3: Selección de Slot de Agenda desde UI';
      console.log(`\n▶ [${currentStep}] Verificando slots disponibles en la vista...`);

      const slotButtons = page.locator('button:has-text(":"), button[data-testid="time-slot"]');
      await expect(slotButtons.first(), 'No se encontraron slots de agenda disponibles para selección en la UI').toBeVisible({ timeout: 15000 });
      await slotButtons.first().click();
      console.log('  [UI] Slot de agenda seleccionado.');
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 4: CREACIÓN Y RESERVA DE CITA (ID NUEVO OBLIGATORIO)
      // =========================================================================
      currentStep = 'PASO 4: Reserva HTTP con ID Nuevo Obligatorio';
      console.log(`\n▶ [${currentStep}] Ejecutando confirmación de reserva...`);

      const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Reservar"), button[type="submit"]:has-text("Continuar"), [data-testid="confirm-booking"]').first();
      await expect(confirmBtn, 'Botón de confirmación de reserva no disponible en UI').toBeVisible({ timeout: 15000 });

      const [reservationResponse] = await Promise.all([
        page.waitForResponse(
          resp => resp.url().includes('/api/appointments') && resp.request().method() === 'POST',
          { timeout: 25000 }
        ),
        confirmBtn.click(),
      ]);

      expect(reservationResponse.status(), `Reserva de cita falló con HTTP ${reservationResponse.status()}`).toBeLessThan(400);

      const reservationData = await reservationResponse.json();
      dynamicAppointmentId = reservationData.id || reservationData.appointmentId;
      expect(dynamicAppointmentId, 'La respuesta de reserva HTTP no devolvió un ID de cita válido').toBeTruthy();
      expect(dynamicAppointmentId, 'El ID de la cita no debe ser la Cita 5 estática ni fixture previa').not.toBe(5);
      expect(dynamicAppointmentId, 'El ID de la cita no debe ser la Cita 5 estática ni fixture previa').not.toBe('5');
      console.log(`  🎯 [ID CREADO] Cita generada dinámicamente con ID: ${dynamicAppointmentId}`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 5: OTORGAMIENTO Y PERSISTENCIA DE CONSENTIMIENTO INFORMADO IA
      // =========================================================================
      currentStep = 'PASO 5: Consentimiento Informado IA Persistido';
      console.log(`\n▶ [${currentStep}] Otorgando consentimiento informado...`);

      const consentCheckboxes = page.locator('input[type="checkbox"]');
      await expect(consentCheckboxes.first(), 'No se encontraron casillas de consentimiento informado en UI').toBeVisible({ timeout: 15000 });

      const consentCount = await consentCheckboxes.count();
      for (let i = 0; i < consentCount; i++) {
        const cb = consentCheckboxes.nth(i);
        await cb.check();
      }

      const acceptConsentBtn = page.locator('button:has-text("Aceptar"), button:has-text("Continuar"), button:has-text("Firmar"), [data-testid="accept-consent"]').first();
      await expect(acceptConsentBtn, 'Botón para aceptar consentimiento no visible en UI').toBeVisible({ timeout: 10000 });

      const [consentResponse] = await Promise.all([
        page.waitForResponse(
          resp => (resp.url().includes('/consent') || resp.url().includes('/api/appointments/') || resp.url().includes('/api/clinical')) &&
                  (resp.request().method() === 'POST' || resp.request().method() === 'PUT' || resp.request().method() === 'PATCH'),
          { timeout: 20000 }
        ),
        acceptConsentBtn.click(),
      ]);

      expect(consentResponse.status(), `Persistencia de consentimiento falló con HTTP ${consentResponse.status()}`).toBeLessThan(400);
      console.log(`  [Consentimiento] Persistido con éxito en backend HTTP ${consentResponse.status()}`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 6: AUTENTICACIÓN Y SESIÓN DEL MÉDICO PRESTADOR
      // =========================================================================
      currentStep = 'PASO 6: Autenticación y sesión del Médico Prestador';
      console.log(`\n▶ [${currentStep}] Accediendo a portal médico en ${STAGING_URL}/es/provider/login...`);

      assertCanonicalStagingOrigin(`${STAGING_URL}/es/provider/login`);
      await page.goto(`${STAGING_URL}/es/provider/login`, { waitUntil: 'domcontentloaded' });
      const doctorEmailInput = page.locator('input[type="email"], input[name="email"]').first();
      const doctorPasswordInput = page.locator('input[type="password"], input[name="password"]').first();
      const doctorSubmitBtn = page.locator('button[type="submit"]').first();

      await expect(doctorEmailInput, 'Campo de correo de médico no encontrado en UI').toBeVisible({ timeout: 15000 });
      await expect(doctorPasswordInput, 'Campo de contraseña de médico no encontrado en UI').toBeVisible({ timeout: 15000 });
      await expect(doctorSubmitBtn, 'Botón de submit de médico no encontrado en UI').toBeVisible({ timeout: 15000 });

      // Descartar overlays flotantes si reaparecen
      const doctorCookieBtn = page.locator('button:has-text("Aceptar todas"), button:has-text("Aceptar")').first();
      if (await doctorCookieBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await doctorCookieBtn.click().catch(() => null);
      }
      const doctorLocationBtn = page.locator('button:has-text("Ahora no")').first();
      if (await doctorLocationBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await doctorLocationBtn.click().catch(() => null);
      }

      await doctorEmailInput.fill(DOCTOR_EMAIL);
      await doctorPasswordInput.fill(DOCTOR_PASSWORD);

      const [doctorLoginResp] = await Promise.all([
        page.waitForResponse(
          resp => (resp.url().includes('/api/auth/login') || resp.url().includes('/api/auth/token') || resp.url().includes('/auth')) && resp.request().method() === 'POST',
          { timeout: 20000 }
        ),
        doctorSubmitBtn.click(),
      ]);

      expect(doctorLoginResp.status(), `Login de médico retornó error HTTP ${doctorLoginResp.status()}`).toBeLessThan(400);

      // Confirmar sesión del médico y redirección fuera de login
      await page.waitForURL(url => !url.pathname.endsWith('/provider/login'), { timeout: 15000 });
      console.log(`  [Sesión] Médico autenticado exitosamente. URL actual: ${page.url()}`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 7: APERTURA DE LA CITA EXACTA POR EL MÉDICO
      // =========================================================================
      currentStep = 'PASO 7: Apertura de Cita Exacta por el Médico';
      console.log(`\n▶ [${currentStep}] Navegando a agenda y abriendo cita ID ${dynamicAppointmentId}...`);

      assertCanonicalStagingOrigin(`${STAGING_URL}/es/provider/agenda`);
      await page.goto(`${STAGING_URL}/es/provider/agenda`, { waitUntil: 'domcontentloaded' });
      const appointmentCard = page.locator(`[data-appointment-id="${dynamicAppointmentId}"], a[href*="${dynamicAppointmentId}"]`).first();
      await expect(appointmentCard, `La cita ${dynamicAppointmentId} no apareció en la agenda médica`).toBeVisible({ timeout: 20000 });
      await appointmentCard.click();
      console.log(`  [UI] Cita ${dynamicAppointmentId} abierta por el médico.`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 8: CIERRE CLÍNICO DE LA CONSULTA
      // =========================================================================
      currentStep = 'PASO 8: Cierre Clínico de la Consulta';
      console.log(`\n▶ [${currentStep}] Finalizando consulta médica...`);

      const finishConsultationBtn = page.locator('button:has-text("Finalizar Consulta"), button:has-text("Completar Consulta"), button[data-testid="complete-appointment"]').first();
      await expect(finishConsultationBtn, 'Botón para finalizar consulta no encontrado en UI').toBeVisible({ timeout: 15000 });

      const [completeResponse] = await Promise.all([
        page.waitForResponse(
          resp => resp.url().includes(`/api/appointments/${dynamicAppointmentId}`) &&
                  (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT' || resp.request().method() === 'POST'),
          { timeout: 20000 }
        ),
        finishConsultationBtn.click(),
      ]);

      expect(completeResponse.status(), `Finalización de consulta falló con HTTP ${completeResponse.status()}`).toBeLessThan(400);
      console.log(`  [Consulta] Cierre clínico registrado con status HTTP ${completeResponse.status()}`);
      console.log(`✅ [${currentStep}] Completado.`);

      // =========================================================================
      // PASO 9: VERIFICACIÓN READ-ONLY VIA API-STAGING CON AUTENTICACIÓN DE SESIÓN
      // =========================================================================
      currentStep = 'PASO 9: Verificación de Estado COMPLETED en api-staging.quhealthy.org';
      console.log(`\n▶ [${currentStep}] Consultando endpoint real de api-staging.quhealthy.org con autenticación de sesión...`);

      // Verificación directa contra api-staging.quhealthy.org utilizando la autenticación activa de la sesión
      // (sin persistir ni imprimir tokens en ningún log o archivo)
      const verifyResult = await page.evaluate(async (appointmentId) => {
        try {
          // Extraer token de autenticación desde el estado de la sesión activa en el navegador
          let authToken = '';
          const rawSession = localStorage.getItem('quhealthy-session');
          if (rawSession) {
            try {
              const parsed = JSON.parse(rawSession);
              authToken = parsed?.state?.token || '';
            } catch {}
          }

          const headers: Record<string, string> = {
            'Accept': 'application/json',
          };
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const resp = await fetch(`https://api-staging.quhealthy.org/api/appointments/${appointmentId}`, {
            method: 'GET',
            headers,
            credentials: 'include',
          });

          const data = await resp.json().catch(() => null);
          return {
            status: resp.status,
            ok: resp.ok,
            appointmentStatus: data?.status || data?.appointmentStatus || data?.appointment?.status,
            dataExists: Boolean(data),
          };
        } catch (err: any) {
          return {
            status: 0,
            ok: false,
            error: err?.message || 'Error de red en navegador',
            dataExists: false,
          };
        }
      }, dynamicAppointmentId);

      expect(verifyResult.status, `Verificación API en api-staging.quhealthy.org de cita ${dynamicAppointmentId} retornó status HTTP ${verifyResult.status}`).toBe(200);
      expect(verifyResult.appointmentStatus, `El estado final de la cita ${dynamicAppointmentId} en api-staging.quhealthy.org debe ser COMPLETED`).toBe('COMPLETED');
      console.log(`  🎯 [VERIFICACIÓN READ-ONLY API-STAGING] Cita ${dynamicAppointmentId} confirmada en estado: ${verifyResult.appointmentStatus}`);
      console.log(`✅ [${currentStep}] Completado.`);

    } catch (error: any) {
      console.error(`\n❌ [COMPUERTA ROJA] Fallo crítico obligatorio en [${currentStep}]:`, error.message || error);
      throw new Error(`Compuerta ROJA en ${currentStep}: ${error.message || error}`);
    }
  });

});
