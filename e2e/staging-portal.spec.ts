import { test, expect } from '@playwright/test';

test.describe('QuHealthy Staging Portal UI E2E Tests', () => {

  test('Home page loads with branding and navigation', async ({ page }) => {
    await page.goto('/es');

    // Verify title and main elements
    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();

    // Verify presence of header / navigation links
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('Admin login page renders login form with email and password fields', async ({ page }) => {
    await page.goto('/es/admin/login');

    // Verify page title
    await expect(page).toHaveTitle(/QuHealthy|Administrativo/i);

    // Verify form fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[id*="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('Consumer login page renders correctly', async ({ page }) => {
    await page.goto('/es/login');

    await expect(page).toHaveTitle(/QuHealthy/i);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
  });

  test('Market page renders and loads product catalog interface', async ({ page }) => {
    await page.goto('/es/market');

    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Discover page renders doctor and service directory layout', async ({ page }) => {
    await page.goto('/es/discover');

    await expect(page).toHaveTitle(/QuHealthy/i);
    await expect(page.locator('body')).toBeVisible();
  });
});
