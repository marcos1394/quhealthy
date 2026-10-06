import { test, expect } from '@playwright/test';

const GATEWAY_BASE = 'https://api-staging.quhealthy.org';

test.describe('QuHealthy Staging API Gateway E2E Tests', () => {

  test('Gateway healthz returns UP and lists all 12 Cloud Run services', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/healthz`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('UP');
    expect(body.environment).toBe('staging');
    expect(body.gateway).toBe('api-staging.quhealthy.org');
    expect(body.services).toBeDefined();
    // Wave 1
    expect(body.services.auth).toContain('auth-service');
    expect(body.services.analytics).toContain('analytics-service');
    // Wave 2
    expect(body.services.catalog).toContain('catalog-service');
    expect(body.services.onboarding).toContain('onboarding-service');
    expect(body.services.appointment).toContain('appointment-service');
    // Wave 3
    expect(body.services.notification).toContain('notification-service');
    expect(body.services.referral).toContain('referral-service');
    expect(body.services.review).toContain('review-service');
    // Wave 4
    expect(body.services.payment).toContain('payment-service');
    expect(body.services.social).toContain('social-service');
    expect(body.services.admin).toContain('admin-service');
    expect(body.services.healthAgent).toContain('health-agent-service');
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

  test('Notification Service proxy: GET /api/notifications rejects unauthenticated request', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/notifications`);
    // Expect 401 Unauthorized or 403 Forbidden (Spring Security fail-closed)
    expect([401, 403]).toContain(response.status());
  });

  test('Referral Service proxy: GET /api/referrals/dashboard rejects unauthenticated request', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/referrals/dashboard`);
    // Expect 401 Unauthorized or 403 Forbidden (Spring Security fail-closed)
    expect([401, 403]).toContain(response.status());
  });

  test('Review Service proxy: GET /api/reviews/provider/1/stats returns 200 with stats structure', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/reviews/provider/1/stats`);
    expect(response.status()).toBe(200);

    const stats = await response.json();
    expect(stats).toBeDefined();
  });

  test('Payment Service proxy: GET /api/payments/plans returns 200 and list structure', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/payments/plans`);
    expect(response.status()).toBe(200);

    const plans = await response.json();
    expect(Array.isArray(plans)).toBe(true);
  });

  test('Social Service proxy: GET /api/social/posts rejects unauthenticated request', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/api/social/posts`);
    // Expect 401 Unauthorized or 403 Forbidden (Spring Security fail-closed)
    expect([401, 403]).toContain(response.status());
  });

  test('Admin Service proxy: GET /sba-settings.js returns 200 with script content', async ({ request }) => {
    const response = await request.get(`${GATEWAY_BASE}/sba-settings.js`);
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test('Health Agent Service proxy: POST /api/v1/health-agent/intent returns 200 with intent response', async ({ request }) => {
    const response = await request.post(`${GATEWAY_BASE}/api/v1/health-agent/intent`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('complete');
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('intent');
  });
});

