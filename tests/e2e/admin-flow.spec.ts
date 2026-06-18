import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('Admin can login and view dashboard', async ({ page }) => {
    await page.goto('/login');

    // Verify login page elements
    await expect(page.locator('text=Dành cho Chủ quán & Đối tác')).toBeVisible();

    // Login with Test Admin Email
    const emailInput = page.getByPlaceholder(/Email/i);
    await emailInput.fill('admin@shop1.com');
    
    const passInput = page.getByPlaceholder(/Mật khẩu/i);
    await passInput.fill('password123');
    
    await page.locator('button:has-text("Đăng nhập")').click();

    // Verify successful login message
    await expect(page.locator('text=Đăng nhập thành công!')).toBeVisible({ timeout: 5000 });

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin**', { timeout: 20000 });

    // Verify Admin Dashboard contents
    const content = await page.content();
    console.log("PAGE HTML CONTENT:", content);
    await expect(page.locator('h1').first()).toBeVisible();

    // Navigate to Orders
    await page.locator('a:has-text("Đơn hàng")').first().click();
    await expect(page.locator('h1:has-text("Quản lý Đơn hàng")')).toBeVisible();

    // Navigate to Menu
    await page.locator('a:has-text("Thực đơn")').first().click();
    await expect(page.locator('h1:has-text("Quản lý Thực đơn")')).toBeVisible({ timeout: 20000 });
  });
});
