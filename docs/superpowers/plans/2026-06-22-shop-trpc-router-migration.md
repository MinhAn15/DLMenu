# Shop tRPC Router + Admin Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Replace 4 Server Action files (`shop.ts`, `tables.ts`, `analytics.ts`, `orderAdmin.ts`) with a `shopRouter` + existing `orderRouter.updateStatus`, then migrate 6 admin pages. Keep only `getAdminShops`/`getAdminShopById` in `shop.ts`.

**Architecture:** New `src/lib/server/routers/shop.ts` with namespaced procedures (promotions, settings, tables, analytics). `shopOwnerProcedure` + `ownsShop` middleware for all mutations. Follows P5 `menuRouter` pattern exactly.

**Tech Stack:** tRPC v11.18, Zod, Supabase, React Query via `trpc.*` hooks

---

### Task 1: Add validation schemas for promotions and tables

**Files:**
- Create: `packages/validation/src/promotion.ts`
- Create: `packages/validation/src/table.ts`
- Modify: `packages/validation/src/index.ts`

- [ ] **Step 1: Create `packages/validation/src/promotion.ts`**

```ts
import { z } from 'zod';

export const createPromotionSchema = z.object({
  shopId: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(['flash_sale', 'discount', 'bogo']),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  max_uses: z.number().int().positive().optional(),
});

export const togglePromotionSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});
```

- [ ] **Step 2: Create `packages/validation/src/table.ts`**

```ts
import { z } from 'zod';

export const toggleTableSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});
```

- [ ] **Step 3: Modify `packages/validation/src/index.ts`**

Add exports:
```ts
export * from './promotion';
export * from './table';
```

- [ ] **Step 4: Commit**

```bash
git add packages/validation/src/promotion.ts packages/validation/src/table.ts packages/validation/src/index.ts
git commit -m "feat(validation): add promotion and table schemas"
```

---

### Task 2: Create shopRouter

**Files:**
- Create: `src/lib/server/routers/shop.ts`

- [ ] **Step 1: Create `src/lib/server/routers/shop.ts`**

```ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, shopOwnerProcedure, middleware } from '../trpc';
import { ownsShop } from '../middleware/rbac';
import { createPromotionSchema, togglePromotionSchema, toggleTableSchema } from '@dilinh/validation';

function generateShortCode(shopSlug: string, tableNum: number): string {
  const prefix = shopSlug.split('-').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3);
  return `${prefix}-${String(tableNum).padStart(2, '0')}`;
}

export const shopRouter = router({
  // ========== PROMOTIONS ==========
  promotions: router({
    list: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('promotions')
          .select('*')
          .eq('shop_id', input.shopId)
          .order('created_at', { ascending: false });
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    create: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(createPromotionSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('promotions')
          .insert({
            shop_id: input.shopId,
            name: input.name,
            description: input.description ?? null,
            type: input.type,
            discount_percent: input.discount_percent ?? null,
            discount_amount: input.discount_amount ?? null,
            starts_at: input.starts_at,
            ends_at: input.ends_at,
            max_uses: input.max_uses ?? null,
          })
          .select()
          .single();
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    delete: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('promotions')
          .delete()
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    toggle: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(togglePromotionSchema)
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('promotions')
          .update({ is_active: input.isActive })
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== SETTINGS ==========
  settings: router({
    updateInfo: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({
        shopId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().max(500).nullable().optional(),
        phone: z.string().max(20).optional(),
        address: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updates: Record<string, any> = { name: input.name, updated_at: new Date().toISOString() };
        if (input.description !== undefined) updates.description = input.description;
        if (input.phone !== undefined) updates.phone = input.phone;
        if (input.address !== undefined) updates.address = input.address;
        const { error } = await ctx.supabase
          .from('shops')
          .update(updates)
          .eq('id', input.shopId);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    updateTheme: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({
        shopId: z.string(),
        primaryColor: z.string(),
        font: z.string().optional(),
        bankId: z.string().optional(),
        accountNo: z.string().optional(),
        accountName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bankInfo = input.bankId && input.accountNo
          ? { bank_id: input.bankId, account_no: input.accountNo, account_name: input.accountName }
          : undefined;
        const themeConfig: any = { primary_color: input.primaryColor, font: input.font || 'Inter' };
        if (bankInfo) themeConfig.bank_info = bankInfo;
        const { error } = await ctx.supabase
          .from('shops')
          .update({ theme_config: themeConfig, updated_at: new Date().toISOString() })
          .eq('id', input.shopId);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== TABLES ==========
  tables: router({
    list: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('shop_tables')
          .select('*')
          .eq('shop_id', input.shopId)
          .order('table_number');
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    create: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string(), shopSlug: z.string(), tableNumber: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const shortCode = generateShortCode(input.shopSlug, input.tableNumber);
        const { data, error } = await ctx.supabase
          .from('shop_tables')
          .insert({ shop_id: input.shopId, table_number: input.tableNumber, short_code: shortCode })
          .select()
          .single();
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    delete: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('shop_tables')
          .delete()
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    toggle: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(toggleTableSchema)
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('shop_tables')
          .update({ is_active: input.isActive })
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== ANALYTICS ==========
  analytics: router({
    get: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string(), days: z.number().int().min(1).max(365).optional().default(7) }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (input.days ?? 7));
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        try {
          // Orders data
          const { data: orders, error: ordersError } = await ctx.supabase
            .from('orders')
            .select('id, total, status, created_at')
            .eq('shop_id', input.shopId)
            .neq('status', 'cancelled')
            .gte('created_at', startIso)
            .lte('created_at', endIso)
            .order('created_at', { ascending: true });

          if (ordersError) throw new Error(ordersError.message);

          const completedOrders = orders.filter(o => o.status === 'completed');
          const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
          const totalOrdersCount = orders.length;
          const completedOrdersCount = completedOrders.length;
          const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

          // Daily revenue
          const dailyData: Record<string, number> = {};
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyData[d.toISOString().split('T')[0]] = 0;
          }
          completedOrders.forEach(order => {
            if (order.created_at) {
              const dateStr = order.created_at.split('T')[0];
              if (dailyData[dateStr] !== undefined) {
                dailyData[dateStr] += Number(order.total);
              }
            }
          });

          const revenueChartData = Object.keys(dailyData).map(date => ({
            date: date.split('-').slice(1).join('/'),
            revenue: dailyData[date],
          }));

          // Top items
          const { data: orderItems, error: itemsError } = await ctx.supabase
            .from('order_items')
            .select(`
              quantity,
              menu_items ( name ),
              orders!inner ( shop_id, status, created_at )
            `)
            .eq('orders.shop_id', input.shopId)
            .eq('orders.status', 'completed')
            .gte('orders.created_at', startIso)
            .lte('orders.created_at', endIso);

          if (itemsError) throw new Error(itemsError.message);

          const itemCounts: Record<string, number> = {};
          orderItems.forEach((item: any) => {
            const itemName = item.menu_items?.name;
            if (itemName) {
              itemCounts[itemName] = (itemCounts[itemName] || 0) + Number(item.quantity);
            }
          });

          const topItemsData = Object.keys(itemCounts)
            .map(name => ({ name, sold: itemCounts[name] }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

          return {
            kpis: { totalRevenue, totalOrders: totalOrdersCount, completedOrders: completedOrdersCount, averageOrderValue },
            revenueChart: revenueChartData,
            topItems: topItemsData,
          };
        } catch (error: any) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
      }),
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/server/routers/shop.ts
git commit -m "feat(trpc): create shopRouter with promotions, settings, tables, analytics"
```

---

### Task 3: Add shopRouter to _app.ts

**Files:**
- Modify: `src/lib/server/routers/_app.ts`

- [ ] **Step 1: Add import and merge**

```ts
import { shopRouter } from './shop';

export const appRouter = router({
  healthcheck: healthRouter.healthcheck,
  auth: authRouter,
  menu: menuRouter,
  order: orderRouter,
  admin: adminRouter,
  shop: shopRouter,
});
```

- [ ] **Step 2: Verify build**

Run: `npx vitest run --reporter=verbose 2>&1 | head -20`
Expected: No import errors, all existing tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/routers/_app.ts
git commit -m "feat(trpc): register shopRouter in app router"
```

---

### Task 4: Migrate admin/promotions/page.tsx to tRPC

**Files:**
- Modify: `src/app/admin/promotions/page.tsx`

- [ ] **Step 1: Replace SA imports with tRPC hooks**

Replace:
```ts
import { getPromotions, createPromotion, deletePromotion, togglePromotionActive } from '@/lib/actions/shop';
import React, { useState, useEffect, useCallback } from 'react';
import type { Promotion } from '@/lib/types/database';
```

With:
```ts
'use client';
import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import type { Promotion } from '@/lib/types/database';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { useAdminShop } from '@/hooks/useAdminShop';
```

- [ ] **Step 2: Replace component logic**

Replace all state + effects + fetch functions with React Query:

```ts
export default function AdminPromotionsPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const utils = trpc.useUtils();
  const { data: promos = [], isLoading } = trpc.shop.promotions.list.useQuery(
    { shopId: shop!.id },
    { enabled: !!shop },
  );
  const createMutation = trpc.shop.promotions.create.useMutation({
    onSuccess: () => { utils.shop.promotions.list.invalidate(); toast.success('Đã tạo khuyến mãi'); setModalOpen(false); setSaving(false); },
    onError: (err) => { toast.error(err.message); setSaving(false); },
  });
  const deleteMutation = trpc.shop.promotions.delete.useMutation({
    onSuccess: () => { utils.shop.promotions.list.invalidate(); toast.success('Đã xóa'); },
    onError: (err) => toast.error(err.message),
  });
  const toggleMutation = trpc.shop.promotions.toggle.useMutation({
    onSuccess: () => { utils.shop.promotions.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
```

Then replace `fetchPromos()` with `utils.shop.promotions.list.invalidate()` in callbacks.

Keep modal form state + JSX the same. Minimal changes.

- [ ] **Step 3: Verify build**

```bash
npx vitest run
npx next build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/promotions/page.tsx
git commit -m "refactor: migrate admin/promotions page to tRPC"
```

---

### Task 5: Migrate admin/settings/page.tsx to tRPC

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Replace SA imports with tRPC**

Replace:
```ts
import { updateShopInfo, updateThemeConfig } from '@/lib/actions/shop';
```
With:
```ts
import { trpc } from '@/lib/trpc';
import { useAdminShop } from '@/hooks/useAdminShop';
```

- [ ] **Step 2: Replace handleSaveInfo and handleSaveTheme**

```ts
const updateInfoMutation = trpc.shop.settings.updateInfo.useMutation({
  onSuccess: () => toast.success('Đã cập nhật thông tin'),
  onError: (err) => toast.error(err.message),
});

const updateThemeMutation = trpc.shop.settings.updateTheme.useMutation({
  onSuccess: () => toast.success('Đã cập nhật giao diện'),
  onError: (err) => toast.error(err.message),
});

const handleSaveInfo = async () => {
  if (!shop || !name.trim()) { toast.error('Tên cửa hàng không được trống'); return; }
  setSaving(true);
  updateInfoMutation.mutate(
    { shopId: shop.id, name, description: description || null, phone, address },
    { onSettled: () => setSaving(false) },
  );
};

const handleSaveTheme = async () => {
  if (!shop) return;
  setSavingTheme(true);
  updateThemeMutation.mutate(
    { shopId: shop.id, primaryColor, font: shop.theme_config.font, bankId, accountNo, accountName },
    { onSettled: () => setSavingTheme(false) },
  );
};
```

- [ ] **Step 3: Verify build**

```bash
npx vitest run
npx next build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "refactor: migrate admin/settings page to tRPC"
```

---

### Task 6: Migrate admin/tables/page.tsx to tRPC

**Files:**
- Modify: `src/app/admin/tables/page.tsx`

- [ ] **Step 1: Replace SA imports with tRPC**

Replace:
```ts
import { getTables, createTable, deleteTable, toggleTableActive } from '@/lib/actions/tables';
```
With:
```ts
import { trpc } from '@/lib/trpc';
import { useAdminShop } from '@/hooks/useAdminShop';
```

- [ ] **Step 2: Replace component logic with React Query**

Similar pattern to promotions: useQuery for list, useMutation with invalidate for create/delete/toggle.

- [ ] **Step 3: Verify build**

```bash
npx vitest run
npx next build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/tables/page.tsx
git commit -m "refactor: migrate admin/tables page to tRPC"
```

---

### Task 7: Migrate admin/analytics/page.tsx to tRPC

**Files:**
- Modify: `src/app/admin/analytics/page.tsx`

- [ ] **Step 1: Replace SA import with tRPC**

Replace:
```ts
import { getShopAnalytics } from '@/lib/actions/analytics';
```
With:
```ts
import { trpc } from '@/lib/trpc';
```

- [ ] **Step 2: Replace fetch logic with useQuery**

```ts
const { data, isLoading, error } = trpc.shop.analytics.get.useQuery(
  { shopId: shop!.id, days },
  { enabled: !!shop },
);
```

Remove `useEffect`, `fetchAnalytics`, all manual loading/error state.

- [ ] **Step 3: Verify build**

```bash
npx vitest run
npx next build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/analytics/page.tsx
git commit -m "refactor: migrate admin/analytics page to tRPC"
```

---

### Task 8: Migrate admin/orders + admin/kds to use trpc.order.updateStatus

**Files:**
- Modify: `src/app/admin/orders/page.tsx`
- Modify: `src/app/admin/kds/page.tsx`

- [ ] **Step 1: Modify admin/orders/page.tsx**

Replace:
```ts
import { updateOrderStatus } from '@/lib/actions/orderAdmin';
```
With:
```ts
import { trpc } from '@/lib/trpc';
```

Replace `handleStatusChange`:
```ts
const updateStatusMutation = trpc.order.updateStatus.useMutation({
  onSuccess: (_, vars) => {
    toast.success(`Đã cập nhật → ${ORDER_STATUS_LABELS[vars.status]}`);
    refetch();
  },
  onError: (err) => toast.error(err.message),
});

const handleStatusChange = async (orderId: string, newStatus: string) => {
  setActionLoading(orderId);
  updateStatusMutation.mutate(
    { orderId, status: newStatus as any },
    { onSettled: () => setActionLoading(null) },
  );
};
```

- [ ] **Step 2: Modify admin/kds/page.tsx** (same pattern)

- [ ] **Step 3: Verify build**

```bash
npx vitest run
npx next build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/orders/page.tsx src/app/admin/kds/page.tsx
git commit -m "refactor: migrate admin/orders and admin/kds to trpc.order.updateStatus"
```

---

### Task 9: Delete orphaned Server Action files + clean shop.ts

**Files:**
- Delete: `src/lib/actions/tables.ts`
- Delete: `src/lib/actions/analytics.ts`
- Delete: `src/lib/actions/orderAdmin.ts`
- Modify: `src/lib/actions/shop.ts` (remove promotion/settings functions, keep only getAdminShops + getAdminShopById)

- [ ] **Step 1: Delete 3 SA files, trim shop.ts**

Verify no remaining imports:
```bash
rg "from '@/lib/actions/tables'" src/
rg "from '@/lib/actions/analytics'" src/
rg "from '@/lib/actions/orderAdmin'" src/
rg "from '@/lib/actions/shop'" src/
```

`shop.ts` is still used by platform admin pages (getAdminShops, getAdminShopById), keep those.

- [ ] **Step 2: Build check**

```bash
npx vitest run
npx next build
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/tables.ts src/lib/actions/analytics.ts src/lib/actions/orderAdmin.ts src/lib/actions/shop.ts
git commit -m "cleanup: delete orphaned SA files (tables, analytics, orderAdmin), trim shop.ts"
```

---

### Task 10: Write integration tests for shopRouter

**Files:**
- Create: `tests/integration/shop-promotions.test.ts`
- Create: `tests/integration/shop-tables.test.ts`
- Create: `tests/integration/shop-analytics.test.ts`

- [ ] **Step 1: Create `tests/integration/shop-promotions.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import { mockAuth } from './helpers';

const SHOP_A = '00000000-0000-0000-0000-000000000001';
const PROMO_1 = '00000000-0000-0000-0000-000000000030';
const PROMO_2 = '00000000-0000-0000-0000-000000000031';

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder), eq: vi.fn(() => builder),
    order: vi.fn(() => builder), limit: vi.fn(() => builder),
    update: vi.fn(() => builder), delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
    insert: vi.fn((vals: any) => makeBuilder([{ id: 'new-promo-id', ...vals }])),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createCaller(options?: { promos?: any[]; user?: any; profile?: any }) {
  const promos = options?.promos ?? [];
  const supabase = {
    from: vi.fn((table: string) => {
      const rows = table === 'promotions' ? promos : [];
      return makeBuilder(rows);
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: options?.user ?? null }, error: options?.user ? null : new Error('no session') }) },
  };
  const ctx: any = { supabase };
  if (options?.user) ctx.user = options.user;
  if (options?.profile) ctx.profile = options.profile;
  return appRouter.createCaller(ctx);
}

describe('shopRouter — promotions', () => {
  const promo1 = { id: PROMO_1, shop_id: SHOP_A, name: 'Giảm 10%', type: 'discount', discount_percent: 10, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), is_active: true, current_uses: 0, max_uses: 100, applicable_items: [], applicable_ranks: [], description: null, max_uses_per_user: null, created_at: new Date().toISOString() };

  it('list returns promotions for a shop', async () => {
    const caller = createCaller({ promos: [promo1], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.promotions.list({ shopId: SHOP_A });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Giảm 10%');
  });

  it('create inserts a promotion', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.promotions.create({
      shopId: SHOP_A, name: 'Khuyến mãi mới', type: 'discount', starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(result.id).toBe('new-promo-id');
    expect(result.name).toBe('Khuyến mãi mới');
  });

  it('delete removes a promotion', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.promotions.delete({ id: PROMO_1 });
    expect(result.success).toBe(true);
  });

  it('toggle changes is_active', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.promotions.toggle({ id: PROMO_1, isActive: false });
    expect(result.success).toBe(true);
  });

  it('rejects unauthenticated requests', async () => {
    const caller = createCaller();
    await expect(caller.shop.promotions.list({ shopId: SHOP_A })).rejects.toThrow('Vui lòng đăng nhập');
  });
});
```

- [ ] **Step 2: Create `tests/integration/shop-tables.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import { mockAuth } from './helpers';

const SHOP_A = '00000000-0000-0000-0000-000000000001';
const TABLE_1 = '00000000-0000-0000-0000-000000000040';

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder), eq: vi.fn(() => builder),
    order: vi.fn(() => builder), limit: vi.fn(() => builder),
    update: vi.fn(() => builder), delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
    insert: vi.fn((vals: any) => makeBuilder([{ id: 'new-table-id', ...vals }])),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createCaller(options?: { tables?: any[]; user?: any; profile?: any }) {
  const tables = options?.tables ?? [];
  const supabase = {
    from: vi.fn((table: string) => {
      const rows = table === 'shop_tables' ? tables : [];
      return makeBuilder(rows);
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: options?.user ?? null }, error: options?.user ? null : new Error('no session') }) },
  };
  const ctx: any = { supabase };
  if (options?.user) ctx.user = options.user;
  if (options?.profile) ctx.profile = options.profile;
  return appRouter.createCaller(ctx);
}

describe('shopRouter — tables', () => {
  const table1 = { id: TABLE_1, shop_id: SHOP_A, table_number: 1, short_code: 'DL-01', qr_url: null, is_active: true, created_at: new Date().toISOString() };

  it('list returns tables for a shop', async () => {
    const caller = createCaller({ tables: [table1], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.tables.list({ shopId: SHOP_A });
    expect(result).toHaveLength(1);
    expect(result[0].table_number).toBe(1);
  });

  it('create inserts a table', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.tables.create({ shopId: SHOP_A, shopSlug: 'di-linh', tableNumber: 2 });
    expect(result.id).toBe('new-table-id');
  });

  it('delete removes a table', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.tables.delete({ id: TABLE_1 });
    expect(result.success).toBe(true);
  });

  it('toggle changes is_active', async () => {
    const caller = createCaller({ user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.tables.toggle({ id: TABLE_1, isActive: false });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Create `tests/integration/shop-analytics.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import { mockAuth } from './helpers';

const SHOP_A = '00000000-0000-0000-0000-000000000001';

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder), eq: vi.fn(() => builder),
    order: vi.fn(() => builder), limit: vi.fn(() => builder),
    update: vi.fn(() => builder), delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
    insert: vi.fn((vals: any) => makeBuilder([{ id: 'new', ...vals }])),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createCaller(options?: { orders?: any[]; orderItems?: any[]; user?: any; profile?: any }) {
  const orders = options?.orders ?? [];
  const orderItems = options?.orderItems ?? [];
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'orders') return makeBuilder(orders);
      if (table === 'order_items') return makeBuilder(orderItems);
      return makeBuilder([]);
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: options?.user ?? null }, error: options?.user ? null : new Error('no session') }) },
  };
  const ctx: any = { supabase };
  if (options?.user) ctx.user = options.user;
  if (options?.profile) ctx.profile = options.profile;
  return appRouter.createCaller(ctx);
}

describe('shopRouter — analytics', () => {
  it('get returns KPIs and charts', async () => {
    const orders = [
      { id: 'o1', shop_id: SHOP_A, total: 100000, status: 'completed', created_at: new Date().toISOString() },
      { id: 'o2', shop_id: SHOP_A, total: 50000, status: 'completed', created_at: new Date().toISOString() },
    ];
    const orderItems = [
      { quantity: 2, menu_items: { name: 'Cà phê sữa' }, orders: { shop_id: SHOP_A, status: 'completed', created_at: new Date().toISOString() } },
    ];
    const caller = createCaller({ orders, orderItems, user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.shop.analytics.get({ shopId: SHOP_A, days: 7 });
    expect(result.kpis.totalRevenue).toBe(150000);
    expect(result.kpis.totalOrders).toBe(2);
    expect(result.kpis.completedOrders).toBe(2);
    expect(result.revenueChart.length).toBeGreaterThan(0);
    expect(result.topItems[0].name).toBe('Cà phê sữa');
  });

  it('rejects unauthenticated requests', async () => {
    const caller = createCaller();
    await expect(caller.shop.analytics.get({ shopId: SHOP_A })).rejects.toThrow('Vui lòng đăng nhập');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/integration/shop-promotions.test.ts tests/integration/shop-tables.test.ts tests/integration/shop-analytics.test.ts
```
Expected: All tests pass

- [ ] **Step 5: Full regression**

```bash
npx vitest run
npx next build
```

- [ ] **Step 6: Commit**

```bash
git add tests/integration/shop-promotions.test.ts tests/integration/shop-tables.test.ts tests/integration/shop-analytics.test.ts
git commit -m "test: add integration tests for shopRouter (promotions, tables, analytics)"
```

---

### Task 11: Final verification + commit

- [ ] **Step 1: Full test suite**

```bash
npx vitest run
```

Expected: All tests pass (expecting ~80+ tests now)

- [ ] **Step 2: Production build**

```bash
npx next build
```

Expected: Compiled successfully, no TypeScript errors, only expected DYNAMIC_SERVER_USAGE warnings

- [ ] **Step 3: Final commit of any remaining changes**

```bash
git status
git add -A
git commit -m "chore: finalize shop tRPC router migration"
```

- [ ] **Step 4: Apply gotcha if any new issue discovered**
