import { test, expect } from '@playwright/test';

test.describe('Landing and Auth Flow', () => {
  test('Users can view landing page', async ({ page }) => {
    await page.goto('/');

    // Check Hero Section
    await expect(page.locator('h1').first()).toContainText('Tăng Doanh Thu Với');
    await expect(page.locator('text=Miễn phí mãi mãi')).toBeVisible();

    // Check Features (Fixed)
    await expect(page.locator('text=Tích Điểm Tự Động')).toBeVisible();
    await expect(page.locator('text=Quét Là Dùng')).toBeVisible();
    await expect(page.locator('text=Dashboard Quản Trị')).toBeVisible();

    // Check Navigation to Login
    await page.locator('a:has-text("Đăng nhập")').first().click();
    await page.waitForURL('**/login**');
    await expect(page.locator('p:has-text("Dành cho Chủ quán & Đối tác")')).toBeVisible();
  });

  test('Users see error on wrong password', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder(/Email/i);
    await emailInput.fill('admin@shop1.com');
    
    const passInput = page.getByPlaceholder(/Mật khẩu/i);
    await passInput.fill('wrongpassword');
    
    await page.locator('button:has-text("Đăng nhập")').click();

    // Wait for toast error
    await expect(page.locator('text=Tài khoản hoặc mật khẩu không chính xác')).toBeVisible({ timeout: 5000 });
  });
});
