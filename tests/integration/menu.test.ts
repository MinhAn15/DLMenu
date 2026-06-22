import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import { mockAuth } from './helpers';

const SHOP_A = '00000000-0000-0000-0000-000000000001';
const CAT_1 = '00000000-0000-0000-0000-000000000010';
const CAT_2 = '00000000-0000-0000-0000-000000000011';
const ITEM_1 = '00000000-0000-0000-0000-000000000020';

function makeBuilder(rows: any[]): any {
  const thenable = Promise.resolve({ data: rows, error: null });
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
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

function createMenuCaller(options?: {
  categories?: any[];
  items?: any[];
  user?: any;
  profile?: any;
}) {
  const categories = options?.categories ?? [];
  const items = options?.items ?? [];
  const supabase = {
    from: vi.fn((table: string) => {
      const rows = table === 'menu_categories' ? categories : items;
      return makeBuilder(rows);
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

describe('menuRouter — categories', () => {
  const cat1 = { id: CAT_1, shop_id: SHOP_A, name: 'Khai vị', description: null, sort_order: 1, is_active: true, created_at: new Date().toISOString() };
  const cat2 = { id: CAT_2, shop_id: SHOP_A, name: 'Cà phê', description: 'Đồ uống', sort_order: 2, is_active: true, created_at: new Date().toISOString() };

  it('getCategories returns list for a shop', async () => {
    const caller = createMenuCaller({ categories: [cat1, cat2], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.menu.getCategories({ shopId: SHOP_A });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Khai vị');
  });

  it('getCategories returns empty for shop with no categories', async () => {
    const caller = createMenuCaller({ categories: [], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.menu.getCategories({ shopId: SHOP_A });
    expect(result).toEqual([]);
  });

  it('createCategory returns new category', async () => {
    const caller = createMenuCaller({ categories: [cat1], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.menu.createCategory({ shopId: SHOP_A, name: 'Tráng miệng', description: 'Ngọt' });
    expect(result.name).toBe('Tráng miệng');
  });

  it('createCategory rejects empty name via schema', async () => {
    const caller = createMenuCaller({ user: mockAuth.user, profile: mockAuth.profile });
    await expect(caller.menu.createCategory({ shopId: SHOP_A, name: '' }))
      .rejects.toThrow();
  });
});

describe('menuRouter — items', () => {
  const item1 = { id: ITEM_1, shop_id: SHOP_A, category_id: CAT_1, name: 'Cà phê sữa đá', price: 25000, description: null, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

  it('getMenuItems returns items for a shop', async () => {
    const caller = createMenuCaller({ items: [item1], user: mockAuth.user, profile: mockAuth.profile });
    const result = await caller.menu.getMenuItems({ shopId: SHOP_A });
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(25000);
  });

  it('createMenuItem validates price', async () => {
    const caller = createMenuCaller({ user: mockAuth.user, profile: mockAuth.profile });
    await expect(caller.menu.createMenuItem({
      shopId: SHOP_A, name: 'Test', price: 0, categoryId: null,
    })).rejects.toThrow();
  });

  it('createMenuItem rejects negative price', async () => {
    const caller = createMenuCaller({ user: mockAuth.user, profile: mockAuth.profile });
    await expect(caller.menu.createMenuItem({
      shopId: SHOP_A, name: 'Test', price: -5000, categoryId: null,
    })).rejects.toThrow();
  });
});
