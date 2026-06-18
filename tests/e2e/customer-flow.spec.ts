import { test, expect } from '@playwright/test';

test.describe('Customer Flow', () => {
  test('Customer can view menu and place an order', async ({ page }) => {
    // Navigate to the test shop created by seed.ts
    await page.goto('/s/ca-phe-mai/t/1');

    // Wait for the shop name to load
    await expect(page.locator('h1:has-text("Cà phê Mai")')).toBeVisible();

    // Expect categories to be visible
    await expect(page.locator('a:has-text("Cà phê")').first()).toBeVisible();

    // Add an item to cart
    const addButtons = page.locator('button:has-text("Thêm")');
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();

    // Expect cart bar to appear
    const cartBar = page.locator('text=Giỏ hàng của bạn');
    await expect(cartBar).toBeVisible();

    // Open cart modal
    await page.locator('text=Xem').last().click();

    // Click checkout
    const checkoutButton = page.locator('button:has-text("Gửi Order")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Checkout is direct now (anonymous)
    await expect(page.locator('text=Đã đặt món!')).toBeVisible({ timeout: 10000 });

    // Wait for order success state (from OrderStatusTracker)
    await expect(page.locator('text=Đã đặt món!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Tiếp tục xem menu")')).toBeVisible();
  });
});
