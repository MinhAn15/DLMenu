# Hybrid Enterprise Architecture — Design Spec

> **Date:** 2026-06-21
> **Status:** Final Draft
> **Approach:** B — Hybrid Enterprise (tRPC + TanStack Query + Zustand + Zod + next-intl)

## Motivation

DiLinhMenu is a multi-tenant restaurant management platform với 3 domain areas (admin, platform-admin, customer-facing). Kiến trúc hiện tại dùng Server Actions + React Context cho data fetching, thiếu validation, thiếu integration tests, và không có caching strategy. Để đạt enterprise-grade scalability, maintainability, và developer experience, cần một kiến trúc phân tách rõ ràng với type safety end-to-end.

## 1. Project Structure (Monorepo nhẹ)

```
dilinhmenu/
├── packages/
│   ├── types/              # Database types, API contracts, enums
│   │   ├── package.json    → name: "@dilinh/types"
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── database.ts (migrate từ src/lib/types/database.ts)
│   │       ├── api.ts      (tRPC router types)
│   │       └── enums.ts
│   │
│   └── validation/         # Zod schemas (shared server + client)
│       ├── package.json    → name: "@dilinh/validation" (depends on @dilinh/types)
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── menu.ts     (createCategorySchema, updateCategorySchema, createMenuItemSchema...)
│           ├── order.ts    (createOrderSchema, updateOrderStatusSchema...)
│           ├── shop.ts     (createShopSchema, updateShopSchema...)
│           ├── auth.ts     (loginSchema, registerSchema...)
│           ├── admin.ts    (platform admin schemas)
│           └── common.ts   (shared primitives: priceSchema, sortOrderSchema, paginationSchema...)
│
├── apps/
│   └── web/                # Next.js App
│       ├── src/
│       │   ├── app/        (App Router pages — giữ nguyên)
│       │   ├── components/ (Page-specific components)
│       │   ├── hooks/      (Custom hooks — useShops, useMenu, useOrders...)
│       │   ├── lib/
│       │   │   ├── supabase/ (server.ts, client.ts, admin.ts — giữ nguyên)
│       │   │   ├── server/   (tRPC init, context, routers/, middleware/)
│       │   │   ├── trpc/     (tRPC client, TRPCProvider)
│       │   │   ├── stores/   (Zustand stores: cart-store, ui-store)
│       │   │   └── i18n/     (next-intl config)
│       │   ├── middleware.ts
│       │   └── providers/    (TRPCProvider, QueryProvider, ThemeProvider)
│       ├── tests/
│       │   ├── e2e/
│       │   ├── integration/
│       │   └── unit/
│       └── next.config.ts    (thêm transpilePackages: ["@dilinh/types", "@dilinh/validation"])
│
├── package.json            → workspaces: ["packages/*", "apps/*"]
└── .prettierrc, tsconfig.base.json, etc.
```

**Quyết định:**
- ✅ **Giữ** `packages/types` + `packages/validation` — 2 packages thiết yếu, npm workspaces (không Turborepo)
- ❌ **Bỏ** `packages/ui` + `packages/config` — YAGNI cho 1 app
- **Migration:** Move + re-export dần dần, không rewrite

## 2. API Layer — tRPC

### Router Structure

```
apps/web/src/lib/server/
├── trpc.ts              # tRPC init + publicProcedure + protectedProcedure
├── context.ts           # Context (tạo supabase client, KHÔNG gọi auth)
├── routers/
│   ├── _app.ts          # Root router (merge sub-routers)
│   ├── menu.ts          # Menu categories + items
│   ├── order.ts         # Order CRUD + status transitions
│   ├── shop.ts          # Shops CRUD
│   ├── admin.ts         # Platform admin operations
│   └── auth.ts          # Profile + session
└── middleware/
    ├── auth.ts          # Authentication check (isAuthenticated)
    ├── rbac.ts          # Role-based access (hasRole)
    └── audit.ts         # Audit log cho mutations
```

### Public vs Protected — Performance

```typescript
// context.ts — KHÔNG gọi getUser(), chỉ tạo supabase client
export async function createTRPCContext() {
  return { supabase: await createServerSupabaseClient() };
}

// trpc.ts — 2 base procedures
export const publicProcedure = procedure;
export const protectedProcedure = procedure.use(isAuthenticated);

// middleware/auth.ts — CHỈ protected procedures mới gọi getUser()
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  const { data: { user } } = await ctx.supabase.auth.getUser();
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user } });
});
```

**Nguyên tắc:**
- Customer-facing endpoints → `publicProcedure` (no auth overhead)
- Admin/platform-admin endpoints → `protectedProcedure` (có auth middleware)
- Từng procedure opt-in vào auth check, không phải tất cả

### Middleware Chain

| Middleware | Purpose |
|---|---|
| `isAuthenticated` | Inject user vào context, reject nếu chưa login |
| `hasRole(...roles)` | Kiểm tra role |
| `ownsShop` | Multi-tenant isolation — shop_owner chỉ thấy shop mình, platform_admin bypass |

### Server Actions vs tRPC — Boundary Rule

| Loại | Giữ Server Action | Chuyển tRPC |
|---|---|---|
| Auth (Supabase SDK login/register/logout) | ✅ | — |
| File uploads (FormData, AI image gen) | ✅ | — |
| Data queries (getCategories, getOrders...) | — | ✅ Query |
| Data mutations (createCategory, updateOrder...) | — | ✅ Mutation |
| Platform admin operations | — | ✅ Mutation |

**Rule đơn giản:** *Auth + file upload → Server Action. Mọi thứ còn lại → tRPC.*

## 3. Validation — Zod Schemas

Tất cả schemas trong `packages/validation`, dùng cho tRPC input validation + client form.

### Error Handling — tRPC Built-in Codes

Không tạo custom error enum. Dùng tRPC built-in codes:

```typescript
BAD_REQUEST        (400) — Validation error từ Zod
UNAUTHORIZED       (401) — Chưa đăng nhập
FORBIDDEN          (403) — Sai role
NOT_FOUND          (404) — Resource không tồn tại
CONFLICT           (409) — Duplicate slug/key
TOO_MANY_REQUESTS  (429) — Rate limit
INTERNAL_SERVER_ERROR (500)
```

```typescript
// apps/web/src/lib/server/trpc.ts
export const errorFormatter = ({ shape, error }) => ({
  ...shape,
  data: {
    ...shape.data,
    validationErrors: error.cause instanceof ZodError ? error.cause.flatten() : undefined,
  },
});
```

## 4. State Management — TanStack Query + Zustand

### Zustand (Client-only, synchronous)

- `cart-store.ts` — Cart items, localStorage persist (test-first)
- `ui-store.ts` — Sidebar toggle, selectedShopId, theme (test-first)

### TanStack Query (Server state, auto-cache)

- `useShops()` — staleTime: 30s, gcTime: 5min
- `useCategories(shopId)` — staleTime: 60s
- `useMenuItems(shopId)` — staleTime: 60s
- `useOrders(shopId)` — staleTime: 15s

Mutations auto-invalidate: `onSuccess: () => utils.menu.getCategories.invalidate()`

### Realtime Order Pattern — Hybrid

```typescript
function useOrders(shopId: string) {
  const queryClient = useQueryClient();
  const query = trpc.order.list.useQuery({ shopId });

  // Mutation: optimistic update
  const mutation = trpc.order.update.useMutation({
    onMutate: async (newData) => {
      await query.cancel();
      const prev = queryClient.getQueryData(['order.list', { shopId }]);
      queryClient.setQueryData(['order.list', { shopId }], (old) => optimisticMerge(old, newData));
      return { prev };
    },
    onError: (err, vars, ctx) => { if (ctx?.prev) queryClient.setQueryData(['order.list', { shopId }], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['order.list', { shopId }] }),
  });

  // Subscription: chỉ merge changes từ OTHER clients
  useEffect(() => {
    let lastSync = Date.now();
    const sub = supabase.channel(`orders:${shopId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          if (payload.commit_timestamp > lastSync) {
            queryClient.setQueryData(['order.list', { shopId }], (old) => mergeOrder(old, payload.new));
          }
        })
      .subscribe();
    return () => sub.unsubscribe();
  }, [shopId]);

  return { ...query, mutation };
}
```

### Migration Path

1. Cài zustand + @tanstack/react-query
2. Tạo cart-store + ui-store (TDD)
3. Wrap app với QueryClientProvider + TRPCProvider
4. Tạo từng useQuery hook thay thế AdminDataContext
5. Xoá AdminDataContext khi migrate 100%

## 5. Auth & ACL — 3-Layer Defense

| Layer | Location | Responsibility |
|---|---|---|
| 1. Middleware | Edge | Route protection, redirect (giữ nguyên, thêm cache) |
| 2. tRPC Middleware | Server | Auth + RBAC + ownership check |
| 3. Supabase RLS | Database | Row-level security (last resort) |

### Middleware Optimization
Cache profile role vào request header thay vì query DB mỗi lần cho /platform-admin routes.

## 6. Testing Strategy — Testing Trophy (TDD-centric)

### Pyramid

```
E2E (4-5 specs)       ← Login, order flow, admin CRUD, platform-admin
Integration (nhiều)    ← tRPC procedures (in-process), Zod schemas, middleware chain
Unit (vừa phải)        ← Zustand stores, utility functions
```

### Tool Stack

| Tool | Usage |
|---|---|
| Vitest | Test runner |
| @testing-library/react | Component tests |
| Playwright | E2E (giữ nguyên) |

### Integration Tests — createCaller() + vi.mock

Thay vì MSW (HTTP stack), dùng tRPC `createCaller()` in-process + `vi.mock('@supabase/ssr')`:

```typescript
// tests/integration/helpers.ts
import { vi } from 'vitest';

// Mock supabase module ở global level
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => createMockSupabase(),
}));

function createMockSupabase() {
  return {
    from: vi.fn(() => queryBuilder),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) },
  };
}

// tests/integration/menu.test.ts
import { createTRPCContext } from '@/lib/server/context';
import { menuRouter } from '@/lib/server/routers/menu';

test('createCategory returns category with correct name', async () => {
  const ctx = await createTRPCContext({} as any);
  const caller = menuRouter.createCaller(ctx);

  const result = await caller.createCategory({ shopId: 'x', name: 'Khai vị' });

  expect(result.name).toBe('Khai vị');
});
```

### TDD Gate — Mỗi implementation task

1. Viết test → **FAIL** (chạy xác nhận đỏ)
2. Code tối thiểu → **PASS** (chạy xác nhận xanh)
3. Refactor → vẫn **PASS**
4. Commit

## 7. I18n — next-intl

Thay thế custom `LanguageContext` bằng `next-intl`. Giữ nguyên cấu trúc từ spec cũ.

### Migration
1. Install next-intl, tạo messages files (`vi.json`, `en.json`)
2. Config i18n routing
3. Migrate component by component: `t('menu.title')`
4. Xoá LanguageContext khi 100%

## Implementation Order

| Phase | Scope | Dependencies |
|---|---|---|
| P0 | npm workspaces + packages/types + packages/validation | — |
| P1 | tRPC foundation (init, context, middleware, Route Handler) | P0 |
| P2 | TanStack Query + Zustand stores (test-first) | P1 |
| P3 | next-intl integration | — (độc lập) |
| P4 | Testing infrastructure (Vitest, createCaller helpers) | P0 |
| P5 | Migrate menu module (Server Actions → tRPC) | P1, P2, P4 |
| P6 | Migrate order module (có realtime pattern) | P1, P2, P4 |
| P7 | Auth module optimization | P1 |
| P8 | Xoá AdminDataContext + cleanup | P2, P5, P6 |

## Key Risks

| Risk | Mitigation |
|---|---|
| tRPC + Server Actions dual-running | Clear rule: Auth + upload → SA. Data → tRPC. |
| Integration test setup phức tạp | `createCaller()` + `vi.mock()` — không MSW, đơn giản |
| Migration kéo dài | Phased, mỗi phase ship độc lập |
| Realtime race condition | Optimistic update + subscription dedup (commit_timestamp) |
| Missing error standardization | tRPC built-in codes + Zod error formatter |
