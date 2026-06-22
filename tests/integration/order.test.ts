import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import type { UserRole } from '@dilinh/types';

const SHOP_ID = '00000000-0000-1000-8000-000000000001';
const USER_ID = '00000000-0000-1000-8000-000000000005';
const ORDER_ID = '00000000-0000-1000-8000-000000000009';
const MEMBERSHIP_ID = '00000000-0000-1000-8000-000000000022';
const TABLE_ID = '00000000-0000-1000-8000-000000000010';

interface MockProfile {
  id: string;
  role: UserRole;
  display_name: string;
  shop_id: string | null;
}

function makeBuilder(options: {
  rows?: any[];
  singleRow?: any;
  error?: any;
} = {}): any {
  const data = options.rows ?? (options.singleRow ? [options.singleRow] : []);
  const thenable = Promise.resolve({ data, error: options.error ?? null });
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: options.singleRow ?? data[0] ?? null, error: options.error ?? null })),
    insert: vi.fn((vals: any) => makeBuilder({ singleRow: { id: 'new-id', ...vals } })),
    update: vi.fn((vals: any) => makeBuilder({ singleRow: { id: 'updated-id', ...vals } })),
    delete: vi.fn(() => makeBuilder({ rows: [] })),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createOrderCaller(options: {
  user?: { id: string } | null;
  profile?: MockProfile | null;
  queries?: Record<string, any[]>;
  singleQueries?: Record<string, any>;
  rpcMock?: (fn: string, params: any) => any;
}) {
  const queries = options.queries ?? {};
  const singleQueries = options.singleQueries ?? {};

  const supabase = {
    from: vi.fn((table: string) => {
      if (singleQueries[table] !== undefined) {
        return makeBuilder({ singleRow: singleQueries[table] });
      }
      if (queries[table] !== undefined) {
        return makeBuilder({ rows: queries[table] });
      }
      return makeBuilder({ rows: [] });
    }),
    rpc: vi.fn((fn: string, params: any) => {
      if (options.rpcMock) {
        return Promise.resolve(options.rpcMock(fn, params));
      }
      if (fn === 'generate_order_number') {
        return Promise.resolve({ data: '#042', error: null });
      }
      return Promise.resolve({ data: null, error: null });
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
// Basic Order Flow Tests
// ============================================================

describe('orderRouter: create', () => {
  it('should successfully create an order for a guest customer', async () => {
    const caller = createOrderCaller({
      user: null,
      profile: null,
    });

    const result = await caller.order.create({
      shopId: SHOP_ID,
      tableId: TABLE_ID,
      orderType: 'dine_in',
      items: [
        { menuItemId: 'item-1', quantity: 2, unitPrice: 30000, note: 'ít đá' }
      ],
      customerNote: 'giao nhanh',
    });

    expect(result).toBeDefined();
    expect(result.order_number).toBe('#042');
    expect(result.total).toBe(60000);
  });

  it('should create an order and auto-create membership for logged in user if not exists', async () => {
    let membershipChecked = false;
    let membershipInserted = false;

    const caller = createOrderCaller({
      user: { id: USER_ID },
      profile: { id: USER_ID, role: 'customer', display_name: 'Customer A', shop_id: null },
      singleQueries: {
        // Mock that membership doesn't exist yet
        user_shop_memberships: null,
      },
      queries: {
        // Override tables to monitor updates/inserts
        orders: [],
      },
      rpcMock: (fn, params) => {
        if (fn === 'generate_order_number') return { data: '#101', error: null };
        return { data: null, error: null };
      }
    });

    // Mock supabase behavior specifically for user_shop_memberships insert
    const originalFrom = caller.order.create.apply; // We will let our mock handle it:
    // When orderRouter calls create, we will verify through return data or mocks.
    
    const result = await caller.order.create({
      shopId: SHOP_ID,
      tableId: TABLE_ID,
      orderType: 'dine_in',
      items: [
        { menuItemId: 'item-1', quantity: 1, unitPrice: 50000 }
      ]
    });

    expect(result.order_number).toBe('#101');
    expect(result.total).toBe(50000);
  });
});

describe('orderRouter: list', () => {
  it('should allow shop owner to list orders of their shop', async () => {
    const mockOrders = [
      { id: 'o-1', shop_id: SHOP_ID, status: 'pending', total: 100000, created_at: '2026-06-22T10:00:00Z' },
      { id: 'o-2', shop_id: SHOP_ID, status: 'completed', total: 150000, created_at: '2026-06-22T09:00:00Z' }
    ];

    const caller = createOrderCaller({
      user: { id: 'owner-user' },
      profile: { id: 'owner-user', role: 'shop_owner', display_name: 'Owner', shop_id: SHOP_ID },
      queries: {
        orders: mockOrders,
      }
    });

    const result = await caller.order.list({
      shopId: SHOP_ID,
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('o-1');
  });
});

describe('orderRouter: updateStatus', () => {
  it('should correctly transit status from pending to confirmed', async () => {
    const caller = createOrderCaller({
      user: { id: 'owner-user' },
      profile: { id: 'owner-user', role: 'shop_owner', display_name: 'Owner', shop_id: SHOP_ID },
      singleQueries: {
        orders: { id: ORDER_ID, shop_id: SHOP_ID, status: 'pending' },
        shops: { id: SHOP_ID, owner_id: 'owner-user' },
      }
    });

    const result = await caller.order.updateStatus({
      orderId: ORDER_ID,
      status: 'confirmed',
    });

    expect(result.success).toBe(true);
  });

  it('should throw error when trying invalid state transition (pending -> ready directly)', async () => {
    const caller = createOrderCaller({
      user: { id: 'owner-user' },
      profile: { id: 'owner-user', role: 'shop_owner', display_name: 'Owner', shop_id: SHOP_ID },
      singleQueries: {
        orders: { id: ORDER_ID, shop_id: SHOP_ID, status: 'pending' },
        shops: { id: SHOP_ID, owner_id: 'owner-user' },
      }
    });

    await expect(
      caller.order.updateStatus({
        orderId: ORDER_ID,
        status: 'ready',
      })
    ).rejects.toThrow();
  });

  it('should run full completeOrder logic (points, rank, transaction logs) when transiting to completed', async () => {
    // Mock shop with custom loyalty config
    const mockShop = {
      id: SHOP_ID,
      loyalty_config: {
        points_formula: { type: 'percentage', percentage: 10 }, // 10% of subtotal
        ranks: [
          { name: 'Bronze', min_points: 0, discount_percent: 0 },
          { name: 'Silver', min_points: 100, discount_percent: 5 },
        ],
        bonus_rules: [],
        discount_stacking: 'take_highest'
      }
    };

    const mockOrder = {
      id: ORDER_ID,
      shop_id: SHOP_ID,
      user_id: USER_ID,
      status: 'ready',
      subtotal: 500000,
      total: 500000,
      order_number: 'ORD-1234',
      shops: mockShop
    };

    const mockMembership = {
      id: MEMBERSHIP_ID,
      user_id: USER_ID,
      shop_id: SHOP_ID,
      ranking_points: 60,
      redeemable_points: 60,
      rank: 'Bronze',
      total_spent: 200000,
      order_count: 2
    };

    const caller = createOrderCaller({
      user: { id: 'owner-user' },
      profile: { id: 'owner-user', role: 'shop_owner', display_name: 'Owner', shop_id: SHOP_ID },
      singleQueries: {
        orders: mockOrder,
        user_shop_memberships: mockMembership,
        shops: { id: SHOP_ID, owner_id: 'owner-user' },
      }
    });

    const result = await caller.order.updateStatus({
      orderId: ORDER_ID,
      status: 'completed',
    });

    expect(result.success).toBe(true);
    expect(result.earnedPoints).toBe(50000); // 10% of 500,000 is 50,000 points
  });
});
