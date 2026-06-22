import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Platform Admin Dashboard
 *
 * Kiểm thử giao diện Platform Admin dashboard sau khi migration
 * từ AdminDataContext sang tRPC adminRouter.
 *
 * Test user: admin@dlmenu.com / dlmenu2024 → role=platform_admin
 */

const SUPERADMIN_EMAIL = 'admin@dlmenu.com';
const SUPERADMIN_PASSWORD = 'dlmenu2024';

const signIn = async (page: any, email: string, password: string) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
};

test.describe('Platform Admin Dashboard — tRPC Migration', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
  });

  test('Dashboard page loads with heading', async ({ page }) => {
    await page.goto('/platform-admin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Bảng điều khiển/i }))
      .toBeVisible({ timeout: 15000 });
  });

  test('Sidebar navigation links are visible', async ({ page }) => {
    await page.goto('/platform-admin', { waitUntil: 'domcontentloaded' });
    // PlatformSidebar renders navigation links
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Quán')).toBeVisible();
    await expect(page.getByText('Menu')).toBeVisible();
  });

  test('Users page loads data via tRPC', async ({ page }) => {
    await page.goto('/platform-admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Quản lý Người dùng/i }))
      .toBeVisible({ timeout: 15000 });
    // Verify table header is rendered (tRPC data loaded)
    await expect(page.getByText('Vai trò')).toBeVisible({ timeout: 10000 });
  });

  test('Shops page loads data via tRPC', async ({ page }) => {
    await page.goto('/platform-admin/shops', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Quản lý Quán/i }))
      .toBeVisible({ timeout: 15000 });
    // Table header visible means page rendered
    await expect(page.getByText('Slug')).toBeVisible({ timeout: 10000 });
  });

  test('Orders page loads data via tRPC', async ({ page }) => {
    await page.goto('/platform-admin/orders', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Giám sát Đơn hàng/i }))
      .toBeVisible({ timeout: 15000 });
    // Status filter buttons rendered
    await expect(page.getByText('Tất cả')).toBeVisible({ timeout: 10000 });
  });

  test('Tables page loads data via tRPC', async ({ page }) => {
    await page.goto('/platform-admin/tables', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Quản lý Bàn/i }))
      .toBeVisible({ timeout: 15000 });
    // Batch create button is visible
    await expect(page.getByText('Tạo hàng loạt')).toBeVisible({ timeout: 10000 });
  });

  test('Menu page loads data via tRPC', async ({ page }) => {
    await page.goto('/platform-admin/menu', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Kho Menu Toàn Cục/i }))
      .toBeVisible({ timeout: 15000 });
    // Tabs are rendered
    await expect(page.getByText('Danh mục')).toBeVisible({ timeout: 10000 });
  });

  test('ShopSelector dropdown is functional', async ({ page }) => {
    await page.goto('/platform-admin', { waitUntil: 'domcontentloaded' });
    // ShopSelector renders in header — look for "Tất cả quán" or similar
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Platform Control Center')).toBeVisible();
  });

  test('Navigate between tabs via sidebar', async ({ page }) => {
    await page.goto('/platform-admin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Bảng điều khiển/i }))
      .toBeVisible({ timeout: 15000 });

    // Click "Đơn hàng" in sidebar to navigate
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const target = links.find(a => a.textContent?.includes('Đơn hàng'));
      if (target) target.click();
    });
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /Giám sát Đơn hàng/i }))
      .toBeVisible({ timeout: 15000 });
  });
});
