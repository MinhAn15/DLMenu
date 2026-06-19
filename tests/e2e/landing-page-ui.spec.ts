import { test, expect } from '@playwright/test';

test.describe('Landing Page UI & Theme Contrast Audit', () => {
  test('Should render correctly and handle Light/Dark mode contrast', async ({ page }) => {
    // 1. Truy cập trang chủ
    await page.goto('/');
    
    // 2. Kiểm tra Headline H1 đúng nội dung
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Quản Lý Quán');
    await expect(h1).toContainText('Đơn Giản & Mộc Mạc');

    // 3. Kiểm tra các thành phần Bento Box hiển thị
    await expect(page.locator('[class*="bentoContainer"]')).toBeVisible();
    await expect(page.locator('[class*="bentoCard"]').first()).toBeVisible();
    
    // 4. Thiết lập Light Theme và chụp ảnh kiểm định
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500); // Đợi CSS transition
    await page.screenshot({ path: 'test-results/landing-page-light.png', fullPage: true });

    // 5. Thiết lập Dark Theme và chụp ảnh kiểm định
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/landing-page-dark.png', fullPage: true });
  });
});
