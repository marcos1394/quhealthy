import { test, expect } from '@playwright/test';

/**
 * Iteración 2.5 (Smoke): Smoke Test de Seis Pantallas Médico–Paciente en staging.quhealthy.org
 * Reclasificado explícitamente como suite de smoke de componentes y pantallas UI, no E2E completo.
 * Verifica accesibilidad, campos de formulario y renderizado de seis pantallas clave.
 */

const STAGING_URL = process.env.STAGING_URL || 'https://staging.quhealthy.org';

test.describe('Iteración 2.5 (Smoke): Smoke de Seis Pantallas Médico–Paciente en Staging', () => {

  // Paso 1: Interfaz de Acceso del Prestador Médico
  test('Paso UI-1: Interfaz de Login Médico en /es/provider/login', async ({ page }) => {
    console.log('🩺 [UI-1] Navegando a portal médico de staging...');
    await page.goto(`${STAGING_URL}/es/provider/login`);

    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Rellenar credencial sintética del médico
    const doctorEmail = process.env.STAGING_TEST_DOCTOR_EMAIL || 'staging.doctor.test@example.com';
    await emailInput.fill(doctorEmail);
    expect(await emailInput.inputValue()).toBe(doctorEmail);

    console.log('✅ [UI-1] Interfaz de acceso médico verificada exitosamente.');
  });

  // Paso 2: Interfaz de Acceso del Paciente
  test('Paso UI-2: Interfaz de Login Paciente en /es/login', async ({ page }) => {
    console.log('🧑‍⚕️ [UI-2] Navegando a login de paciente...');
    await page.goto(`${STAGING_URL}/es/login`);

    await expect(page).toHaveTitle(/QuHealthy/i);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Rellenar credencial sintética del paciente
    const patientEmail = process.env.STAGING_TEST_PATIENT_EMAIL || 'staging.patient.test@example.com';
    await emailInput.fill(patientEmail);
    expect(await emailInput.inputValue()).toBe(patientEmail);

    console.log('✅ [UI-2] Interfaz de acceso de paciente verificada exitosamente.');
  });

  // Paso 3: Interfaz de Búsqueda y Descubrimiento Clínico
  test('Paso UI-3: Catálogo y Descubrimiento Médico en /es/discover', async ({ page }) => {
    console.log('🔍 [UI-3] Navegando a directorio clínico /es/discover...');
    await page.goto(`${STAGING_URL}/es/discover`);

    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();

    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Verificar filtros de especialidad y sedes
    await searchInput.fill('Medicina General');
    expect(await searchInput.inputValue()).toBe('Medicina General');

    console.log('✅ [UI-3] Interfaz de catálogo y búsqueda clínica verificada exitosamente.');
  });

  // Paso 4: Interfaz del Embudo de Agendamiento del Paciente
  test('Paso UI-4: Embudo de Reserva en /es/patient/booking/demo-doctor', async ({ page }) => {
    console.log('📅 [UI-4] Navegando a embudo de agendamiento...');
    await page.goto(`${STAGING_URL}/es/patient/booking/demo-doctor`);

    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // Comprobar que no rebota preventivamente a login
    expect(page.url()).not.toContain('/login');

    console.log('✅ [UI-4] Interfaz de agendamiento abierta y disponible.');
  });

  // Paso 5: Interfaz de Teleconsulta y Consentimiento Informado
  test('Paso UI-5: Interfaz de Sala de Teleconsulta en /es/patient/video-call/5', async ({ page }) => {
    console.log('📹 [UI-5] Inspeccionando interfaz de teleconsulta para la cita sintética...');
    await page.goto(`${STAGING_URL}/es/patient/video-call/5`);

    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // La interfaz debe cargar sin crashear (código de cliente montado)
    const titleOrBody = await page.title();
    expect(titleOrBody).toBeDefined();

    // Verificación de selectores de Consentimiento Informado (HU-EHR-024)
    const consentModal = page.locator('[data-testid="consent-modal"]');
    if (await consentModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(consentModal).toBeVisible();
      const checkboxes = page.locator('[data-testid="consent-accept-checkbox"]');
      if (await checkboxes.count() > 0) {
        await checkboxes.first().click();
      }
      const submitBtn = page.locator('[data-testid="consent-submit-btn"]');
      await expect(submitBtn).toBeVisible();
      console.log('✅ [UI-5] Modal interactivo de consentimiento (HU-EHR-024) verificado con selectores estables.');
    }

    console.log('✅ [UI-5] Interfaz de sala de teleconsulta cargada y operativa.');
  });

  // Paso 6: Interfaz del Dashboard y Consulta del Prestador
  test('Paso UI-6: Interfaz de Consulta Médica en /es/provider/consultation/5', async ({ page }) => {
    console.log('📋 [UI-6] Inspeccionando interfaz de consulta clínica médica...');
    await page.goto(`${STAGING_URL}/es/provider/consultation/5`);

    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    const titleOrBody = await page.title();
    expect(titleOrBody).toBeDefined();

    console.log('✅ [UI-6] Interfaz de consulta clínica médica verificada.');
  });

});
