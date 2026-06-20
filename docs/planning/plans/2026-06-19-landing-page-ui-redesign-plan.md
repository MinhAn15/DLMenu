# Landing Page UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Bento Box landing page layout and color system to achieve high contrast readability, visual balance, and premium glassmorphism in both light and dark mode.

**Architecture:** Use CSS Modules local variables to define theme-adaptive colors for the Hero section, decouple from global theme conflicts, remove all legacy inline styles, and enforce a mobile-first responsive layout grid.

**Tech Stack:** Next.js, React, Vanilla CSS Modules, Lucide React, Playwright E2E.

---

### Task 1: Write E2E Test for UI Contrast and Structure (TDD Prep)

**Files:**
- Create: `tests/e2e/landing-page-ui.spec.ts`

- [ ] **Step 1: Write the Playwright test code**
  Create a new test file `tests/e2e/landing-page-ui.spec.ts` to check landing page H1, Bento cards layout structure, dark/light theme classes, and take verification screenshots.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page UI & Theme Contrast Audit', () => {
  test('Should render correctly and handle Light/Dark mode contrast', async ({ page }) => {
    // 1. Access landing page
    await page.goto('/');
    
    // 2. Verify H1 contains correct texts
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Quản Lý Quán');
    await expect(h1).toContainText('Đơn Giản & Mộc Mạc');

    // 3. Verify Bento Box elements exist
    await expect(page.locator('[class*="bentoContainer"]')).toBeVisible();
    await expect(page.locator('[class*="bentoCard"]').first()).toBeVisible();
    
    // 4. Set theme to Light and verify readability (no white text on white bg)
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500); // Wait for transition
    await page.screenshot({ path: 'test-results/landing-page-light.png', fullPage: true });

    // 5. Set theme to Dark and verify readability
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(500); // Wait for transition
    await page.screenshot({ path: 'test-results/landing-page-dark.png', fullPage: true });
  });
});
```

- [ ] **Step 2: Run the test to confirm layout matches and capture initial screenshots**
  Run: `npx playwright test tests/e2e/landing-page-ui.spec.ts`
  Expected: PASS or FAIL depending on the exact text matches, but it will capture the initial state screenshots to `test-results/`.

- [ ] **Step 3: Commit**
  ```bash
  git add tests/e2e/landing-page-ui.spec.ts
  git commit -m "test: add landing page UI and theme contrast audit test"
  ```

---

### Task 2: Standardize HTML/JSX Structure & Remove Inline Styles

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace inline style attributes with CSS module classes**
  Open [page.tsx](file:///c:/Project/New%20folder/DLMenu/src/app/page.tsx) and extract all inline styles into clean CSS Module classes. Specifically:
  - Line 136: Replace `style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}` with `.bentoIconBg` or specific styles.
  - Line 137-140: Replace inline font size, weight, and color variables.
  - Line 171: Replace `style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}` on Tích điểm card with a CSS class `.bentoCardPrimary`.
  - Line 172-174: Replace text inline styles.
  - Line 182-186: Replace inline height styles for bento chart bars with CSS variables or clean module code.

- [ ] **Step 2: Apply proper layout structure classes**
  Update the H1 layout, align items vertically, and match text elements to ensure proper CSS modules binding.

- [ ] **Step 3: Commit**
  ```bash
  git add src/app/page.tsx
  git commit -m "refactor: remove all legacy inline styles from landing page"
  ```

---

### Task 3: Refactor CSS Module with Adaptive Theme and Visual Balance

**Files:**
- Modify: `src/app/page.module.css`

- [ ] **Step 1: Enforce local CSS Variables for .hero container and bento box**
  Define local variables for light mode and override them under `.dark` selector inside [page.module.css](file:///c:/Project/New%20folder/DLMenu/src/app/page.module.css) to ensure absolute contrast safety.

- [ ] **Step 2: Update Layout Alignment and Constraints**
  - Restrict `.bentoContainer` max-width to `560px` to prevent stretching.
  - Set `.container` grid gap to `3rem` and align items vertically (`align-items: center`).
  - Upgrade H1 title and subtitle font sizes, margins, and letter-spacing.

- [ ] **Step 3: Implement Premium Glassmorphism and Hover Micro-animations**
  - Implement smooth multi-layered bazan shadows.
  - Add gradient borders and subtle backdrops.
  - Implement 3D translation hover animations.

- [ ] **Step 4: Commit**
  ```bash
  git add src/app/page.module.css
  git commit -m "feat: implement adaptive contrast variables and premium bento styling"
  ```

---

### Task 4: Verify with Playwright & Visual Audit

**Files:**
- Test: `tests/e2e/landing-page-ui.spec.ts`

- [ ] **Step 1: Execute Playwright tests**
  Run: `npx playwright test tests/e2e/landing-page-ui.spec.ts`
  Expected: PASS

- [ ] **Step 2: Verify Contrast and Visual Layout manually using browser agent**
  Use `browser_subagent` to open `http://localhost:3000/`, capture screenshots of both Light and Dark themes, and inspect font contrast values.

- [ ] **Step 3: Commit all visual fixes if any adjustments are needed**
  ```bash
  git commit -am "chore: polish landing page ui after contrast validation"
  ```
