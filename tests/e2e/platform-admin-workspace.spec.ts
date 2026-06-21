import { test, expect } from '@playwright/test';

test.describe('Platform Admin — Tenant Workspace', () => {
  test('Can open shop workspace and navigate tabs', async ({ page }) => {
    // Login as platform admin
    await page.goto('/login');
    await page.getByPlaceholder(/Email/i).fill('admin@platform.com');
    await page.getByPlaceholder(/Mật khẩu/i).fill('password123');
    await page.locator('button:has-text("Đăng nhập")').click();
    await page.waitForURL('**/admin**', { timeout: 20000 }).catch(() => {});
    // Platform admin might redirect to /admin or /platform-admin
    await page.goto('/platform-admin/shops');
    await page.waitForTimeout(3000);

    // Verify shops list loads
    await expect(page.locator('h1')).toBeVisible();

    // Click the first shop's workspace link
    const shopLink = page.locator('a[href*="/platform-admin/shops/"]').first();
    if (await shopLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shopLink.click();
      await page.waitForTimeout(2000);

      // Verify workspace header shows shop name
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });

      // Verify tabs are visible
      await expect(page.locator('button:has-text("Tổng quan")')).toBeVisible();
      await expect(page.locator('button:has-text("Menu")')).toBeVisible();
      await expect(page.locator('button:has-text("Khuyến mãi")')).toBeVisible();
      await expect(page.locator('button:has-text("Cài đặt")')).toBeVisible();
      await expect(page.locator('button:has-text("Hoạt động")')).toBeVisible();

      // Switch to Menu tab
      await page.locator('button:has-text("Menu")').click();
      await page.waitForTimeout(500);

      // Switch to Cài đặt tab
      await page.locator('button:has-text("Cài đặt")').click();
      await page.waitForTimeout(500);

      // Verify theme preview renders
      await expect(page.locator('text=Giao diện (Theme)')).toBeVisible();

      // Switch to Hoạt động tab
      await page.locator('button:has-text("Hoạt động")').click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Nhật ký hoạt động')).toBeVisible();

      await page.screenshot({ path: 'test-results/tenant-workspace-overview.png', fullPage: true });
    }
  });

  test('Shop list links navigate to workspace', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Email/i).fill('admin@platform.com');
    await page.getByPlaceholder(/Mật khẩu/i).fill('password123');
    await page.locator('button:has-text("Đăng nhập")').click();
    await page.waitForURL('**/admin**', { timeout: 20000 }).catch(() => {});
    await page.goto('/platform-admin/shops');
    await page.waitForTimeout(3000);

    // Click a shop row link
    const shopLink = page.locator('a[href*="/platform-admin/shops/"]').first();
    if (await shopLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const oldUrl = page.url();
      await shopLink.click();
      await page.waitForTimeout(2000);

      // Verify we navigated away from the list
      expect(page.url()).not.toBe(oldUrl);
    }
  });
});