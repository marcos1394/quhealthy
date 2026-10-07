import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for QuHealthy Staging
 * Tests both the unified API Gateway (api-staging.quhealthy.org)
 * and the Next.js Staging Portal (staging.quhealthy.org)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  expect: {
    timeout: 20000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.STAGING_URL || 'https://staging.quhealthy.org',
    extraHTTPHeaders: {
      ...(process.env.VERCEL_PROTECTION_BYPASS
        ? { 'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS }
        : {}),
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
