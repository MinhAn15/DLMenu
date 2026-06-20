# Landing Page Theme Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the landing page CSS system to adapt all sections, headings, text elements, and background gradients to the Light/Dark mode state using Design System variables, and fix the vertical layout alignment.

**Architecture:** Replace all hardcoded hex/rgb color codes in `page.module.css` with CSS variables from `globals.css` (`--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-secondary`). Introduce custom theme-aware gradient variables for the body background.

**Tech Stack:** Next.js, React, CSS Modules, Playwright E2E.

---

### Task 1: Update Playwright E2E Test to Assert Theme Color Changes (TDD Prep)

**Files:**
- Modify: `tests/e2e/landing-page-ui.spec.ts`

- [ ] **Step 1: Update Playwright test assertions**
  Open [landing-page-ui.spec.ts](file:///c:/Project/New%20folder/DLMenu/tests/e2e/landing-page-ui.spec.ts) and add assertions to check computed styles for background-color and heading text color in both themes.

```typescript
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

    // Assert body background is light
    const bodyBgLight = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    // Should be warm cream-white (rgb(250, 237, 223) or rgb(255, 253, 249) or rgb(255, 249, 242))
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

    // Assert body background is dark
    const bodyBgDark = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    expect(bodyBgDark).toBe('rgb(18, 18, 18)'); // Matches var(--color-bg) #121212

    // Assert H1 text color is light in dark mode
    const h1ColorDark = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? window.getComputedStyle(el).color : '';
    });
    expect(h1ColorDark).toBe('rgb(243, 244, 246)'); // Matches var(--color-text) #F3F4F6

    await page.screenshot({ path: 'test-results/landing-page-dark.png', fullPage: true });
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**
  Run: `npx playwright test tests/e2e/landing-page-ui.spec.ts`
  Expected: FAIL on the Dark Mode assertions (body background is not rgb(18, 18, 18) and/or H1 text color is not rgb(243, 244, 246)).

- [ ] **Step 3: Commit**
  ```bash
  git add tests/e2e/landing-page-ui.spec.ts
  git commit -m "test: update landing page E2E test with strict color assertions"
  ```

---

### Task 2: Configure Body Background Gradient to Support Dark Mode

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Override bg-gradient in Dark Mode**
  Open [globals.css](file:///c:/Project/New%20folder/DLMenu/src/app/globals.css) and append the `.dark .bg-gradient` override after line 141.

```css
/* Background Gradient for Body */
.bg-gradient {
  background: linear-gradient(135deg, #FFF9F2 0%, #FAEDDF 50%, #F5F7FA 100%);
  background-attachment: fixed;
  transition: background var(--transition-slow);
}

.dark .bg-gradient {
  background: linear-gradient(135deg, #1A100A 0%, #140C08 50%, #121212 100%);
}
```

- [ ] **Step 2: Commit**
  ```bash
  git add src/app/globals.css
  git commit -m "feat: make body background gradient theme-adaptive in dark mode"
  ```

---

### Task 3: Refactor page.module.css to Remove All Hardcoded Colors and Fix Alignment

**Files:**
- Modify: `src/app/page.module.css`

- [ ] **Step 1: Fix Hero layout vertical alignment and variables**
  Open [page.module.css](file:///c:/Project/New%20folder/DLMenu/src/app/page.module.css), change `.container` layout to vertically center items, and define theme-adaptive colors.
  - Modify `.container` to add `align-items: center;`.
  - Update `.title` color to `var(--color-text)`.
  - Update `.subtitle` color to `var(--color-text-secondary)`.

```css
.container {
  max-w: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-text);
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-8);
  max-width: 600px;
}
```

- [ ] **Step 2: Remove hardcoded colors from Header, Logos, and How It Works sections**
  - Adapt `.header` background using local variables.
  - Update `.logos` and `.logoGrid span` to use design system variables.
  - Update `.howItWorks` and `.sectionTitle` / `.sectionSub` to use variables.

```css
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  background: var(--header-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  --header-bg: rgba(255, 255, 255, 0.85);
}

:global(.dark) .header {
  --header-bg: rgba(18, 18, 18, 0.85);
}

.logos {
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
}

.logosTitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-6);
}

.logoGrid span {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
}

.howItWorks {
  padding: 100px var(--space-4);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border-light);
}

.sectionTitle {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.sectionSub {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: Remove hardcoded colors from Steps, Features, and Pricing sections**
  - Update `.stepNum` circle colors to adapt to Dark mode.
  - Update `.stepTitle`, `.stepDesc`, `.featCard`, `.featTitle`, `.featDesc`.
  - Update `.pricing`, `.priceCard`, `.priceName`, `.priceAmount`, `.priceFeatures li`.
  - Modify hover border colors to use Bazan primary color instead of pink.

```css
.stepNum {
  width: 64px;
  height: 64px;
  background: var(--step-num-bg, #FFF3E0);
  color: var(--step-num-text, #D97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 auto var(--space-6);
  --step-num-bg: #FFF3E0;
  --step-num-text: #D97706;
}

:global(.dark) .stepNum {
  --step-num-bg: rgba(245, 166, 35, 0.15);
  --step-num-text: #F5A623;
}

.stepTitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.stepDesc {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.features {
  padding: 100px var(--space-4);
  background: var(--color-surface);
}

.featCard {
  padding: var(--space-8);
  border-radius: 24px;
  background: var(--card-bg, #F9FAFB);
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
  --card-bg: #F9FAFB;
}

:global(.dark) .featCard {
  --card-bg: rgba(255, 255, 255, 0.03);
}

.featCard:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.featTitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.featDesc {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.pricing {
  padding: 100px var(--space-4);
  background: var(--color-bg);
}

.priceCard {
  background: var(--color-surface);
  border-radius: 32px;
  padding: 40px;
  border: 1px solid var(--color-border);
  position: relative;
  transition: transform 0.3s ease;
}

.priceName {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.priceAmount {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.priceAmount span {
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.priceFeatures li {
  padding: 12px 0;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer {
  background: #0C0705;
  color: white;
  padding: var(--space-12) var(--space-4);
  text-align: center;
  border-top: 1px solid rgba(140, 74, 38, 0.15);
}
```

- [ ] **Step 4: Commit**
  ```bash
  git add src/app/page.module.css
  git commit -m "refactor: replace all hardcoded landing page colors with adaptive design system variables"
  ```

---

### Task 4: Run Playwright Tests and Inspect Visual Verification

**Files:**
- Test: `tests/e2e/landing-page-ui.spec.ts`

- [ ] **Step 1: Execute Playwright tests**
  Run: `npx playwright test tests/e2e/landing-page-ui.spec.ts`
  Expected: PASS

- [ ] **Step 2: Verify Contrast and Visual Layout manually using browser agent**
  Use `browser_subagent` to open `http://localhost:3000/`, capture screenshots of both Light and Dark themes, and inspect font contrast values.

- [ ] **Step 3: Commit all visual fixes if any adjustments are needed**
  ```bash
  git commit -am "chore: polish landing page ui color contrast variables"
  ```
