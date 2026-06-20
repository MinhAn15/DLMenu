import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@shop1.com';
const ADMIN_PASS = 'password123';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/Email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/Mật khẩu/i).fill(ADMIN_PASS);
  await page.locator('button:has-text("Đăng nhập")').click();
  await page.waitForURL('**/admin**', { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  // Wait for react-hot-toast to auto-dismiss (z:9999 overlay intercepts Playwright clicks)
  await page.waitForTimeout(4000);
}

test.describe('AI Image Generation', () => {
  test('Menu Item Modal should show AI Image Generator section', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Menu via sidebar
    await page.locator('a:has-text("Thực đơn")').first().click();
    await expect(page.locator('h1:has-text("Quản lý Thực đơn")')).toBeVisible({ timeout: 20000 });
    // Wait for shop data to load (useAdminShop fetches async after page renders)
    await page.waitForTimeout(3000);

    // Open "Thêm món" modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent?.includes('Thêm món') && !b.closest('[class*="EmptyState"], [class*="empty"]'));
      if (addBtn) addBtn.click();
    });

    // Verify AI Image Generator section exists
    await expect(page.locator('[data-testid="ai-image-generator"]')).toBeVisible({ timeout: 10000 });

    // Verify all 6 preset cards are visible
    await expect(page.locator('[data-testid="preset-card-rustic"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-studio"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-minimal"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-dramatic"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-tropical"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-vintage"]')).toBeVisible();

    // Verify tab bar exists
    await expect(page.locator('[data-testid="tab-image-to-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-text-to-image"]')).toBeVisible();

    await page.screenshot({ path: 'test-results/ai-image-generator-modal.png', fullPage: true });
  });

  test('Text-to-Image tab should accept prompt and preset', async ({ page }) => {
    await loginAsAdmin(page);

    await page.locator('a:has-text("Thực đơn")').first().click();
    await expect(page.locator('h1:has-text("Quản lý Thực đơn")')).toBeVisible({ timeout: 20000 });
    // Wait for shop data to load (useAdminShop fetches async after page renders)
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent?.includes('Thêm món') && !b.closest('[class*="EmptyState"], [class*="empty"]'));
      if (addBtn) addBtn.click();
    });

    // Switch to "Viết Mô Tả" tab
    await page.locator('[data-testid="tab-text-to-image"]').click({ timeout: 5000 });

    // Type a prompt
    await page.locator('[data-testid="ai-prompt-input"]').fill('Cà phê sữa đá');

    // Select "Mộc mạc Di Linh" preset
    await page.locator('[data-testid="preset-card-rustic"]').click();

    // Verify the preset shows active state
    await expect(page.locator('[data-testid="preset-card-rustic"][data-active="true"]')).toBeVisible();

    // Verify "Tạo ảnh" button is visible
    await expect(page.locator('button:has-text("Tạo ảnh")')).toBeVisible();

    // Verify advanced section exists
    await expect(page.locator('text=Nâng cao')).toBeVisible();

    await page.screenshot({ path: 'test-results/ai-image-generator-text-tab.png', fullPage: true });
  });
});
