import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import type { UserRole } from '@dilinh/types';

const SHOP_A = '00000000-0000-0000-0000-000000000001';
const SHOP_B = '00000000-0000-0000-0000-000000000002';
const ITEM_1 = '00000000-0000-0000-0000-000000000020';

interface MockProfile {
  id: string;
  role: UserRole;
  display_name: string;
  shop_id: string | null;
}

/**
 * Creates a mock supabase client with configurable table responses.
 * Extends the helpers.ts pattern with per-table row configuration.
 */
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

function createMenuRBACCaller(options: {
  user?: { id: string } | null;
  profile?: MockProfile | null;
  categories?: any[];
  items?: any[];
}) {
  const categories = options.categories ?? [];
  const items = options.items ?? [];

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'menu_categories') return makeBuilder(categories);
      if (table === 'menu_items') return makeBuilder(items);
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
// RBAC Tests for Menu Router
// ============================================================

describe('menuRouter RBAC: createCategory', () => {
  it('Test 1: customer cannot createCategory → FORBIDDEN', async () => {
    const caller = createMenuRBACCaller({
      user: { id: customer.id },
      profile: customer,
    });

    await expect(
      caller.menu.createCategory({ shopId: SHOP_A, name: 'Test Category' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('Test 2: shop_owner creates category for own shop → success', async () => {
    const caller = createMenuRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
      categories: [{ sort_order: 1 }],
    });

    const result = await caller.menu.createCategory({
      shopId: SHOP_A,
      name: 'Cà phê',
    });
    expect(result.name).toBe('Cà phê');
  });

  it('Test 3: shop_owner cannot create category for another shop → FORBIDDEN', async () => {
    const caller = createMenuRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
    });

    await expect(
      caller.menu.createCategory({ shopId: SHOP_B, name: 'Trà' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('Test 4: platform_admin bypass — creates category for any shop → success', async () => {
    const caller = createMenuRBACCaller({
      user: { id: admin.id },
      profile: admin,
      categories: [{ sort_order: 1 }],
    });

    const result = await caller.menu.createCategory({
      shopId: SHOP_A,
      name: 'Admin Category',
    });
    expect(result.name).toBe('Admin Category');
  });
});

describe('menuRouter RBAC: deleteMenuItem', () => {
  it('Test 5: anonymous cannot deleteMenuItem → UNAUTHORIZED', async () => {
    const caller = createMenuRBACCaller({
      user: null,
      profile: null,
    });

    await expect(
      caller.menu.deleteMenuItem({ id: ITEM_1 })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('Test 6: shop_owner deletes own item → success', async () => {
    const caller = createMenuRBACCaller({
      user: { id: shopOwnerA.id },
      profile: shopOwnerA,
      items: [{ id: ITEM_1, shop_id: SHOP_A }],
    });

    const result = await caller.menu.deleteMenuItem({ id: ITEM_1 });
    expect(result.success).toBe(true);
  });
});
