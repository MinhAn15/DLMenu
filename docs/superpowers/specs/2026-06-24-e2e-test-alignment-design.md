# Design Specification: E2E Test Suite Alignment & Bug Fixes

This specification details the plan to align the E2E test suite with the updated landing page UI, the Mock Auth system, and the customer route parameters, resolving the 23 failing E2E tests.

## 1. Problem Statement
The E2E Playwright tests are currently failing due to three main causes:
1. **Landing Page Text Changes:** The landing page headers were updated to "Quản lý quán thông minh", "Vận hành.", and "Siêu tốc." (with buttons like "Bắt đầu miễn phí" and "Đăng ký quán"), while E2E tests still assert the old text "Quản Lý Quán" and "Đơn Giản & Mộc Mạc".
2. **Mock Auth Role Mapping:** The test suite uses `admin@dlmenu.com` as the Platform Admin, but the mock auth hook `useAuth.ts` only maps emails containing `platform@` to the `platform_admin` role. Thus, the superadmin tests get redirected away from `/platform-admin`, resulting in routing timeouts.
3. **Login Placeholder and Helpers:** The login page is missing the exact text "Dành cho Chủ quán & Đối tác" and the placeholder "Email", causing tests waiting for these selectors to time out.
4. **Customer Slug Mismatch:** Under Mock mode, `useShop` expects the slug to be `quan-cafe-mai` (from `mockData.ts`), whereas the customer E2E test visits `/s/ca-phe-mai/t/1`.

---

## 2. Proposed Design

### A. Login Page UI Enhancements (`src/app/login/page.tsx`)
- Add the subtitle text `"Dành cho Chủ quán & Đối tác"` above the main heading to satisfy the login element check in `admin-flow.spec.ts`.
- Update the email input placeholder from `"VD: admin@quanmai.com"` to `"Email (VD: admin@quanmai.com)"` so Playwright locator `getByPlaceholder(/Email/i)` resolves correctly.

### B. Mock Auth Logic Update (`src/hooks/useAuth.ts`)
- Modify `signInWithEmail` to map both `email.includes('platform@')` AND `email === 'admin@dlmenu.com'` to the `platform_admin` profile (`MOCK_USERS[0]`).

### C. Customer Test Alignment (`tests/e2e/customer-flow.spec.ts`)
- Update the URL navigated during the test from `/s/ca-phe-mai/t/1` to `/s/quan-cafe-mai/t/1` to align with the mock slug defined in `mockData.ts`.

### D. Landing Page Test Update (`tests/e2e/auth-flow.spec.ts` & `tests/e2e/landing-page-ui.spec.ts`)
- Update the assertions to match the current landing page headline:
  - Assert that `h1` contains `"Quản lý quán thông minh"`.
  - Assert that the landing page UI contains the CTA `"Bắt đầu miễn phí"` (or `"Đăng ký quán"`).
  - Assert `h1` contains `"Vận hành."` and `"Siêu tốc."` in the theme contrast audit spec.

---

## 3. Verification Plan
- Run `npx playwright test` and ensure all 25 E2E tests pass successfully under Mock mode.
- Re-run the Next.js dev server on port 3000 to ensure standard developer flow remains intact.
