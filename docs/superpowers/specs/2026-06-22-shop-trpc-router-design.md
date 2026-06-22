# Shop tRPC Router — Design Spec

## Goal
Replace 4 Server Action files (`shop.ts`, `tables.ts`, `analytics.ts`, `orderAdmin.ts`) with a single `shopRouter` in tRPC, then migrate the 5 remaining admin pages (`promotions`, `settings`, `tables`, `analytics`, `orders`) to use React Query via `trpc.shop.*`.

This follows the exact pattern established by `menuRouter` (P5): `shopOwnerProcedure` + `ownsShop` middleware + inline Zod schemas.

## Router Structure

Add `src/lib/server/routers/shop.ts` with namespaced procedures:

```
shopRouter {
  // Promotions CRUD
  promotions.list       — query(shopId) → Promotion[]
  promotions.create     — mutation(input) → Promotion
  promotions.delete     — mutation(id) → { success }
  promotions.toggle     — mutation(id, isActive) → { success }

  // Shop settings
  settings.updateInfo   — mutation(shopId, name, description?, phone?, address?) → { success }
  settings.updateTheme  — mutation(shopId, themeConfig) → { success }

  // Tables CRUD
  tables.list           — query(shopId) → ShopTable[]
  tables.create         — mutation(shopId, shopSlug, tableNumber) → ShopTable
  tables.delete         — mutation(id) → { success }
  tables.toggle         — mutation(id, isActive) → { success }

  // Analytics (read-only)
  analytics.get         — query(shopId, days?) → { kpis, revenueChart, topItems }
}
```

All mutation procedures use `shopOwnerProcedure.use(middleware(ownsShop))`. Read procedures (`list`, `get`) use `shopOwnerProcedure` only (ownsShop checks shopId from input via middleware).

## Validation Schemas

Procedures use inline `z.object()` schemas (matching existing menuRouter style). Add schemas to `@dilinh/validation` only if reused elsewhere.

## Page Migrations

Each page follows the same mechanical pattern (see `admin/menu/page.tsx` for reference):

| Page | Replace | With |
|---|---|---|
| `admin/promotions` | `getPromotions()` → | `trpc.shop.promotions.list.useQuery()` |
|  | `createPromotion()` → | `trpc.shop.promotions.create.useMutation()` + invalidate |
|  | `deletePromotion()` → | `trpc.shop.promotions.delete.useMutation()` + invalidate |
|  | `togglePromotionActive()` → | `trpc.shop.promotions.toggle.useMutation()` + invalidate |
| `admin/settings` | `updateShopInfo()` → | `trpc.shop.settings.updateInfo.useMutation()` + toast |
|  | `updateThemeConfig()` → | `trpc.shop.settings.updateTheme.useMutation()` + toast |
| `admin/tables` | `getTables()` → | `trpc.shop.tables.list.useQuery()` |
|  | `createTable()` → | `trpc.shop.tables.create.useMutation()` + invalidate |
|  | `deleteTable()` → | `trpc.shop.tables.delete.useMutation()` + invalidate |
|  | `toggleTableActive()` → | `trpc.shop.tables.toggle.useMutation()` + invalidate |
| `admin/analytics` | `getShopAnalytics()` → | `trpc.shop.analytics.get.useQuery()` |
| `admin/orders` | `updateOrderStatus()` → | Keep using `orderAdmin.ts` (no tRPC router change needed — orderRouter already has `updateStatus`) |

### Removal Candidates (after migration)
- `src/lib/actions/shop.ts` — **keep** only `getAdminShops` + `getAdminShopById` (used by platform admin, no tRPC replacement)
- `src/lib/actions/tables.ts` — **delete** entirely
- `src/lib/actions/analytics.ts` — **delete** entirely

## _app.ts Integration

```ts
import { shopRouter } from './shop';

export const appRouter = router({
  ...
  shop: shopRouter,
});
```

## RBAC

- All procedures require `shop_owner` or `platform_admin` role
- `ownsShop` middleware ensures multi-tenant isolation
- `promotions.list`, `tables.list`, `analytics.get` are read-only but still require ownership (shop owner can only see their own data)

## Testing

Existing integration tests patterns (`menu.test.ts`, `menu-rbac.test.ts`) serve as templates. New tests to add:
1. `shop-promotions.test.ts` — CRUD + RBAC
2. `shop-tables.test.ts` — CRUD + RBAC
3. `shop-analytics.test.ts` — read + RBAC

## Non-Goals

- No changes to `orderAdmin.ts` or `customerOrder.ts` Server Actions
- No changes to auth, file upload, or platform admin flows
- No UI redesign — only data layer change
