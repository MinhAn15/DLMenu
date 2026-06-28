import { test, expect } from '@playwright/test';

test('Admin KDS Kanban View', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@dilinhmenu.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**');

  await page.goto('http://localhost:3000/admin/orders');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/60b51c8f-403c-4a92-87da-23ef72c7c406/admin_kds_screenshot.png' });

  await expect(page.locator('h1', { hasText: 'Kanban Bếp (KDS)' })).toBeVisible();
});
