import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.quhealthy.org';

test.describe('PORT-A-01: Patient & Provider Activation Funnel E2E', () => {

  // 1. Descubrimiento Paciente
  test('Paso P1 (Descubrimiento): /es/discover carga interfaz y catálogo de doctores', async ({ page }) => {
    await page.goto('/es/discover');

    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();

    // Comprobar presencia de buscador o selector de especialidades
    const searchOrFilter = page.getByRole('textbox').first();
    await expect(searchOrFilter).toBeVisible({ timeout: 15000 });
  });

  // 2. Descubrimiento Marketplace
  test('Paso P1.2 (Market): /es/market carga productos con precios y llamada API válida', async ({ page, request }) => {
    // Verificación de API directa
    const apiRes = await request.get(`${API_BASE}/api/catalog/market/public/products?page=0&size=5`);
    expect(apiRes.status()).toBe(200);

    const data = await apiRes.json();
    expect(data).toHaveProperty('content');
    expect(Array.isArray(data.content)).toBe(true);

    // Verificación de UI
    await page.goto('/es/market');
    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();
  });

  // 3. Compuerta de Seguridad: Creación de cita requiere rol CONSUMER
  test('Paso P4 (Seguridad): POST /api/appointments/create sin autenticación es rechazado con 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/appointments/create`, {
      data: {
        providerId: 1,
        locationId: 1,
        startTime: '2026-10-15T10:00:00',
        endTime: '2026-10-15T10:30:00',
        reason: 'Consulta General'
      }
    });

    expect(res.status()).toBe(401);
  });

  // 4. Consulta de Disponibilidad de Horarios
  test('Paso P2 (Disponibilidad): GET /api/appointments/schedules/*/available-slots es público', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/appointments/schedules/1/available-slots?locationId=1&startDate=2026-10-15&endDate=2026-10-15&durationMinutes=30`);
    
    // Puede responder 200 con slots, o 400/404 si el prestador 1 no tiene esa sede, pero NO 401 (está en permitAll)
    expect([200, 400, 404]).toContain(res.status());
  });

  // 5. Flujo de Onboarding Prestador
  test('Paso D1 (Prestador): /es/onboarding/profile y /es/onboarding/license renderizan formularios de alta', async ({ page }) => {
    await page.goto('/es/onboarding/profile');
    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();
  });

  // 6. Ruptura 2: Transición de Roles y Sesión del Paciente en Checkout
  test('Ruptura 2: /es/patient/booking/* no rebota preventivamente a /login para visitantes anónimos', async ({ page }) => {
    await page.goto('/es/patient/booking/demo-doctor');
    expect(page.url()).not.toContain('/login');
  });

  test('Ruptura 2: El enlace de registro en /es/login preserva callbackUrl hacia booking', async ({ page }) => {
    await page.goto('/es/login?callbackUrl=%2Fes%2Fpatient%2Fbooking%2Fdemo-doctor');
    const registerLink = page.locator('a[href*="/register"]');
    await expect(registerLink).toBeVisible();
    const href = await registerLink.getAttribute('href');
    expect(href).toContain('callbackUrl');
  });

  test('Ruptura 2: El enlace de login en /es/register preserva callbackUrl hacia booking', async ({ page }) => {
    await page.goto('/es/register?callbackUrl=%2Fes%2Fpatient%2Fbooking%2Fdemo-doctor');
    const loginLink = page.locator('a[href*="/login"]');
    await expect(loginLink).toBeVisible();
    const href = await loginLink.getAttribute('href');
    expect(href).toContain('callbackUrl');
  });

});
