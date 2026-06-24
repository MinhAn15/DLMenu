import { test, expect } from '@playwright/test';

test.describe('Authentication Flow & Rate Limiting', () => {
  test('Users can view landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Quản lý quán thông minh');
    await expect(page.getByRole('link', { name: 'Bắt đầu miễn phí' })).toBeVisible();
  });

  test('Admin login successful', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@shop1.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1').first()).toContainText('DiLinhMenu');
  });

  test('Users see error on wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@shop1.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Wait for toast error
    await expect(page.getByText('Tài khoản hoặc mật khẩu không chính xác')).toBeVisible({ timeout: 10000 });
  });
});
