import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

/**
 * Iteración 2.5.1 — Compuerta E2E sin Adaptadores (Staging Canónico)
 *
 * Flujo End-to-End estricto SIN adaptadores de red, SIN cookies inyectadas manualmente
 * y SIN inspección de React Fiber ni mutación del DOM:
 * - Test 0: Comprobación de CORS Real desde Navegador (Preflight OPTIONS + Petición Real hacia appointment-service).
 * - Test 1: Comprobación de Bloqueo de Red Pre-Navegación (Producción abortada sin salir a la red).
 * - Test 2: Comprobación de Bloqueo de Firestore (firestore.googleapis.com abortada sin salir a la red).
 * - Test 3: Comprobación de Bloqueo de Red Post-Login (Mutación prohibida dispara compuerta roja).
 * - Test 4: Comprobación de Aislamiento de Staging (Cero solicitudes a Firestore en páginas autenticadas).
 * - Test 5: Primera Visita: Resolución determinista de avisos legales pulsando «Rechazar» en la UI.
 * - Test 6: Recorrido E2E Estricto sin Adaptadores: Login Real, Navegación Protegida en Ambos Roles, Reserva y Cierre Operativo.
 * - Test 7: Integración de API de Consentimiento de IA (POST y GET sobre la cita recién creada; no ejercita UI ni certifica cumplimiento normativo NOM-004/NOM-024).
 */

const STAGING_URL = process.env.STAGING_URL || 'https://staging.quhealthy.org';
const PATIENT_EMAIL = process.env.STAGING_TEST_PATIENT_EMAIL;
const PATIENT_PASSWORD = process.env.STAGING_TEST_PATIENT_PASSWORD;
const DOCTOR_EMAIL = process.env.STAGING_TEST_DOCTOR_EMAIL;
const DOCTOR_PASSWORD = process.env.STAGING_TEST_DOCTOR_PASSWORD;

/**
 * ID de cita compartido entre compuertas para verificar
 * consentimiento independiente de IA y cierre clínico estructurado.
 */
let sharedAppointmentId: number | null = null;
let sharedPatientAuthToken: string | null = null;
let sharedDoctorAuthToken: string | null = null;

/**
 * Guarda de Seguridad de Origen Canónico de Staging
 * Acepta exclusivamente el origen canónico https://staging.quhealthy.org y rechaza terminantemente producción.
 */
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
    (hostname.endsWith('.quhealthy.org') && !hostname.startsWith('staging.') && !hostname.startsWith('api-staging.'))
  ) {
    throw new Error(`[SEGURIDAD BLOQUEANTE] Intento de ejecución contra PRODUCCIÓN rechazado: ${urlStr}`);
  }

  // 2. Aceptación exclusiva de orígenes de staging canónicos
  if (origin !== 'https://staging.quhealthy.org' && origin !== 'https://api-staging.quhealthy.org') {
    throw new Error(
      `[SEGURIDAD BLOQUEANTE] Origen no canónico de staging: ${urlStr}. ` +
      `Se exige exclusivamente: https://staging.quhealthy.org o https://api-staging.quhealthy.org`
    );
  }
}

const ALLOWED_STAGING_MUTATION_HOSTS = new Set([
  'staging.quhealthy.org',
  'api-staging.quhealthy.org',
  'challenges.cloudflare.com',
  'maps.googleapis.com',
]);

/**
 * Instala únicamente la guarda de seguridad que aborta tráfico prohibido
 * (Firestore, telemetría externa y mutaciones fuera de los hosts permitidos de staging).
 * NO modifica encabezados Origin, NO responde artificialmente a OPTIONS,
 * NO reescribe encabezados CORS y NO altera cuerpos JSON de negocio.
 */
async function installNetworkMutationGuard(page: Page, onViolation?: (violation: string) => void): Promise<void> {
  await page.route('**/*', async (route) => {
    const req = route.request();
    const urlStr = req.url();

    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname.toLowerCase();
      const method = req.method().toUpperCase();

      // 1. Bloquear terminantemente Firestore y cualquier host productivo
      if (
        host === 'firestore.googleapis.com' ||
        host.endsWith('.firestore.googleapis.com') ||
        urlStr.includes('firestore.googleapis.com')
      ) {
        const firestoreViolation = `Solicitud prohibida interceptada hacia Firestore: ${method} ${urlStr}`;
        console.error(`🚨 [BLOQUEO DE RED] ${firestoreViolation}`);
        await route.abort('blockedbyclient');
        if (onViolation) onViolation(firestoreViolation);
        return;
      }

      // 2. Bloquear telemetría / scripts de previsualización ajenos a la aplicación clínica
      if (
        host === 'vercel.live' ||
        host.endsWith('.vercel.live') ||
        host.includes('merchantverse') ||
        host.includes('google-analytics.com') ||
        host.includes('googletagmanager.com') ||
        host.includes('doubleclick.net') ||
        host === 'play.google.com' ||
        (host.endsWith('google.com') && (urlStr.includes('/g/collect') || urlStr.includes('batchexecute') || urlStr.includes('/log')))
      ) {
        return route.abort('blockedbyclient');
      }

      // 3. Verificación estricta de mutaciones HTTP (sólo orígenes permitidos de staging)
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
      if (isMutation) {
        const isAllowed =
          ALLOWED_STAGING_MUTATION_HOSTS.has(host) ||
          host.endsWith('.challenges.cloudflare.com');

        if (!isAllowed) {
          const violationMsg = `Mutación no permitida interceptada hacia: ${method} ${urlStr}`;
          console.error(`🚨 [BLOQUEO DE RED] ${violationMsg}`);
          await route.abort('blockedbyclient');
          if (onViolation) onViolation(violationMsg);
          return;
        }
      }
    } catch {
      return route.abort('blockedbyclient');
    }

    await route.continue();
  });
}

/**
 * Preload determinista de preferencias no clínicas para el recorrido principal.
 * Configura únicamente preferencias esenciales (functional, analytics y marketing en false).
 */
async function preloadNonClinicalPreferences(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'quhealthy_cookie_consent',
        JSON.stringify({
          essential: true,
          functional: false,
          analytics: false,
          marketing: false,
          timestamp: new Date().toISOString(),
          policyVersion: '2026-06-18',
        })
      );
      window.sessionStorage.setItem('quhealthy_location_prompted', 'true');
      window.localStorage.setItem('quhealthy_location_dismissed_at', Date.now().toString());
      window.localStorage.setItem('quhealthy_pulso_dismissed', 'true');
    } catch (e) {
      console.warn('Error preloading preferences:', e);
    }
  });
}

// Desactivar trazas, screenshots y grabaciones de red para proteger credenciales y sesiones
test.use({
  trace: 'off',
  screenshot: 'off',
  video: 'off',
});

test.describe.configure({ mode: 'serial', retries: 0 });

test.describe('Iteración 2.5.1: Compuerta E2E sin Adaptadores (Staging)', () => {

  // =========================================================================
  // TEST 0: COMPROBACIÓN DE CORS DESDE NAVEGADOR REAL (SIN ADAPTADORES)
  // =========================================================================
  test('Comprobación de CORS Real desde Navegador: Preflight OPTIONS y petición cross-origin hacia appointment-service en api-staging.quhealthy.org', async ({ page }) => {
    await installNetworkMutationGuard(page);
    await page.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });

    const corsRequests: Array<{ method: string; url: string; headers: Record<string, string> }> = [];
    const corsFailures: Array<{ method: string; url: string; errorText: string | undefined }> = [];
    const corsConsoleErrors: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('api-staging.quhealthy.org/api/appointments')) {
        corsRequests.push({
          method: req.method(),
          url: req.url(),
          headers: req.headers(),
        });
      }
    });

    page.on('requestfailed', (req) => {
      if (req.url().includes('api-staging.quhealthy.org/api/appointments')) {
        corsFailures.push({
          method: req.method(),
          url: req.url(),
          errorText: req.failure()?.errorText,
        });
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('cors')) {
        corsConsoleErrors.push(msg.text());
      }
    });

    // 1. Ejecutar fetch cross-origin real desde el contexto del navegador (https://staging.quhealthy.org -> https://api-staging.quhealthy.org)
    const browserFetchResult = await page.evaluate(async () => {
      try {
        const res = await fetch('https://api-staging.quhealthy.org/api/appointments/provider', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer cors-probe-token',
          },
          credentials: 'include',
        });
        return {
          ok: true,
          status: res.status,
          allowOrigin: res.headers.get('access-control-allow-origin'),
          error: null,
        };
      } catch (err: any) {
        return {
          ok: false,
          status: null,
          allowOrigin: null,
          error: err?.message || String(err),
        };
      }
    });

    // 2. Inspeccionar la respuesta exacta del servidor tanto al preflight OPTIONS como a la petición real GET con Origin
    const preflightProbe = await page.request.fetch('https://api-staging.quhealthy.org/api/appointments/provider', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://staging.quhealthy.org',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });
    const preflightStatus = preflightProbe.status();
    const preflightHeaders = preflightProbe.headers();
    const preflightBody = await preflightProbe.text();

    const actualGetProbe = await page.request.fetch('https://api-staging.quhealthy.org/api/appointments/provider', {
      method: 'GET',
      headers: {
        'Origin': 'https://staging.quhealthy.org',
        'Accept': 'application/json',
        'Authorization': 'Bearer cors-probe-token',
      },
    });
    const actualGetStatus = actualGetProbe.status();
    const actualGetHeaders = actualGetProbe.headers();
    const actualGetBody = await actualGetProbe.text();

    console.log('\n📋 [DIAGNÓSTICO CORS NAVEGADOR REAL - APPOINTMENT-SERVICE]');
    console.log('  Servicio responsable: appointment-service (Cloud Run / detrás de api-staging.quhealthy.org)');
    console.log('  Petición emitida por el navegador:', JSON.stringify(corsRequests, null, 2));
    console.log('  Resultado fetch en navegador:', JSON.stringify(browserFetchResult));
    console.log('  Respuesta a Preflight OPTIONS (Cloudflare Edge / Gateway):', JSON.stringify({
      status: preflightStatus,
      allowOrigin: preflightHeaders['access-control-allow-origin'] || null,
      allowCredentials: preflightHeaders['access-control-allow-credentials'] || null,
      server: preflightHeaders['server'] || null,
      body: preflightBody,
    }, null, 2));
    console.log('  Respuesta a Petición Real GET (appointment-service CorsFilter):', JSON.stringify({
      status: actualGetStatus,
      allowOrigin: actualGetHeaders['access-control-allow-origin'] || null,
      allowCredentials: actualGetHeaders['access-control-allow-credentials'] || null,
      vary: actualGetHeaders['vary'] || null,
      body: actualGetBody,
    }, null, 2));

    expect(
      [200, 204],
      `Preflight OPTIONS devolvió HTTP ${preflightStatus}`
    ).toContain(preflightStatus);
    expect(
      preflightHeaders['access-control-allow-origin'],
      'El preflight OPTIONS debe incluir Access-Control-Allow-Origin: https://staging.quhealthy.org'
    ).toBe('https://staging.quhealthy.org');

    // Comprobación crítica sobre la petición real que llega a appointment-service:
    // Si appointment-service rechaza Origin: https://staging.quhealthy.org en su CorsFilter,
    // devuelve HTTP 403 "Invalid CORS request" SIN encabezado Access-Control-Allow-Origin.
    expect(
      actualGetBody,
      `[DEFECTO CORS EN APPOINTMENT-SERVICE] La petición real GET https://api-staging.quhealthy.org/api/appointments/provider con Origin: https://staging.quhealthy.org fue rechazada por CorsFilter de appointment-service con HTTP ${actualGetStatus} y cuerpo "${actualGetBody}"`
    ).not.toContain('Invalid CORS request');
    expect(
      actualGetHeaders['access-control-allow-origin'],
      `[DEFECTO CORS EN APPOINTMENT-SERVICE] La respuesta de appointment-service a la petición real GET con Origin: https://staging.quhealthy.org omitió el encabezado Access-Control-Allow-Origin (status=${actualGetStatus}, body="${actualGetBody}")`
    ).toBe('https://staging.quhealthy.org');
    expect(
      browserFetchResult.allowOrigin,
      '[DEFECTO CORS EN APPOINTMENT-SERVICE] El navegador no recibió Access-Control-Allow-Origin: https://staging.quhealthy.org en la respuesta real'
    ).toBe('https://staging.quhealthy.org');
  });

  // =========================================================================
  // TEST 1: COMPROBACIÓN DE BLOQUEO PRE-NAVEGACIÓN A PRODUCCIÓN
  // =========================================================================
  test('Comprobación de Bloqueo de Red Pre-Navegación: Mutación simulada a producción es abortada sin salir a la red', async ({ page }) => {
    await installNetworkMutationGuard(page);
    await page.goto('about:blank');

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

    expect(simResult.aborted, 'La mutación hacia producción debe ser abortada por el interceptor de red').toBe(true);
    console.log('✅ [BLOQUEO CONFIRMADO] Mutación simulada hacia producción abortada exitosamente sin salir a la red.');
  });

  // =========================================================================
  // TEST 2: COMPROBACIÓN DE BLOQUEO DE FIRESTORE
  // =========================================================================
  test('Comprobación de Bloqueo de Firestore: Solicitud simulada a firestore.googleapis.com es abortada sin salir a la red', async ({ page }) => {
    let violationDetected: string | null = null;
    await installNetworkMutationGuard(page, (violation) => {
      violationDetected = violation;
    });

    await page.goto('about:blank');

    const simResult = await page.evaluate(async () => {
      try {
        await fetch('https://firestore.googleapis.com/v1/projects/quhealthy-backend/databases/(default)/documents', {
          method: 'GET',
        });
        return { aborted: false, error: null };
      } catch (err: any) {
        return { aborted: true, error: err?.message || 'Failed to fetch' };
      }
    });

    expect(simResult.aborted, 'La solicitud hacia firestore.googleapis.com debe ser abortada por el interceptor').toBe(true);
    expect(violationDetected, 'La violación hacia firestore debe ser detectada').toContain('firestore.googleapis.com');
    console.log('✅ [BLOQUEO FIRESTORE CONFIRMADO] Solicitud a firestore.googleapis.com abortada exitosamente.');
  });

  // =========================================================================
  // TEST 3: COMPROBACIÓN DE BLOQUEO DE RED POST-LOGIN
  // =========================================================================
  test('Comprobación de Bloqueo de Red Post-Login: Mutación prohibida tras autenticación aborta y deja la compuerta roja', async ({ page }) => {
    let violationDetected: string | null = null;
    await installNetworkMutationGuard(page, (violation) => {
      violationDetected = violation;
    });

    await page.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('quhealthy-session', JSON.stringify({
        state: { token: 'mock-post-login-session-token', isAuthenticated: true, role: 'ROLE_PROVIDER' }
      }));
    });

    const postLoginMutationResult = await page.evaluate(async () => {
      try {
        await fetch('https://api.quhealthy.org/api/appointments/prohibited-mutation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-post-login-session-token',
          },
          body: JSON.stringify({ action: 'MALICIOUS_PROD_MUTATION' }),
        });
        return { aborted: false, error: null };
      } catch (err: any) {
        return { aborted: true, error: err?.message || 'Failed to fetch' };
      }
    });

    expect(postLoginMutationResult.aborted, 'La mutación post-login hacia producción debe ser abortada en el cliente').toBe(true);
    expect(violationDetected, 'La violación de seguridad post-login debe haber sido registrada').toBeTruthy();
    expect(violationDetected).toContain('api.quhealthy.org/api/appointments/prohibited-mutation');

    expect(() => {
      if (violationDetected) {
        throw new Error(`[COMPUERTA ROJA] ${violationDetected}`);
      }
    }).toThrow(/\[COMPUERTA ROJA\].*api\.quhealthy\.org/);

    console.log(`✅ [BLOQUEO POST-LOGIN CONFIRMADO] ${violationDetected} -> Compuerta ROJA disparada y verificada`);
  });

  // =========================================================================
  // TEST 4: AISLAMIENTO DE STAGING: CERO SOLICITUDES A FIRESTORE PRODUCTIVO
  // =========================================================================
  test('Comprobación de Aislamiento de Staging: Cero solicitudes al Firestore productivo en páginas autenticadas de paciente y médico', async ({ page }) => {
    let securityViolation: string | null = null;
    await installNetworkMutationGuard(page, (violation) => {
      securityViolation = violation;
    });
    await preloadNonClinicalPreferences(page.context());

    const interceptedFirestoreRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      const method = req.method();
      if (
        url.includes('firestore.googleapis.com') ||
        url.includes('quhealthy-backend')
      ) {
        interceptedFirestoreRequests.push(`${method} ${url}`);
      }
    });

    // 1. Simular sesión autenticada de Paciente en /es/discover
    await page.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('quhealthy-session', JSON.stringify({
        state: {
          token: 'mock-patient-session-token',
          isAuthenticated: true,
          role: 'ROLE_CONSUMER',
          user: { id: 101, email: 'staging.patient.test@example.com', role: 'ROLE_CONSUMER' },
        },
      }));
    });

    await page.goto(`${STAGING_URL}/es/discover`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="provider-card"]').first().waitFor({ state: 'visible', timeout: 15000 });

    // 2. Simular sesión autenticada de Médico en /es/provider/login
    await page.evaluate(() => {
      localStorage.setItem('quhealthy-session', JSON.stringify({
        state: {
          token: 'mock-doctor-session-token',
          isAuthenticated: true,
          role: 'ROLE_PROVIDER',
          user: { id: 202, email: 'staging.doctor.test@example.com', role: 'ROLE_PROVIDER' },
        },
      }));
    });

    await page.goto(`${STAGING_URL}/es/provider/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('button[type="submit"]').first().waitFor({ state: 'visible', timeout: 15000 });

    expect(
      securityViolation,
      `No debe ocurrir ninguna violación de compuerta roja por tráfico productivo: ${securityViolation}`
    ).toBeNull();

    expect(
      interceptedFirestoreRequests,
      `Se detectaron solicitudes dirigidas a Firestore productivo: ${interceptedFirestoreRequests.join('; ')}`
    ).toHaveLength(0);

    console.log('✅ [AISLAMIENTO STAGING CONFIRMADO] Cero solicitudes a Firestore productivo en páginas autenticadas.');
  });

  // =========================================================================
  // TEST 5: PRIMERA VISITA: RESOLUCIÓN DETERMINISTA PULSANDO «RECHAZAR»
  // =========================================================================
  test('Primera Visita: Resolución determinista de avisos legales pulsando «Rechazar» en la UI', async ({ browser }) => {
    // Contexto limpio sin almacenamiento precargado
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();
    await installNetworkMutationGuard(cleanPage);

    await cleanPage.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });

    // El banner de cookies aparece tras un retardo de 1200ms en primera visita
    const rejectButton = cleanPage.locator('button:has-text("Rechazar")');
    await expect(rejectButton, 'El botón «Rechazar» debe ser visible para un usuario en primera visita').toBeVisible({ timeout: 10000 });

    // Clic determinista de usuario real
    await rejectButton.click();

    // Comprobar que el banner se cierra
    await expect(rejectButton, 'El banner debe desaparecer tras pulsar «Rechazar»').not.toBeVisible({ timeout: 5000 });

    // Comprobar que las preferencias quedan registradas con solo cookies esenciales
    const consent = await cleanPage.evaluate(() => {
      const raw = localStorage.getItem('quhealthy_cookie_consent');
      return raw ? JSON.parse(raw) : null;
    });

    expect(consent, 'Las preferencias de cookies deben guardarse en localStorage').toBeTruthy();
    expect(consent.essential, 'Las cookies esenciales deben estar activas').toBe(true);
    expect(consent.functional, 'Las cookies funcionales deben estar rechazadas').toBe(false);
    expect(consent.analytics, 'Las cookies analíticas deben estar rechazadas').toBe(false);
    expect(consent.marketing, 'Las cookies de marketing deben estar rechazadas').toBe(false);

    await cleanContext.close();
    console.log('✅ [PRIMERA VISITA CONFIRMADA] Aviso resuelto deterministamente con «Rechazar» en la UI.');
  });

  // =========================================================================
  // TEST 5.5: COMPROBACIÓN DE SESIÓN Y NAVEGACIÓN PROTEGIDA EN AMBOS ROLES (SIN COOKIES ARTIFICIALES)
  // =========================================================================
  test('Comprobación de Sesión Real sin Cookies Artificiales: Navegación a rutas protegidas en ROLE_CONSUMER y ROLE_PROVIDER', async ({ browser }) => {
    test.setTimeout(120000);
    assertCanonicalStagingOrigin(STAGING_URL);

    // 1. Verificar login real y navegación protegida en ROLE_CONSUMER
    const patientContext = await browser.newContext();
    await preloadNonClinicalPreferences(patientContext);
    const patientPage = await patientContext.newPage();
    await installNetworkMutationGuard(patientPage);

    await patientPage.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });
    await patientPage.locator('input[name="cf-turnstile-response"]').waitFor({ state: 'attached', timeout: 15000 });

    const patientEmailInput = patientPage.locator('input[type="email"], input[name="email"]').first();
    const patientPasswordInput = patientPage.locator('input[type="password"], input[name="password"]').first();
    const patientSubmitBtn = patientPage.locator('button[type="submit"]').first();
    await expect(patientEmailInput).toBeVisible({ timeout: 10000 });
    await expect(patientPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(patientSubmitBtn).toBeVisible({ timeout: 10000 });

    await patientEmailInput.fill(PATIENT_EMAIL!);
    await patientPasswordInput.fill(PATIENT_PASSWORD!);

    const [patientLoginResp] = await Promise.all([
      patientPage.waitForResponse(
        resp => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST',
        { timeout: 25000 }
      ),
      patientSubmitBtn.click(),
    ]);

    const patientSetCookieHeader = await patientLoginResp.headerValue('set-cookie');
    expect(patientLoginResp.status()).toBe(200);

    // Esperar a que la llamada post-login (/api/onboarding/consumer/profile) finalice y se ejecute router.push
    await patientPage.waitForTimeout(3000);

    const patientBrowserCookies = await patientContext.cookies(STAGING_URL);
    const postLoginPatientUrl = patientPage.url();
    console.log('\n📋 [DIAGNÓSTICO DE SESIÓN REAL - ROLE_CONSUMER]');
    console.log('  Set-Cookie emitido por auth-service (api-staging.quhealthy.org):', patientSetCookieHeader ? '[PRESENTE: ' + patientSetCookieHeader.replace(/refreshToken=[^;]+/, 'refreshToken=[REDACTED]') + ']' : 'NULL');
    console.log('  Cookies almacenadas por el navegador para https://staging.quhealthy.org:', JSON.stringify(patientBrowserCookies.map(c => ({ name: c.name, domain: c.domain }))));
    console.log('  URL tras login de ROLE_CONSUMER:', postLoginPatientUrl);

    await patientPage.goto(`${STAGING_URL}/es/patient/dashboard`, { waitUntil: 'domcontentloaded' });
    const finalPatientUrl = patientPage.url();
    console.log('  URL resultante al navegar directamente a /es/patient/dashboard:', finalPatientUrl);
    await patientContext.close();

    // 2. Verificar login real y navegación protegida en ROLE_PROVIDER
    const doctorContext = await browser.newContext();
    await preloadNonClinicalPreferences(doctorContext);
    const doctorPage = await doctorContext.newPage();
    await installNetworkMutationGuard(doctorPage);

    await doctorPage.goto(`${STAGING_URL}/es/provider/login`, { waitUntil: 'domcontentloaded' });
    await doctorPage.locator('input[name="cf-turnstile-response"]').waitFor({ state: 'attached', timeout: 15000 });

    const doctorEmailInput = doctorPage.locator('input[type="email"], input[name="email"]').first();
    const doctorPasswordInput = doctorPage.locator('input[type="password"], input[name="password"]').first();
    const doctorSubmitBtn = doctorPage.locator('button[type="submit"]').first();
    await expect(doctorEmailInput).toBeVisible({ timeout: 10000 });
    await expect(doctorPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(doctorSubmitBtn).toBeVisible({ timeout: 10000 });

    await doctorEmailInput.fill(DOCTOR_EMAIL!);
    await doctorPasswordInput.fill(DOCTOR_PASSWORD!);

    const [doctorLoginResp] = await Promise.all([
      doctorPage.waitForResponse(
        resp => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST',
        { timeout: 25000 }
      ),
      doctorSubmitBtn.click(),
    ]);

    const doctorSetCookieHeader = await doctorLoginResp.headerValue('set-cookie');
    expect(doctorLoginResp.status()).toBe(200);
    await doctorPage.waitForTimeout(3000);

    const doctorBrowserCookies = await doctorContext.cookies(STAGING_URL);
    const postLoginDoctorUrl = doctorPage.url();
    await doctorPage.goto(`${STAGING_URL}/es/provider/dashboard/appointments`, { waitUntil: 'domcontentloaded' });
    const finalDoctorUrl = doctorPage.url();

    console.log('\n📋 [DIAGNÓSTICO DE SESIÓN REAL - ROLE_PROVIDER]');
    console.log('  Set-Cookie emitido por auth-service (api-staging.quhealthy.org):', doctorSetCookieHeader ? '[PRESENTE: ' + doctorSetCookieHeader.replace(/refreshToken=[^;]+/, 'refreshToken=[REDACTED]') + ']' : 'NULL');
    console.log('  Cookies almacenadas por el navegador para https://staging.quhealthy.org:', JSON.stringify(doctorBrowserCookies.map(c => ({ name: c.name, domain: c.domain }))));
    console.log('  URL tras login de ROLE_PROVIDER:', postLoginDoctorUrl);
    console.log('  URL resultante al navegar directamente a /es/provider/dashboard/appointments:', finalDoctorUrl);
    await doctorContext.close();

    expect(
      finalPatientUrl,
      `[DEFECTO DE SESIÓN ROLE_CONSUMER EN AUTH-SERVICE] Navegar a /es/patient/dashboard redirigió a ${finalPatientUrl} porque el navegador rechazó Set-Cookie con Domain=staging.quhealthy.org emitido desde api-staging.quhealthy.org (RFC 6265 §5.3)`
    ).toContain('/es/patient/dashboard');
    expect(
      finalDoctorUrl,
      `[DEFECTO DE SESIÓN ROLE_PROVIDER EN AUTH-SERVICE] Navegar a /es/provider/dashboard/appointments redirigió a ${finalDoctorUrl} porque el navegador rechazó Set-Cookie con Domain=staging.quhealthy.org emitido desde api-staging.quhealthy.org (RFC 6265 §5.3)`
    ).toContain('/es/provider/dashboard/appointments');
  });

  // =========================================================================
  // TEST 6: RECORRIDO E2E ESTRICTO: RESERVA Y CIERRE OPERATIVO
  // =========================================================================
  test('Recorrido E2E Estricto: Reserva y Cierre Operativo', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutos

    // --- Salvaguarda Previa de Comunicaciones Externas (Requisito 6) ---
    console.log('\n▶ [PRE-FLIGHT COMUNICACIONES] Verificando aislamiento de notificaciones...');
    if (!PATIENT_EMAIL?.endsWith('@example.com') || !DOCTOR_EMAIL?.endsWith('@example.com')) {
      throw new Error(
        `[BLOQUEO DE SEGURIDAD] Cuentas de prueba no aisladas: ` +
        `PATIENT_EMAIL (${PATIENT_EMAIL}) o DOCTOR_EMAIL (${DOCTOR_EMAIL}) no pertenecen al dominio RFC 2606 @example.com.`
      );
    }
    console.log('  [Seguridad] Cuentas sintéticas restringidas a @example.com (no enrutable). Comunicaciones externas aisladas.');

    // Validar origen canónico de staging
    assertCanonicalStagingOrigin(STAGING_URL);

    // =========================================================================
    // FASE 1: CONTEXTO DEL PACIENTE (LOGIN -> DISCOVER -> STORE -> BOOKING)
    // =========================================================================
    const patientContext = await browser.newContext();
    await preloadNonClinicalPreferences(patientContext);
    const patientPage = await patientContext.newPage();

    let securityViolation: string | null = null;
    await installNetworkMutationGuard(patientPage, (violation) => {
      securityViolation = violation;
    });

    console.log('\n▶ [PASO 1] Login de usuario real (Paciente Sintético)...');
    await patientPage.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });

    // Esperar a que el widget Turnstile esté completamente inicializado
    await patientPage.locator('input[name="cf-turnstile-response"]').waitFor({ state: 'attached', timeout: 15000 });

    const patientEmailInput = patientPage.locator('input[type="email"], input[name="email"]').first();
    const patientPasswordInput = patientPage.locator('input[type="password"], input[name="password"]').first();
    const patientSubmitBtn = patientPage.locator('button[type="submit"]').first();

    await expect(patientEmailInput).toBeVisible({ timeout: 10000 });
    await expect(patientPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(patientSubmitBtn).toBeVisible({ timeout: 10000 });

    await patientEmailInput.fill(PATIENT_EMAIL!);
    await patientPasswordInput.fill(PATIENT_PASSWORD!);

    const [loginResponse] = await Promise.all([
      patientPage.waitForResponse(
        resp => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST',
        { timeout: 25000 }
      ),
      patientSubmitBtn.click(),
    ]);

    expect(loginResponse.status(), `Login de paciente retornó error HTTP ${loginResponse.status()}`).toBe(200);
    const loginData = await loginResponse.json();
    sharedPatientAuthToken = loginData.accessToken || loginData.token;

    // Verificar sesión establecida sin inyectar cookies artificiales en Playwright
    await patientPage.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 15000 });
    const sessionToken = await patientPage.evaluate(() => {
      try {
        const raw = localStorage.getItem('quhealthy-session');
        return raw ? JSON.parse(raw)?.state?.token : null;
      } catch {
        return null;
      }
    });
    expect(sessionToken, 'La sesión del paciente debe quedar persistida en localStorage').toBeTruthy();

    // Comprobar que el login real del paciente (ROLE_CONSUMER) permite navegar a ruta protegida (/es/patient/dashboard)
    await patientPage.goto(`${STAGING_URL}/es/patient/dashboard`, { waitUntil: 'domcontentloaded' });
    expect(
      patientPage.url(),
      '[DEFECTO DE SESIÓN ROLE_CONSUMER] El login real debe permitir navegar a /es/patient/dashboard sin redirigir a /es/login'
    ).toContain('/es/patient/dashboard');
    console.log('✅ [PASO 1] Login real de Paciente Sintético y navegación protegida (/es/patient/dashboard) completados.');

    // --- PASO 2: NAVEGACIÓN EN DISCOVER ---
    console.log('\n▶ [PASO 2] Navegando en /es/discover y esperando /api/catalog/storefront...');
    const [storefrontResp] = await Promise.all([
      patientPage.waitForResponse(
        resp => resp.url().includes('/api/catalog/storefront') && resp.status() === 200,
        { timeout: 20000 }
      ),
      patientPage.goto(`${STAGING_URL}/es/discover`, { waitUntil: 'domcontentloaded' }),
    ]);

    const storefrontData = await storefrontResp.json();
    const eligibleProviders = Array.isArray(storefrontData)
      ? storefrontData
      : [ ...(storefrontData.sponsored || []), ...(storefrontData.organic || []), ...(storefrontData.providers || []) ];
    const syntheticProvider = eligibleProviders.find((p: any) => p.id === 3 || p.providerId === 3);
    expect(syntheticProvider, 'El catálogo storefront debe devolver al prestador sintético ID 3').toBeTruthy();
    console.log(`  [Storefront] Prestador sintético encontrado en catálogo: ID ${syntheticProvider.id || syntheticProvider.providerId}`);

    // Localizar la tarjeta del prestador en la UI y pulsar «Ver Perfil»
    const providerCard = patientPage.locator('[data-testid="provider-card"]').filter({
      hasText: syntheticProvider.name || 'Dra. Sintética Staging',
    });
    await expect(providerCard, 'La tarjeta del prestador sintético debe ser visible en /es/discover').toBeVisible({ timeout: 15000 });

    const viewProfileBtn = providerCard.locator('button:has-text("Ver Perfil")');
    await expect(viewProfileBtn, 'El botón interior «Ver Perfil» debe ser visible').toBeVisible({ timeout: 10000 });

    await Promise.all([
      patientPage.waitForURL(url => url.pathname.includes('/store/'), { timeout: 20000 }),
      viewProfileBtn.click(),
    ]);
    console.log(`✅ [PASO 2] Navegación a la tienda completada: ${patientPage.url()}`);

    // --- PASO 3: TIENDA DEL PRESTADOR -> AGENDAR SERVICIO ---
    console.log('\n▶ [PASO 3] Seleccionando servicio y continuando al flujo de reserva...');
    // Esperar carga del catálogo de servicios en la tienda
    const bookAppointmentBtn = patientPage.locator('button:has-text("Agendar Cita")').first();
    await expect(bookAppointmentBtn, 'El botón «Agendar Cita» del servicio debe ser visible').toBeVisible({ timeout: 15000 });
    await bookAppointmentBtn.click();

    // Pulsar el botón de la barra flotante de reserva para navegar a /patient/booking/[slug]
    const stickyBookingBtn = patientPage.locator('div.fixed.bottom-4 button:has-text("Agendar"), div.fixed.bottom-4 button:has-text("Agendar cita")').first();
    await expect(stickyBookingBtn, 'El botón de la barra de agendamiento debe ser visible tras agregar servicio').toBeVisible({ timeout: 10000 });

    await Promise.all([
      patientPage.waitForURL(url => url.pathname.includes('/patient/booking/'), { timeout: 20000 }),
      stickyBookingBtn.click(),
    ]);
    console.log(`  [Booking] Llegada a pantalla de reserva: ${patientPage.url()}`);

    // --- PASO 4: SELECCIÓN DE SLOT Y CREACIÓN DE CITA ---
    console.log('\n▶ [PASO 4] Seleccionando slot y confirmando cita...');
    // Esperar respuesta de slots disponibles
    const slotsResponse = await patientPage.waitForResponse(
      resp => resp.url().includes('/available-slots') && resp.status() === 200,
      { timeout: 20000 }
    );
    const slotsData = await slotsResponse.json();
    expect(slotsData.length, 'Debe haber slots disponibles para el prestador').toBeGreaterThan(0);

    // Seleccionar día en el calendario de la UI
    const availableDayBtn = patientPage.locator('[class*="grid-cols-7"] button:not([disabled])').first();
    await expect(availableDayBtn, 'Debe haber un día seleccionable en el calendario').toBeVisible({ timeout: 10000 });
    await availableDayBtn.click();

    // Seleccionar horario en la UI
    const timeSlotBtn = patientPage.locator('button:has-text(":")').first();
    await expect(timeSlotBtn, 'Debe haber un botón de slot horario disponible').toBeVisible({ timeout: 10000 });
    await timeSlotBtn.click();

    // Marcar casilla obligatoria de consentimiento de telemedicina
    const telemedicineCheckbox = patientPage.locator('label:has-text("Consentimiento") button[role="checkbox"], label:has-text("Consentimiento") input[type="checkbox"]').first();
    await expect(telemedicineCheckbox, 'La casilla de consentimiento de telemedicina debe estar presente').toBeVisible({ timeout: 10000 });
    await telemedicineCheckbox.click();

    // Botón de checkout
    const checkoutBtn = patientPage.locator('button:has-text("Proceder al Pago Seguro"), button:has-text("Continuar"), button:has-text("Confirmar")').first();
    await expect(checkoutBtn, 'El botón de checkout debe estar activo').toBeEnabled({ timeout: 10000 });

    const [createApptResp] = await Promise.all([
      patientPage.waitForResponse(
        resp => resp.url().includes('/api/appointments/create') && resp.request().method() === 'POST',
        { timeout: 25000 }
      ),
      checkoutBtn.click(),
    ]);

    expect(createApptResp.status(), `Creación de cita falló con HTTP ${createApptResp.status()}`).toBe(201);
    const createdData = await createApptResp.json();
    const dynamicId = Array.isArray(createdData) ? createdData[0].id : createdData.id;
    expect(dynamicId, 'La cita creada debe retornar un ID numérico válido').toBeTruthy();
    expect(Number(dynamicId), 'El ID de la cita debe ser mayor a 0').toBeGreaterThan(0);

    sharedAppointmentId = Number(dynamicId);
    const redactedId = `[REDACTED-APPT-***${String(dynamicId).slice(-1)}]`;
    console.log(`🎯 [CITA CREADA] Cita sintética generada exitosamente con ID: ${redactedId} (HTTP 201).`);

    // Cerrar contexto de paciente para aislar roles
    await patientContext.close();

    // =========================================================================
    // FASE 2: CONTEXTO DEL MÉDICO (LOGIN -> DASHBOARD -> IN_PROGRESS -> COMPLETE)
    // =========================================================================
    console.log('\n▶ [PASO 5] Contexto del Médico: Login y apertura de agenda médica...');
    const doctorContext = await browser.newContext();
    await preloadNonClinicalPreferences(doctorContext);
    const doctorPage = await doctorContext.newPage();

    await installNetworkMutationGuard(doctorPage, (violation) => {
      securityViolation = violation;
    });

    await doctorPage.goto(`${STAGING_URL}/es/provider/login`, { waitUntil: 'domcontentloaded' });

    // Esperar a que el widget Turnstile esté completamente inicializado
    await doctorPage.locator('input[name="cf-turnstile-response"]').waitFor({ state: 'attached', timeout: 15000 });

    const doctorEmailInput = doctorPage.locator('input[type="email"], input[name="email"]').first();
    const doctorPasswordInput = doctorPage.locator('input[type="password"], input[name="password"]').first();
    const doctorSubmitBtn = doctorPage.locator('button[type="submit"]').first();

    await expect(doctorEmailInput).toBeVisible({ timeout: 10000 });
    await expect(doctorPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(doctorSubmitBtn).toBeVisible({ timeout: 10000 });

    await doctorEmailInput.fill(DOCTOR_EMAIL!);
    await doctorPasswordInput.fill(DOCTOR_PASSWORD!);

    const [docLoginResp] = await Promise.all([
      doctorPage.waitForResponse(
        resp => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST',
        { timeout: 25000 }
      ),
      doctorSubmitBtn.click(),
    ]);

    expect(docLoginResp.status(), `Login de médico retornó error HTTP ${docLoginResp.status()}`).toBe(200);
    const docLoginData = await docLoginResp.json();
    sharedDoctorAuthToken = docLoginData.accessToken || docLoginData.token;

    // Verificar redirección post-login sin inyectar cookies artificiales en Playwright
    await doctorPage.waitForURL(url => !url.pathname.endsWith('/provider/login'), { timeout: 15000 });
    expect(
      doctorPage.url(),
      '[DEFECTO DE SESIÓN ROLE_PROVIDER] El login real del médico debe permitir permanecer en /es/provider/dashboard sin rebotar a /es/provider/login'
    ).toContain('/provider/dashboard');
    console.log('✅ [PASO 5] Médico autenticado exitosamente sin cookies artificiales.');

    // Navegar a la agenda de citas del médico
    console.log('\n▶ [PASO 6] Abriendo /es/provider/dashboard/appointments y localizando la cita por selector estable...');
    const [docAppointmentsResp] = await Promise.all([
      doctorPage.waitForResponse(
        resp => resp.url().includes('/api/appointments/provider') && resp.status() === 200,
        { timeout: 20000 }
      ),
      doctorPage.goto(`${STAGING_URL}/es/provider/dashboard/appointments`, { waitUntil: 'domcontentloaded' }),
    ]);

    expect(
      doctorPage.url(),
      '[DEFECTO DE SESIÓN ROLE_PROVIDER] La navegación a /es/provider/dashboard/appointments no debe ser redirigida a /es/provider/login'
    ).toContain('/es/provider/dashboard/appointments');

    const docApptsList = await docAppointmentsResp.json();
    const targetAppt = docApptsList.find((a: any) => a.id === sharedAppointmentId);
    expect(targetAppt, `La cita ${redactedId} debe aparecer en la respuesta del backend para el médico`).toBeTruthy();

    // Exigir exactamente una tarjeta con el selector estable del producto (sin React Fiber, sin mutación DOM, sin fallback por nombre)
    const apptCard = doctorPage.locator(`[data-testid="appointment-card"][data-appointment-id="${sharedAppointmentId}"]`);
    await expect(
      apptCard,
      `Debe existir exactamente 1 tarjeta en el DOM con [data-testid="appointment-card"][data-appointment-id="${sharedAppointmentId}"]`
    ).toHaveCount(1, { timeout: 15000 });
    await expect(apptCard, `Tarjeta de cita ${redactedId} debe ser visible en la UI del médico`).toBeVisible({ timeout: 15000 });

    // --- CAMBIO A IN_PROGRESS ---
    console.log('\n▶ [PASO 7] Iniciando consulta médica (transición a IN_PROGRESS)...');
    const startBtn = apptCard.locator('button:has-text("Iniciar")');
    await expect(startBtn, 'Botón «Iniciar» debe ser visible en la tarjeta').toBeVisible({ timeout: 10000 });

    const [inProgressResp] = await Promise.all([
      doctorPage.waitForResponse(
        resp => resp.url().includes(`/api/appointments/${sharedAppointmentId}/status`) &&
                resp.url().includes('status=IN_PROGRESS') &&
                resp.request().method() === 'PATCH',
        { timeout: 20000 }
      ),
      startBtn.click(),
    ]);

    expect(inProgressResp.status(), `Cambio a IN_PROGRESS retornó error HTTP ${inProgressResp.status()}`).toBe(200);
    console.log(`  [Estado] Cita ${redactedId} cambiada exitosamente a IN_PROGRESS.`);

    // --- CIERRE OPERATIVO DESDE MODAL ---
    console.log('\n▶ [PASO 8] Ejecutando cierre operativo desde el modal del dashboard...');
    await expect(apptCard).toHaveCount(1);
    const finishBtn = apptCard.locator('button:has-text("Finalizar"), button:has-text("Finalizar Consulta")');
    await expect(finishBtn, 'Botón «Finalizar» debe estar visible').toBeVisible({ timeout: 10000 });
    await finishBtn.click();

    // Modal de confirmación
    const confirmFinishBtn = doctorPage.locator('button:has-text("Confirmar y Finalizar")');
    await expect(confirmFinishBtn, 'Botón «Confirmar y Finalizar» en CompletionModal debe ser visible').toBeVisible({ timeout: 10000 });

    const [completeResp] = await Promise.all([
      doctorPage.waitForResponse(
        resp => resp.url().includes(`/api/appointments/${sharedAppointmentId}/complete`) &&
                resp.request().method() === 'PATCH',
        { timeout: 20000 }
      ),
      confirmFinishBtn.click(),
    ]);

    expect(completeResp.status(), `Cierre operativo retornó error HTTP ${completeResp.status()}`).toBe(200);
    console.log(`  [Estado] Cita ${redactedId} completada operativamente (HTTP 200 en /complete).`);

    // --- LECTURA FINAL COMPLETED MEDIANTE API-STAGING ---
    console.log('\n▶ [PASO 9] Verificación final read-only de estado COMPLETED...');
    const verifyResp = await doctorPage.evaluate(async ({ apptId, token }) => {
      const res = await fetch(`https://api-staging.quhealthy.org/api/appointments/${apptId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const body = await res.json().catch(() => null);
      return {
        status: res.status,
        appointmentStatus: body?.status || body?.appointmentStatus || body?.appointment?.status,
      };
    }, { apptId: sharedAppointmentId, token: sharedDoctorAuthToken });

    expect(verifyResp.status, 'La consulta de verificación de la cita debe retornar HTTP 200').toBe(200);
    expect(verifyResp.appointmentStatus, 'El estado final verificado de la cita debe ser COMPLETED').toBe('COMPLETED');
    console.log(`🎯 [CIERRE OPERATIVO VERIFICADO] Cita ${redactedId} confirmada en estado: COMPLETED.`);

    await doctorContext.close();

    expect(securityViolation, `Violación de compuerta roja detectada durante el recorrido: ${securityViolation}`).toBeNull();
  });

  // =========================================================================
  // TEST 7: INTEGRACIÓN DE API DE CONSENTIMIENTO DE IA (CITA RECIÉN CREADA)
  // =========================================================================
  test('Integración de API de Consentimiento de IA: POST y GET de estado sobre la cita recién creada (sin UI de consentimiento)', async ({ page }) => {
    test.setTimeout(60000);

    expect(
      sharedAppointmentId,
      'El consentimiento de IA debe ejecutarse exclusivamente sobre la cita recién creada en el recorrido E2E (sin fallback a ID fijo)'
    ).toBeTruthy();
    expect(Number(sharedAppointmentId)).toBeGreaterThan(0);
    expect(sharedPatientAuthToken, 'Se requiere el token de sesión del paciente autenticado').toBeTruthy();

    const appointmentId = sharedAppointmentId!;
    const redactedId = `[REDACTED-APPT-***${String(appointmentId).slice(-1)}]`;
    console.log(`\n▶ [INTEGRACIÓN API CONSENTIMIENTO IA] Verificando endpoints POST/GET de consentimiento IA para cita recién creada ${redactedId}...`);

    let securityViolation: string | null = null;
    await installNetworkMutationGuard(page, (violation) => {
      securityViolation = violation;
    });
    await preloadNonClinicalPreferences(page.context());

    await page.goto(`${STAGING_URL}/es/login`, { waitUntil: 'domcontentloaded' });

    // 1. Guardar consentimiento IA mediante POST /api/appointments/teleconsultations/{id}/ai-consent (ROLE_CONSUMER)
    const consentResult = await page.evaluate(async ({ apptId, token }) => {
      const resp = await fetch(`https://api-staging.quhealthy.org/api/appointments/teleconsultations/${apptId}/ai-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          audioProcessingAccepted: true,
          clinicalNoteAccepted: true,
          dataStorageAccepted: true,
          consentVersion: '1.0',
        }),
      });

      const data = await resp.json().catch(() => null);
      return {
        status: resp.status,
        data,
      };
    }, { apptId: appointmentId, token: sharedPatientAuthToken });

    expect(consentResult.status, `POST de consentimiento IA falló con HTTP ${consentResult.status}`).toBe(200);
    console.log(`✅ [API CONSENTIMIENTO IA] Registro técnico persistido vía POST para cita ${redactedId} (HTTP 200).`);

    // 2. Consultar estado mediante endpoint independiente GET /api/appointments/teleconsultations/{id}/ai-consent/status
    const statusResult = await page.evaluate(async ({ apptId, token }) => {
      const resp = await fetch(`https://api-staging.quhealthy.org/api/appointments/teleconsultations/${apptId}/ai-consent/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await resp.json().catch(() => null);
      return {
        status: resp.status,
        data,
      };
    }, { apptId: appointmentId, token: sharedPatientAuthToken });

    expect(statusResult.status, `Consulta de estado de consentimiento IA falló con HTTP ${statusResult.status}`).toBe(200);
    expect(statusResult.data?.hasResponded, 'El endpoint de estado debe registrar hasResponded=true').toBe(true);
    expect(statusResult.data?.audioProcessingAccepted, 'audioProcessingAccepted debe ser true').toBe(true);
    console.log(`✅ [API ESTADO CONSENTIMIENTO] Endpoint independiente GET validado: hasResponded=true (comprobación de integración de API; la UI de consentimiento corresponde a HU-EHR-024).`);

    expect(securityViolation).toBeNull();
  });

});
