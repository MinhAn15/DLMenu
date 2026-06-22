import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import { mockAuth } from './helpers';

const SHOP_A = '00000000-0000-4000-8000-000000000001';
const PROMO_1 = '00000000-0000-4000-8000-000000000100';
const TABLE_1 = '00000000-0000-4000-8000-000000000200';

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
    insert: vi.fn((vals: any) => makeBuilder([{ id: 'new-id', ...vals }])),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createShopCaller(options?: {
  promotions?: any[];
  shops?: any[];
  tables?: any[];
  orders?: any[];
  orderItems?: any[];
  user?: any;
  profile?: any;
}) {
  const promotions = options?.promotions ?? [];
  const shops = options?.shops ?? [];
  const tables = options?.tables ?? [];
  const orders = options?.orders ?? [];
  const orderItems = options?.orderItems ?? [];

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'promotions') return makeBuilder(promotions);
      if (table === 'shops') return makeBuilder(shops);
      if (table === 'shop_tables') return makeBuilder(tables);
      if (table === 'orders') return makeBuilder(orders);
      if (table === 'order_items') return makeBuilder(orderItems);
      return makeBuilder([]);
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options?.user ?? null },
        error: options?.user ? null : new Error('no session'),
      }),
    },
  };

  const ctx: any = { supabase };
  if (options?.user) ctx.user = options.user;
  if (options?.profile) ctx.profile = options.profile;
  return appRouter.createCaller(ctx);
}

describe('shopRouter — promotions', () => {
  const promo1 = {
    id: PROMO_1,
    shop_id: SHOP_A,
    name: 'Khuyến mãi hè',
    type: 'discount',
    discount_percent: 10,
    starts_at: new Date().toISOString(),
    ends_at: new Date().toISOString(),
    is_active: true,
  };

  it('promotions.list returns list for a shop', async () => {
    const caller = createShopCaller({
      promotions: [promo1],
      user: mockAuth.user,
      profile: { ...mockAuth.profile, shop_id: SHOP_A },
    });
    const result = await caller.shop.promotions.list({ shopId: SHOP_A });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Khuyến mãi hè');
  });

  it('promotions.create creates a new promotion', async () => {
    const caller = createShopCaller({
      promotions: [promo1],
      user: mockAuth.user,
      profile: { ...mockAuth.profile, shop_id: SHOP_A },
    });
    const result = await caller.shop.promotions.create({
      shopId: SHOP_A,
      name: 'Giảm giá khủng',
      type: 'discount',
      discount_percent: 20,
      starts_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
    });
    expect(result.name).toBe('Giảm giá khủng');
  });
});

describe('shopRouter — settings', () => {
  it('settings.updateInfo updates shop basic info', async () => {
    const caller = createShopCaller({
      user: mockAuth.user,
      profile: { ...mockAuth.profile, shop_id: SHOP_A },
    });
    const result = await caller.shop.settings.updateInfo({
      shopId: SHOP_A,
      name: 'Tên mới',
      description: 'Mô tả mới',
    });
    expect(result.success).toBe(true);
  });
});

describe('shopRouter — tables', () => {
  const table1 = {
    id: TABLE_1,
    shop_id: SHOP_A,
    table_number: 1,
    short_code: 'CPM-01',
    is_active: true,
  };

  it('tables.list returns tables for a shop', async () => {
    const caller = createShopCaller({
      tables: [table1],
      user: mockAuth.user,
      profile: { ...mockAuth.profile, shop_id: SHOP_A },
    });
    const result = await caller.shop.tables.list({ shopId: SHOP_A });
    expect(result).toHaveLength(1);
    expect(result[0].table_number).toBe(1);
  });
});

describe('shopRouter — analytics', () => {
  it('analytics.get returns kpis and charts', async () => {
    const orders = [
      { id: '1', total: 100000, status: 'completed', created_at: new Date().toISOString() },
    ];
    const orderItems = [
      { quantity: 2, menu_items: { name: 'Cà phê đá' } },
    ];

    const caller = createShopCaller({
      orders,
      orderItems,
      user: mockAuth.user,
      profile: { ...mockAuth.profile, shop_id: SHOP_A },
    });

    const result = await caller.shop.analytics.get({ shopId: SHOP_A, days: 7 });
    expect(result.kpis.totalRevenue).toBe(100000);
    expect(result.topItems).toHaveLength(1);
    expect(result.topItems[0].name).toBe('Cà phê đá');
  });
});
