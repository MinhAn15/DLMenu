# DiLinhMenu — Session Progress Log

> **Purpose:** This file is the single source of truth for multi-session development. Any AI IDE (GitHub Copilot, Cursor, Claude, Gemini, etc.) can read this file to understand the project state and resume work seamlessly.
>
> **Format:** Machine-readable sections with explicit status markers. Append new sessions chronologically.

---

## [2026-06-22] Session #8 — TypeScript Compilation Fix, Vitest & Playwright E2E Validation (Antigravity)

### Summary
Antigravity khắc phục triệt để lỗi biên dịch TypeScript `implicit any` đối với các trường kiểu Json của Supabase trên giao diện Admin, xác minh thành công toàn bộ 51 bài test Vitest tích hợp và 25 bài test E2E Playwright trên môi trường local (100% passed).

### Completed this session

| Feature | Details | Status |
|---|---|---|
| TypeScript Type Casting | Ép kiểu explicit `(item.tags as string[])` kết hợp type guard `Array.isArray` tại `platform-admin/menu` để vượt qua TypeScript strict mode. | ✅ |
| Static Build Check | Chạy `npm run build` biên dịch dự án thành công hoàn toàn không có bất kỳ lỗi nào. | ✅ |
| Vitest integration tests | Chạy thành công 51/51 integration tests. | ✅ |
| Playwright E2E tests | Chạy thành công 25/25 E2E tests. | ✅ |

### Git State
- Branch: `main`
- Modified files: `src/app/platform-admin/menu/page.tsx`, `docs/gotchas_knowledge_base.md`, `task.md`, `PROGRESS.md`.

### Key Decisions
- Sử dụng kết hợp `Array.isArray(item.tags)` làm type guard runtime và ép kiểu tường minh `(item.tags as string[])` ở tầng compile-time để đảm bảo tính an toàn dữ liệu và vượt qua compiler check của TypeScript.

### Gotchas Discovered
- Gotcha 5.12: Cách cast kiểu explicit cho trường Json Array khi dùng tRPC để tránh lỗi implicit any trong TypeScript strict mode.

### Next Steps
1. Chuyển đổi logic đặt hàng phía khách hàng (`customerOrder.ts` Server Action) sang tRPC.
2. Cài đặt quy trình kiểm thử tự động trên GitHub Actions (CI/CD).

---

## [2026-06-22] Session #7 — Supabase DDL Fix, E2E Test & Server Action Optimization (Antigravity)

### Summary
Antigravity resolved the Supabase migration error (`shop_tables` table constraints) and stabilized 100% of the E2E tests (25/25 passed). Sửa lỗi strict-mode và locale của browser trong Playwright. Khắc phục lỗi logic Server Action `createOrder` thiếu trường `subtotal` khi chèn chi tiết đơn hàng `order_items`.

### Completed this session

| Feature | Details | Status |
|---|---|---|
| Playwright E2E i18n Fix | Added `locale: 'vi-VN'` in `playwright.config.ts` to sync Chromium with local Vietnamese tests. | ✅ |
| Platform Admin Sidebar Fix | Scoped selectors `Bảng điều khiển`, `Tất cả quán`, `Kho Menu` inside `aside` element to bypass Playwright strict-mode violations. | ✅ |
| Server Action order_items Fix | Calculated and added `subtotal` to `order_items` insert payload in `createOrder` (`customerOrder.ts`) to fix NOT NULL constraint failure. | ✅ |
| Shop Table short_code Migration | Successfully resolved migration blocks and configured `short_code` field generation with automated validation. | ✅ |

### Git State
- Branch: `main`
- Modified files: `playwright.config.ts`, `tests/e2e/platform-admin-dashboard.spec.ts`, `src/lib/actions/customerOrder.ts`, `tests/setup/seed.ts`, `src/app/platform-admin/tables/page.tsx`, `src/app/platform-admin/menu/page.tsx`.

### Next Steps
1. Create tRPC routers for promotions, settings, tables, analytics according to `docs/superpowers/specs/2026-06-22-shop-trpc-router-design.md`.
2. Migrate remaining admin pages to tRPC.

---

## [2026-06-22] Session #6 — Admin Menu Migration to tRPC + Server Action Cleanup (OpenCode)

### Summary
OpenCode migrated `admin/menu/page.tsx` from Server Actions to tRPC (`trpc.menu.*` procedures with `useQuery`/`useMutation`/`utils.invalidate`), deleted 5 orphaned Server Action files (`menu.ts`, `order.ts`, `adminOrders.ts`, `adminTables.ts`, `adminUsers.ts`) that had tRPC replacements. Fixed `orderAdmin.ts` by inlining the `completeOrder` function that depended on the deleted `order.ts`. **68 tests pass, build OK.** Promotions + Settings + Tables + Analytics pages still use Server Actions (need tRPC routers first).

### Committed this session

| Feature | Details | Tests | Commit |
|---|---|---|---|
| admin/menu → tRPC | `trpc.menu.getCategories`/`getMenuItems` useQuery + 6 mutations with `utils.invalidate`. Removed useEffect/fetchData pattern. | — | This commit |
| Orphaned SA cleanup | Deleted `menu.ts`, `order.ts`, `adminOrders.ts`, `adminTables.ts`, `adminUsers.ts` | — | This commit |
| orderAdmin.ts fix | Inlined `completeOrder()` function to remove dependency on deleted `order.ts` | — | This commit |

### Still using Server Actions (needs tRPC routers)

| Page | SA File | Needed |
|---|---|---|
| `admin/promotions/page.tsx` | `shop.ts` | `trpc.shop.promotions` router |
| `admin/settings/page.tsx` | `shop.ts` | `trpc.shop.settings` router |
| `admin/tables/page.tsx` | `tables.ts` | `trpc.shop.tables` router |
| `admin/analytics/page.tsx` | `analytics.ts` | `trpc.shop.analytics` router |
| `admin/orders/page.tsx`, `admin/kds/page.tsx` | `orderAdmin.ts` | `trpc.order.*` (already exists, page not migrated) |
| `s/[slug]/t/[table]/page.tsx` | `customerOrder.ts` | Customer-facing order creation |

### Gotchas Discovered

1. **Server Action cleanup needs import graph check**: When deleting Server Actions files, check inter-file dependencies first. `orderAdmin.ts` imported `completeOrder` from `order.ts` — deleting `order.ts` broke the build. Fix: inline the function into `orderAdmin.ts`.

### Git State
- Branch: `main`
- This commit: admin/menu tRPC migration + SA cleanup

### Next Steps
1. **Create tRPC routers** for promotions, settings, tables, analytics (shop owner scope)
2. **Migrate remaining admin pages** → tRPC
3. **Move customer order** (currently uses `customerOrder.ts` SA) → tRPC
4. **GitHub Actions CI/CD**

---

## [2026-06-21] Session #2 — Session Management System + Gotchas KB

### Summary
Created PROGRESS.md multi-session log system with `/end-session`, `/resume-session`, `/progress` workflows in AGENTS.md. Added 4 new technical gotchas to knowledge base from Session #1 discoveries. Committed all Session #1 work with comprehensive documentation.

### Completed

| Feature | Details | Status |
|---|---|---|
| PROGRESS.md log system | Structured session entries: Completed/In Progress/Pending/Git State/Next Steps | ✅ |
| AGENTS.md workflows | `/end-session`, `/resume-session`, `/progress` with step-by-step instructions | ✅ |
| Gotchas knowledge base | +4 new entries: react-hot-toast E2E, RLS text=uuid, fixed+relative, useAdminShop async | ✅ |
| Cross-IDE compatibility | Format designed for Cursor, Copilot, Claude, Gemini, any AI IDE | ✅ |

### In Progress

- PlatformSidebar segmented IA (carried over from Session #1)

### Pending

| Priority | Feature | Spec Reference |
|---|---|---|
| Medium | Phase B: Dashboard redesign (action inbox replaces stat cards) | superadmin-ui-redesign.md §4 |
| Medium | PlatformSidebar shop segments with live counters | superadmin-ui-redesign.md §3.2 |
| Low | GitHub Actions CI/CD for E2E tests | workflow_audit.md |
| Low | Server Actions standardization | workflow_audit.md |

### Files Created

```
PROGRESS.md                              — Multi-session progress log system
```

### Files Modified

```
AGENTS.md                                — Added /end-session, /resume-session, /progress workflows
docs/gotchas_knowledge_base.md           — Appended §4 AI/NVIDIA NIM gotchas (4 entries)
```

### Key Decisions

1. **PROGRESS.md as single source of truth** — One file per project, machine-readable sections, newest-first ordering
2. **AGENTS.md for workflow definitions** — AI reads AGENTS.md on session start, finds `/end-session` and `/resume-session` instructions
3. **Gotchas centralized in `docs/gotchas_knowledge_base.md`** — Session discoveries auto-appended during `/end-session`
4. **Template at bottom of PROGRESS.md** — New sessions can copy-paste the template structure

### Gotchas Discovered

- None new in this session (session management itself is not a technical gotcha)

### Git State (as of 2026-06-21)
- Branch: `main` (ahead of `origin/main`)
- Last 3 commits:
  1. `679c791` chore: update session progress log + append 4 new gotchas to knowledge base
  2. `65d30a5` feat: add PROGRESS.md session log + /end-session /resume-session workflows
  3. `beaac46` feat(platform): Phase A — Tenant Workspace route with 5 tabs

### Next Steps
1. Phase B: Replace `/platform-admin` dashboard stat cards with action inbox
2. Update PlatformSidebar with segmented section per spec §3.2
3. GitHub Actions CI/CD workflow

---

## [2026-06-21] Session #1 — AI Image Generation + Landing Page + Platform Workspace

### Summary
Implemented AI Image Generation feature using NVIDIA NIM Qwen-image API, completed landing page UI refactoring, and built Phase A of Super Admin UI Redesign (Tenant Workspace route).

### Completed

| Feature | Details | Status |
|---|---|---|
| AI Image Generation | Server Action + 6 presets + Dropzone + ImageGenerator + Supabase Storage | ✅ Tested (7 unit + 2 E2E) |
| Landing Page UI Redesign | Removed all inline styles, CSS module adaptive theme | ✅ 1 E2E passing |
| Platform Workspace (Phase A) | `/platform-admin/shops/[shopId]` with 5 tabs | ✅ 2 E2E passing |
| Supabase Migration | `008_create_menu_images_bucket.sql` with RLS policies | ✅ Ran successfully |
| NVIDIA API Key | Configured in `.env.local` | ✅ |

### In Progress

- PlatformSidebar segmented IA (spec §3.2) — partially done, still uses old flat links

### Pending

| Priority | Feature | Spec Reference |
|---|---|---|
| Medium | Phase B: Dashboard redesign (action inbox replaces stat cards) | superadmin-ui-redesign.md §4 |
| Medium | PlatformSidebar shop segments with live counters | superadmin-ui-redesign.md §3.2 |
| Low | GitHub Actions CI/CD for E2E tests | workflow_audit.md |
| Low | Server Actions standardization | workflow_audit.md |

### Files Created

```
src/lib/ai/types.ts
src/lib/ai/presets.ts
src/lib/ai/generate-image.ts
src/components/ai/Dropzone.tsx
src/components/ai/Dropzone.module.css
src/components/ai/PresetCard.tsx
src/components/ai/PresetCard.module.css
src/components/ai/ImageGenerator.tsx
src/components/ai/ImageGenerator.module.css
supabase/migrations/008_create_menu_images_bucket.sql
tests/e2e/ai-image-generation.spec.ts
tests/e2e/platform-admin-workspace.spec.ts
__tests__/lib/ai-presets.test.ts
src/app/platform-admin/shops/[shopId]/page.tsx
```

### Files Modified

```
src/app/admin/menu/page.tsx             — Integrated ImageGenerator
src/components/admin/Sidebar.tsx         — Fixed sticky positioning (fixed → md:sticky)
src/components/ui/EmptyState.tsx         — Added pointer-events-none to image container
src/app/page.tsx                         — Removed all inline styles (CSS modules)
src/app/page.module.css                  — Added featIconColor, footer, CTA classes
src/app/platform-admin/shops/page.tsx    — Added workspace link button
tests/e2e/admin-flow.spec.ts             — Use evaluate() clicks to bypass toast overlay
docs/superpowers/specs/2026-06-20-ai-image-generation-design.md — Status updated
```

### Key Decisions

1. **Server Action for AI** — Not Edge Function; simpler for synchronous NVIDIA API
2. **6 style presets** — Aligned with `docs/ai_asset_prompt_library.md`
3. **`<details>` fallback** — Manual URL input preserved below ImageGenerator
4. **`useRef` for temp item ID** — Instead of `Date.now()` in render
5. **Sidebar `fixed md:sticky`** — Fixed the Tailwind `fixed` vs `md:relative` conflict
6. **E2E clicks via `page.evaluate()`** — Bypasses react-hot-toast z:9999 overlay

### Gotchas Discovered

1. **react-hot-toast blocks Playwright clicks** — Toast container z:9999 with full viewport coverage. Use `page.evaluate(() => el.click())` or wait 4s for auto-dismiss.
2. **EmptyState `<Image fill>` parent needs `relative`** — Next.js Image fill without relative parent expands to viewport, intercepting clicks.
3. **Tailwind `fixed` + `md:relative` don't combine** — Both are one-layer utilities; `fixed` wins. Use `fixed md:sticky` instead.
4. **Supabase RLS `text = uuid` error** — `storage.foldername(name)` returns text; must cast `::uuid` when comparing with UUID columns.
5. **`useAdminShop` async fetch** — Page renders with `shop = null` initially; wait 3s+ for data before interacting in E2E.
6. **Turbopack panic on Windows** — Intermittent `FATAL: Failed to write app endpoint /_not-found/page`; clear `.next` cache.

### Git State (as of 2026-06-21)
- Branch: `main` (ahead of `origin/main` by several commits)
- Last 3 commits:
  1. `feat(platform): Phase A — Tenant Workspace route with 5 tabs`
  2. `feat(landing): remove inline styles, enhance CSS adaptive theme + glassmorphism`
  3. `fix: Add DROP POLICY IF EXISTS for idempotent migration`

### Environment
- Next.js 16.2.9 (App Router, Turbopack)
- Node.js (Windows)
- Supabase (PostgreSQL + Storage)
- Playwright E2E (workers: 1, port: 3001)
- NVIDIA NIM API (Qwen-image)

### Next Steps
1. Phase B: Replace `/platform-admin` dashboard stat cards with action inbox
2. Update PlatformSidebar with segmented section per spec §3.2
3. GitHub Actions CI/CD workflow
4. Review `docs/planning/specs/2026-06-19-superadmin-ui-redesign.md` open questions (§13)

---

## Session Template (for future sessions)

```markdown
## [YYYY-MM-DD] Session #N — Session Title

### Summary
Brief 1-2 sentence description of what was accomplished.

### Completed
| Feature | Details | Status |
|---|---|---|
| ... | ... | ✅ |

### In Progress
- ...

### Pending
| Priority | Feature | Reference |
|---|---|---|
| ... | ... | ... |

### Files Created
- ...

### Files Modified
- ...

### Key Decisions
- ...

### Gotchas Discovered
- ...

### Git State
- Branch: ...
- Last commit: ...

### Next Steps
1. ...
```