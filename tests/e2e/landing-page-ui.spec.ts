import { test, expect } from '@playwright/test';

test.describe('Landing Page UI & Theme Contrast Audit', () => {
  test('Should render correctly and handle Light/Dark mode contrast', async ({ page }) => {
    // 1. Access landing page
    await page.goto('/');
    
    // 2. Verify Headline H1 contains correct texts
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Quản Lý Quán');
    await expect(h1).toContainText('Đơn Giản & Mộc Mạc');

    // 3. Verify Bento Box elements exist
    await expect(page.locator('[class*="bentoContainer"]')).toBeVisible();
    
    // 4. Set theme to Light and verify readability
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    });
    await page.waitForTimeout(500); // Wait for transition

    // Assert body background is light (check backgroundImage containing rgb values)
    const bodyBgLight = await page.evaluate(() => window.getComputedStyle(document.body).backgroundImage);
    expect(bodyBgLight).toContain('rgb(25'); 

    // Assert H1 text color is dark in light mode
    const h1ColorLight = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? window.getComputedStyle(el).color : '';
    });
    expect(h1ColorLight).toBe('rgb(26, 26, 26)'); // Matches var(--color-text) #1A1A1A

    await page.screenshot({ path: 'test-results/landing-page-light.png', fullPage: true });

    // 5. Set theme to Dark and verify readability
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    });
    await page.waitForTimeout(500); // Wait for transition

    // Assert body background is dark (check backgroundImage containing dark rgb values)
    const bodyBgDark = await page.evaluate(() => window.getComputedStyle(document.body).backgroundImage);
    expect(bodyBgDark).toContain('rgb(18, 18, 18)'); // Matches var(--color-bg) #121212

    // Assert H1 text color is light in dark mode
    const h1ColorDark = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? window.getComputedStyle(el).color : '';
    });
    expect(h1ColorDark).toBe('rgb(243, 244, 246)'); // Matches var(--color-text) #F3F4F6

    await page.screenshot({ path: 'test-results/landing-page-dark.png', fullPage: true });
  });
});
