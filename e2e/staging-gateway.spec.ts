import { test, expect } from '@playwright/test';

const GATEWAY_BASE = 'https://api-staging.quhealthy.org';

test.describe('QuHealthy Staging API Gateway E2E Tests', () => {

  test('Gateway healthz returns UP and lists all 5 Cloud Run services', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/healthz`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('UP');
    expect(body.environment).toBe('staging');
    expect(body.gateway).toBe('api-staging.quhealthy.org');
    expect(body.services).toBeDefined();
    expect(body.services.auth).toContain('auth-service');
    expect(body.services.catalog).toContain('catalog-service');
    expect(body.services.onboarding).toContain('onboarding-service');
    expect(body.services.appointment).toContain('appointment-service');
    expect(body.services.analytics).toContain('analytics-service');
  });

  test('CORS preflight (OPTIONS) returns 204 with allowed headers', async ({ request }) => {
    const response = await request.fetch(`${GATEWAY_BASE}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://staging.quhealthy.org',
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect(response.status()).toBe(204);
    expect(response.headers()['access-control-allow-origin']).toBe('https://staging.quhealthy.org');
    expect(response.headers()['access-control-allow-credentials']).toBe('true');
  });

  test('Catalog Service proxy: GET /api/catalog/market/public/products returns 200 and pageable structure', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/catalog/market/public/products`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('pageable');
    expect(body).toHaveProperty('totalElements');
  });

  test('Auth Service proxy: POST /api/auth/admin/login validates request payload', async ({ request }) => {
    const response = await request.post(`${GATEWAY_BASE}/api/auth/admin/login`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Expect 400 Bad Request with field validation errors
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.errors).toHaveProperty('email');
    expect(body.errors).toHaveProperty('password');
  });

  test('Onboarding Service proxy: GET /api/onboarding/catalogs/icd10 rejects unauthenticated request', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/onboarding/catalogs/icd10`);
    // Expect 401 Unauthorized (Spring Security)
    expect(response.status()).toBe(401);
  });

  test('Appointment Service proxy: GET /api/appointments/exchange-rates returns currencies', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/appointments/exchange-rates`);
    expect(response.status()).toBe(200);

    const rates = await response.json();
    expect(rates).toHaveProperty('MXN');
    expect(rates.MXN).toBe(1.0);
    expect(rates).toHaveProperty('USD');
  });
});
