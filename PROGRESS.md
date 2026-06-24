# DiLinhMenu — Session Progress Log

> **Purpose:** This file is the single source of truth for multi-session development. Any AI IDE (GitHub Copilot, Cursor, Claude, Gemini, etc.) can read this file to understand the project state and resume work seamlessly.
>
> **Format:** Machine-readable sections with explicit status markers. Append new sessions chronologically.

---

## [2026-06-22] Session #7 — Shop tRPC Router + All Admin Pages Migrated (OpenCode)

### Summary
Moved all remaining Server Actions to tRPC: created `shopRouter` (promotions, settings, tables, analytics — 13 procedures) following P5 `menuRouter` pattern, migrated all 6 admin pages to use React Query hooks, deleted all 4 orphaned SA files. **73 tests pass, build OK.**

### Committed this session

| Feature | Details | Tests | Commit |
|---|---|---|---|
| Validation schemas | `createPromotionSchema`, `togglePromotionSchema`, `toggleTableSchema` | — | `ac34219` |
| shopRouter | 13 procedures: promotions CRUD, settings updateInfo/updateTheme, tables CRUD, analytics get | +5 `shop.test.ts` | `aff3642` |
| admin/promotions → tRPC | `trpc.shop.promotions.list/create/delete/toggle` | — | `cb7d528` |
| admin/settings → tRPC | `trpc.shop.settings.updateInfo/updateTheme` | — | `9789c15` |
| admin/tables → tRPC | `trpc.shop.tables.list/create/delete/toggle` | — | `9789c15` |
| admin/analytics → tRPC | `trpc.shop.analytics.get` | — | `9789c15` |
| admin/orders + kds → tRPC | `trpc.order.updateStatus` | — | `9789c15` |
| SA cleanup | Deleted `shop.ts`, `tables.ts`, `analytics.ts`, `orderAdmin.ts` | — | `9789c15` |

### Server Actions Remaining
- `src/lib/actions/customerOrder.ts` — customer-facing order creation (not in scope)
- `auth.ts` — auth operations (not in scope)
- `customer.ts` — customer-related (not in scope)

### Git State
- Branch: `main`
- Latest: `9789c15` — refactor: migrate admin/settings, tables, analytics, orders, kds to tRPC

---

## [2026-06-24] Session #8 — Security Fixes + Full SA Cleanup (OpenCode)

### Summary
Fixed 2 critical security vulnerabilities and completed full Server Action migration. Removed all SA files from `src/lib/actions/`. Added `adminRouter.createShop` for shop onboarding. **73 tests pass, build OK, zero TS errors.**

### Committed this session

| Feature | Details | Tests | Commit |
|---|---|---|---|
| Security fix: customerOrder.ts | Migrated `createCustomerOrder` to `orderRouter.create` (publicProcedure). Removed `SUPABASE_SERVICE_ROLE_KEY` from client-side code. | — | `156ac0f` |
| Security fix: middleware.ts HMAC | Removed fallback to public `SUPABASE_ANON_KEY`. Now throws if `SUPABASE_SERVICE_ROLE_KEY` is unset. Fail-fast = no auth bypass. | — | `156ac0f` |
| adminRouter.createShop | Added `adminRouter.createShop` procedure + migrated `OnboardingPrompt.tsx` to `trpc.admin.createShop` | — | `156ac0f` |
| SA cleanup | Deleted all files in `src/lib/actions/`: `shop.ts`, `tables.ts`, `analytics.ts`, `orderAdmin.ts`, `customerOrder.ts`, `shopAdmin.ts` | — | `156ac0f` |

### Server Actions Remaining
- **NONE** — `src/lib/actions/` is now empty (all SA migrated or deleted)
- Auth operations (Supabase SDK) remain in `src/lib/supabase/` — by design per rule §5.3

### Git State
- Branch: `main`
- Latest: `156ac0f` — security: fix 2 critical vulnerabilities

### Next Steps
- ESLint cleanup (81 errors + 43 warnings — `no-explicit-any`, `set-state-in-effect`, `no-unescaped-entities`)
- i18n deduplication (Admin/Admin + Customer/Customer sections in messages vi/en)
- GitHub Actions CI/CD pipeline (`workflow_audit.md` reference)
- E2E test expansion
