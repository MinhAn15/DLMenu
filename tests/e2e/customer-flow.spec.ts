import { test, expect } from '@playwright/test';

test.describe('Customer Flow & Cart Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the seeded shop and table
    await page.goto('/s/quan-cafe-mai/t/1');
  });

  test('Customer can view menu and place an order', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cà Phê', { ignoreCase: true });
    await expect(page.getByText('Bàn 1')).toBeVisible();

    // Add items to cart
    const cardDenDa = page.locator('div.flex-grow').filter({ has: page.getByRole('heading', { name: 'Cà phê Đen Đá', exact: true }) }).first();
    await cardDenDa.getByRole('button', { name: 'Thêm' }).click();
    
    const cardDao = page.locator('div.flex-grow').filter({ has: page.getByRole('heading', { name: 'Trà Đào Cam Sả', exact: true }) }).first();
    await cardDao.getByRole('button', { name: 'Thêm' }).click();
    
    // Open Cart
    await page.locator('text=Giỏ hàng của bạn').click();
    
    // Add Note
    await page.fill('textarea', 'Ít đá, không đường nhé');

    // Confirm Checkout
    await page.locator('button:has-text("Gửi Order")').click();

    // Verify Success
    await expect(page.getByText('Đặt món thành công!')).toBeVisible({ timeout: 10000 });
  });

  test('Customer cart retains items across reloads (localStorage)', async ({ page }) => {
    // Navigate and add specific item
    await page.goto('/s/quan-cafe-mai/t/1');
    const card = page.locator('div.flex-grow').filter({ has: page.getByRole('heading', { name: 'Cà phê Sữa Đá', exact: true }) }).first();
    await card.getByRole('button', { name: 'Thêm' }).click();
    await page.reload();
    const cartBar = page.locator('text=Giỏ hàng của bạn').locator('..');
    await expect(cartBar).toBeVisible();
    await expect(cartBar).toContainText('25.000');
  });
});
