import { test, expect } from '@playwright/test';

/**
 * Negative-path coverage for /platform-admin/** auth.
 *
 * These specs depend on PR-3a (middleware role guard) — without it,
 * any signed-in user lands on the platform-admin dashboard.
 *
 * Test users are created by tests/setup/seed.ts:
 *   - admin@dlmenu.com / dlmenu2024 → role=platform_admin
 *   - admin@shop1.com  / password123 → role=shop_owner
 */

const SUPERADMIN_EMAIL = 'admin@dlmenu.com';
const SUPERADMIN_PASSWORD = 'dlmenu2024';
const SHOP_OWNER_EMAIL = 'admin@shop1.com';
const SHOP_OWNER_PASSWORD = 'password123';

const signIn = async (page: any, email: string, password: string) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Login redirects via useEffect after profile loads — give it a beat.
  await page.waitForTimeout(2500);
};

test.describe('Platform Admin Auth (negative paths)', () => {
  test('unauthenticated visitor is redirected to /login', async ({ page }) => {
    // Start by clearing any persistent cookies from prior tests
    await page.context().clearCookies();
    await page.goto('/platform-admin/users', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login(\?|$)/, { timeout: 10000 });
    // Don't assert beyond the URL — login page may render with optional query params
  });

  test('shop_owner is rejected at /platform-admin and lands on /', async ({ page }) => {
    await signIn(page, SHOP_OWNER_EMAIL, SHOP_OWNER_PASSWORD);
    // After login, login page's useEffect redirects shop_owner to /admin.
    // From /admin we navigate manually to /platform-admin/users and assert rejection.
    const reachedAdmin = page.url().includes('/admin');
    if (!reachedAdmin) {
      // Manual fallback if login useEffect path differs in this build
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    }

    await page.goto('/platform-admin/users', { waitUntil: 'domcontentloaded' });
    // Middleware (PR-3a) redirects non-platform_admin to '/'
    await page.waitForURL(
      (url) => !url.pathname.startsWith('/platform-admin'),
      { timeout: 10000 }
    );
    // Final safeguard: explicitly assert we are NOT on /platform-admin
    expect(page.url()).not.toContain('/platform-admin');
  });

  test('platform_admin sees dashboard with users heading', async ({ page }) => {
    await signIn(page, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);

    // Login should redirect platform_admin to /platform-admin (per login/page.tsx useEffect)
    // Navigate explicitly to /platform-admin/users in case intermediate hop happens
    await page.goto('/platform-admin/users', { waitUntil: 'domcontentloaded' });

    // The Users page renders this heading when access is granted (per platform-admin/users/page.tsx:53)
    await expect(page.getByRole('heading', { name: /Quản lý Người dùng/i }))
      .toBeVisible({ timeout: 15000 });
  });
});
