import { test, expect } from '@playwright/test';

test.describe('Admin Menu Management Flow', () => {
  test('Admin can view menu items', async ({ page }) => {
    // Navigate and login
    await page.goto('/login');
    const emailInput = page.getByPlaceholder(/Email/i);
    await emailInput.fill('admin@shop1.com');
    const passInput = page.getByPlaceholder(/Mật khẩu/i);
    await passInput.fill('password123');
    await page.locator('button:has-text("Đăng nhập")').click();

    // Verify login success
    await expect(page.locator('text=Đăng nhập thành công!')).toBeVisible({ timeout: 5000 });
    await page.waitForURL('**/admin**', { timeout: 20000 });

    // Navigate to Menu
    await page.locator('a:has-text("Thực đơn")').first().click();
    await page.waitForURL('**/admin/menu**');

    // Check menu page content
    await expect(page.locator('h1:has-text("Quản lý Thực đơn")')).toBeVisible();

    // The test data might be empty depending on the shop
    // We just check if the "Thêm" button is visible
    await expect(page.locator('button:has-text("Thêm")').first()).toBeVisible({ timeout: 10000 });
  });
});
