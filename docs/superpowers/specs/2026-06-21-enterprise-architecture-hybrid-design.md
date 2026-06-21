# Hybrid Enterprise Architecture — Design Spec

> **Date:** 2026-06-21
> **Status:** Draft
> **Approach:** B — Hybrid Enterprise (tRPC + TanStack Query + Zustand + Zod + next-intl)

## Motivation

DiLinhMenu is a multi-tenant restaurant management platform với 3 domain areas (admin, platform-admin, customer-facing). Kiến trúc hiện tại dùng Server Actions + React Context cho data fetching, thiếu validation, thiếu integration tests, và không có caching strategy. Để đạt enterprise-grade scalability, maintainability, và developer experience, cần một kiến trúc phân tách rõ ràng với type safety end-to-end.

## 1. Project Structure (Monorepo)

```
dilinhmenu/
├── packages/
│   ├── types/              # Database types, API contracts, enums
│   │   └── src/
│   │       ├── database.ts (migrate từ src/lib/types/database.ts)
│   │       ├── api.ts      (tRPC router types)
│   │       └── enums.ts
│   │
│   ├── validation/         # Zod schemas (shared server + client)
│   │   └── src/
│   │       ├── menu.ts     (createCategorySchema, updateCategorySchema, createMenuItemSchema...)
│   │       ├── order.ts    (createOrderSchema, updateOrderStatusSchema...)
│   │       ├── shop.ts     (createShopSchema, updateShopSchema...)
│   │       ├── auth.ts     (loginSchema, registerSchema...)
│   │       ├── admin.ts    (platform admin schemas)
│   │       └── common.ts   (shared primitives: pagination, id, slug...)
│   │
│   ├── ui/                 # Design system components
│   │   └── src/
│   │       ├── Button.tsx, Card.tsx, Modal.tsx, Input.tsx...
│   │       └── index.ts
│   │
│   └── config/             # Shared constants, env validation
│       └── src/
│           ├── constants.ts
│           └── env.ts      (Zod-validated env)
│
├── apps/
│   └── web/                # Next.js App (hiện tại là root)
│       ├── src/
│       │   ├── app/        (App Router pages — giữ nguyên)
│       │   ├── components/ (Page-specific components)
│       │   ├── hooks/      (Custom hooks — useShops, useMenu, etc.)
│       │   ├── lib/
│       │   │   ├── supabase/ (server.ts, client.ts, admin.ts — giữ nguyên)
│       │   │   ├── server/   (tRPC init, context, routers/, middleware/)
│       │   │   ├── trpc/     (tRPC client, TRPCProvider)
│       │   │   ├── stores/   (Zustand stores: cart-store, ui-store)
│       │   │   └── i18n/     (next-intl config)
│       │   ├── middleware.ts
│       │   └── providers/    (TRPCProvider, QueryProvider, ThemeProvider)
│       └── tests/
│           ├── e2e/
│           ├── integration/
│           └── unit/
│
├── turbo.json
└── package.json (workspace root)
```

### Migration Principle
**Move + re-export dần dần.** Packages phát triển parallel với code cũ. Không blocking rewrite.

## 2. API Layer — tRPC

### Router Structure

```
apps/web/src/lib/server/
├── trpc.ts              # tRPC init, publicProcedure, protectedProcedure
├── context.ts           # Auth context (user + profile injected mỗi request)
├── routers/
│   ├── _app.ts          # Root router (merge sub-routers)
│   ├── menu.ts          # Menu categories + items
│   ├── order.ts         # Order CRUD + status transitions
│   ├── shop.ts          # Shops CRUD
│   ├── admin.ts         # Platform admin operations
│   └── auth.ts          # Profile + session
└── middleware/
    ├── auth.ts          # Authentication check
    ├── rbac.ts          # Role-based access
    └── audit.ts         # Audit log cho mutations
```

### Context Injection

```typescript
// context.ts — mỗi tRPC request tự động có user + profile
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles')
      .select('id, role, display_name').eq('id', user.id).single();
    profile = data;
  }
  return { user, profile, supabase, req: opts.req };
}
```

### Middleware Chain

| Middleware | Purpose |
|---|---|
| `isAuthenticated` | Reject nếu không có user |
| `hasRole(...roles)` | Kiểm tra role match |
| `ownsShop` | Multi-tenant isolation — shop_owner chỉ thấy shop mình |

### Quan hệ với Server Actions hiện tại

| Loại | Giữ nguyên | Migrate sang tRPC |
|---|---|---|
| Form actions (login, register) | ✅ | — |
| Data queries (getCategories...) | — | ✅ Query |
| Admin mutations (createCategory...) | — | ✅ Mutation |
| Customer mutations (createOrder...) | ✅ | — |

## 3. Validation — Zod Schemas

Tất cả schemas trong `packages/validation`, dùng cho cả tRPC input + client form.

```
packages/validation/src/
├── index.ts
├── menu.ts        (createCategorySchema, updateCategorySchema, createMenuItemSchema...)
├── order.ts       (createOrderSchema, updateOrderStatusSchema...)
├── shop.ts        (createShopSchema, updateShopSchema...)
├── auth.ts        (loginSchema, registerSchema...)
├── admin.ts       (platformAdmin schemas)
└── common.ts      (priceSchema, sortOrderSchema, tagsSchema, paginationSchema...)
```

Types auto-infer từ Zod: `z.infer<typeof createCategorySchema>`

## 4. State Management — TanStack Query + Zustand

### Zustand (Client-only, synchronous)

- `cart-store.ts` — Cart items, localStorage persist
- `ui-store.ts` — Sidebar toggle, selectedShopId, theme preference

### TanStack Query (Server state, auto-cache)

- `useShops()` — staleTime: 30s, gcTime: 5min
- `useCategories(shopId)` — staleTime: 60s
- `useMenuItems(shopId)` — staleTime: 60s
- `useOrders(shopId)` — staleTime: 15s (orders cần realtime hơn)

Mutation hooks auto-invalidate queries: `onSuccess: () => utils.menu.getCategories.invalidate()`

### Migration Path

1. Cài zustand + @tanstack/react-query
2. Tạo cart-store + ui-store (TDD)
3. Wrap app với QueryClientProvider + TRPCProvider
4. Tạo từng useQuery hook thay thế AdminDataContext
5. Xoá AdminDataContext khi migrate 100%

## 5. Auth & ACL — 3-Layer Defense

| Layer | Location | Responsibility |
|---|---|---|
| 1. Middleware | Edge | Route protection, redirect, cached role check |
| 2. tRPC Middleware | Server | Auth + RBAC + ownership check |
| 3. Supabase RLS | Database | Row-level security (last resort) |

### Middleware Optimization
Cache profile role vào request header thay vì query DB mỗi lần.

### tRPC Middleware

```typescript
isAuthenticated          → UNAUTHORIZED nếu không có user
hasRole('shop_owner')    → FORBIDDEN nếu sai role
ownsShop                 → FORBIDDEN nếu không phải chủ (trừ platform_admin)
```

## 6. Testing Strategy — Testing Trophy

### Pyramid

```
E2E (4-5 specs)       ← Login, order flow, admin CRUD, platform-admin
Integration (nhiều)    ← MSW + Vitest: test data flow tRPC → DB → response
Unit (vừa phải)        ← Zustand stores, Zod schemas, utility functions
```

### Tool Stack

| Tool | Usage |
|---|---|
| Vitest | Test runner |
| @testing-library/react | Component tests |
| MSW | Mock tRPC + Supabase |
| Playwright | E2E (giữ nguyên) |

### TDD Gate

Mỗi implementation task:
1. Viết test → FAIL
2. Code tối thiểu → PASS
3. Refactor → vẫn PASS
4. Commit

## 7. I18n — next-intl

Thay thế custom `LanguageContext` bằng `next-intl`.

```
apps/web/
├── messages/vi.json       # Vietnamese (primary)
├── messages/en.json       # English (fallback)
├── i18n/request.ts        # next-intl request config
└── i18n/routing.ts        # Locale routing
```

### Migration
1. Install next-intl, tạo messages files
2. Config i18n routing
3. Migrate component by component: `t('menu.title')`
4. Xoá LanguageContext khi 100%

## Implementation Order

Phased approach — mỗi phase có thể ship độc lập:

| Phase | Scope | Dependencies |
|---|---|---|
| P0 | Monorepo setup + packages/types + packages/validation | — |
| P1 | tRPC foundation (context, router, middleware) + Route Handler | P0 |
| P2 | TanStack Query + Zustand stores (test-first) | P1 |
| P3 | next-intl integration | — |
| P4 | Testing infrastructure (MSW, Vitest) | P0 |
| P5 | Migrate menu module (Server Actions → tRPC) | P1, P2, P4 |
| P6 | Migrate order module | P1, P2, P4 |
| P7 | Auth module optimization | P1 |
| P8 | Xoá AdminDataContext + cleanup | P2, P5, P6 |

## Key Risks

| Risk | Mitigation |
|---|---|
| Monorepo learning curve | Chỉ 4 packages, không overhead Turborepo |
| tRPC + Server Actions dual-running confusion | Clear convention: form → Server Action, data → tRPC |
| Migration kéo dài | Phased approach, mỗi phase ship được độc lập |
| Team nhỏ (1-2 người) | P0-P4 có thể skip nếu cần ship gấp; giữ nguyên Server Actions |
