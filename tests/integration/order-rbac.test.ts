import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import type { UserRole } from '@dilinh/types';

const SHOP_A = '00000000-0000-1000-8000-000000000001';
const SHOP_B = '00000000-0000-1000-8000-000000000002';
const ORDER_A = '00000000-0000-1000-8000-000000000009';
const ORDER_B = '00000000-0000-1000-8000-000000000010';

interface MockProfile {
  id: string;
  role: UserRole;
  display_name: string;
  shop_id: string | null;
}

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createOrderRBACCaller(options: {
  user?: { id: string } | null;
  profile?: MockProfile | null;
  orders?: any[];
}) {
  const orders = options.orders ?? [];

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'orders') return makeBuilder(orders);
      if (table === 'profiles') {
        return makeBuilder(options.profile ? [options.profile] : []);
      }
      return makeBuilder([]);
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: options.user ? null : new Error('no session'),
      }),
    },
  };

  const ctx: any = { supabase };
  if (options.user) ctx.user = options.user;
  if (options.profile) ctx.profile = options.profile;
  return appRouter.createCaller(ctx);
}

// ============================================================
// Fixtures
// ============================================================
const shopOwnerA: MockProfile = {
  id: 'owner-a',
  role: 'shop_owner',
  display_name: 'Owner A',
  shop_id: SHOP_A,
};

const shopOwnerB: MockProfile = {
  id: 'owner-b',
  role: 'shop_owner',
  display_name: 'Owner B',
  shop_id: SHOP_B,
};

const customer: MockProfile = {
  id: 'customer-1',
  role: 'customer',
  display_name: 'Khách Hàng',
  shop_id: null,
};

const admin: MockProfile = {
  id: 'admin-1',
  role: 'platform_admin',
  display_name: 'Super Admin',
  shop_id: null,
};

// ============================================================
// RBAC Tests for Order Router
// ============================================================

describe('orderRouter RBAC: list', () => {
  it('should deny customer access to list orders → FORBIDDEN', async () => {
    const caller = createOrderRBACCaller({
      user: { id: customer.id },
      profile: customer,
    });

    await expect(
      caller.order.list({ shopId: SHOP_A })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should deny shop_owner A from listing orders of shop B → FORBIDDEN', async () => {
    const caller = createOrderRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
    });

    await expect(
      caller.order.list({ shopId: SHOP_B })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should allow shop_owner A to list orders of shop A → success', async () => {
    const caller = createOrderRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
      orders: [{ id: 'o-1', shop_id: SHOP_A }],
    });

    const result = await caller.order.list({ shopId: SHOP_A });
    expect(result).toBeDefined();
  });

  it('should allow platform_admin to list orders of any shop → success', async () => {
    const caller = createOrderRBACCaller({
      user: { id: admin.id },
      profile: admin,
      orders: [{ id: 'o-2', shop_id: SHOP_A }],
    });

    const result = await caller.order.list({ shopId: SHOP_A });
    expect(result).toBeDefined();
  });
});

describe('orderRouter RBAC: updateStatus', () => {
  it('should deny anonymous users → UNAUTHORIZED', async () => {
    const caller = createOrderRBACCaller({
      user: null,
      profile: null,
    });

    await expect(
      caller.order.updateStatus({ orderId: ORDER_A, status: 'confirmed' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('should deny customer from updating order status → FORBIDDEN', async () => {
    const caller = createOrderRBACCaller({
      user: { id: customer.id },
      profile: customer,
    });

    await expect(
      caller.order.updateStatus({ orderId: ORDER_A, status: 'confirmed' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should deny shop_owner A from updating order of shop B → FORBIDDEN', async () => {
    // Mock: When router queries the order, it returns shop_id = SHOP_B
    const caller = createOrderRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
      orders: [{ id: ORDER_B, shop_id: SHOP_B, status: 'pending' }], // The order to update belongs to Shop B
    });

    await expect(
      caller.order.updateStatus({ orderId: ORDER_B, status: 'confirmed' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
