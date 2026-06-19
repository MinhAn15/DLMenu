import { test, expect } from '@playwright/test';

test.describe('Super Admin Audit Flow', () => {
  test('Super Admin login and dashboard audit', async ({ page }) => {
    // Tăng thời gian timeout để bạn dễ xem
    test.setTimeout(60000);

    console.log('1. Mở trang đăng nhập...');
    await page.goto('/login');
    await page.waitForTimeout(2000);

    console.log('2. Đăng nhập bằng tài khoản Super Admin...');
    await page.fill('input[type="email"]', 'admin@dlmenu.com');
    await page.waitForTimeout(1000);
    await page.fill('input[type="password"]', 'dlmenu2024');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');

    console.log('3. Chờ chuyển hướng vào Platform Admin Dashboard...');
    // Đợi URL chuyển sang /platform-admin
    await page.waitForURL('**/platform-admin', { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('4. Kiểm tra danh sách Shop...');
    // Cố gắng tìm bảng danh sách shop hoặc thẻ hiển thị shop
    await expect(page.locator('p', { hasText: 'Cà phê Mai' }).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('5. Thử click xem chi tiết hệ thống...');
    // Hover qua một vài phần tử để test UI
    const shopRow = page.locator('p', { hasText: 'Cà phê Mai' }).first();
    await shopRow.hover();
    await page.waitForTimeout(2000);

    console.log('6. Hoàn tất chu trình Audit cơ bản!');
    await page.waitForTimeout(3000);
  });
});
