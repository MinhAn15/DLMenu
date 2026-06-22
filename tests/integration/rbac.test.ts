import { describe, it, expect, vi } from 'vitest';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hasRole, ownsShop } from '../../src/lib/server/middleware/rbac';
import type { UserRole } from '@dilinh/types';

// ============================================================
// Mock Supabase factory — extends trpc.test.ts pattern
// ============================================================
interface MockUser {
  id: string;
}

interface MockProfile {
  id: string;
  role: UserRole;
  display_name: string;
  shop_id: string | null;
}

function createMockSupabase(
  user: MockUser | null = null,
  profile: MockProfile | null = null,
  shopOwnership: { shopId: string; ownerId: string }[] = []
) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(
            profile
              ? { data: profile, error: null }
              : { data: null, error: { message: 'not found' } }
          ),
        };
      }
      if (table === 'shops') {
        // Return shop with owner_id for ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((col: string, val: string) => {
            const shop = shopOwnership.find((s) => s.shopId === val);
            return {
              single: vi.fn().mockResolvedValue(
                shop
                  ? { data: { id: shop.shopId, owner_id: shop.ownerId }, error: null }
                  : { data: null, error: { message: 'not found' } }
              ),
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
            };
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      };
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('no session'),
      }),
    },
  };
}

// ============================================================
// Test-only tRPC setup — isolated from app router
// ============================================================
interface TestContext {
  supabase: ReturnType<typeof createMockSupabase>;
  user?: MockUser;
  profile?: MockProfile;
}

const t = initTRPC.context<TestContext>().create();

// Re-create isAuthenticated inline for test isolation
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const user = ctx.user ?? (await ctx.supabase.auth.getUser()).data.user;
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' });
  }
  const profile =
    ctx.profile ??
    ((await ctx.supabase.from('profiles').select('id, role, display_name, shop_id').eq('id', user.id).single()).data as MockProfile | null);
  return next({ ctx: { ...ctx, user, profile } });
});

const protectedProcedure = t.procedure.use(isAuthenticated);

// ============================================================
// Test router — uses RBAC middleware
// ============================================================
const testRouter = t.router({
  // Route guarded by hasRole('shop_owner')
  shopOwnerOnly: protectedProcedure
    .use(t.middleware(hasRole('shop_owner')))
    .query(() => ({ ok: true, action: 'shop_owner_action' })),

  // Route guarded by hasRole('platform_admin')
  adminOnly: protectedProcedure
    .use(t.middleware(hasRole('platform_admin')))
    .query(() => ({ ok: true, action: 'admin_action' })),

  // Route guarded by ownsShop — requires shopId in input
  shopResource: protectedProcedure
    .use(t.middleware(ownsShop))
    .input(z.object({ shopId: z.string() }))
    .query(({ input }) => ({ ok: true, shopId: input.shopId })),
});

// ============================================================
// Tests
// ============================================================

describe('RBAC Middleware: hasRole', () => {
  it('Test 1: hasRole("shop_owner") allows shop_owner', async () => {
    const mockProfile: MockProfile = {
      id: 'user-1',
      role: 'shop_owner',
      display_name: 'Shop Owner',
      shop_id: 'shop-1',
    };
    const ctx: TestContext = {
      supabase: createMockSupabase({ id: 'user-1' }, mockProfile) as any,
      user: { id: 'user-1' },
      profile: mockProfile,
    };
    const caller = testRouter.createCaller(ctx);

    const result = await caller.shopOwnerOnly();
    expect(result.ok).toBe(true);
    expect(result.action).toBe('shop_owner_action');
  });

  it('Test 2: hasRole("platform_admin") rejects shop_owner with FORBIDDEN', async () => {
    const mockProfile: MockProfile = {
      id: 'user-2',
      role: 'shop_owner',
      display_name: 'Shop Owner',
      shop_id: 'shop-1',
    };
    const ctx: TestContext = {
      supabase: createMockSupabase({ id: 'user-2' }, mockProfile) as any,
      user: { id: 'user-2' },
      profile: mockProfile,
    };
    const caller = testRouter.createCaller(ctx);

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('RBAC Middleware: ownsShop', () => {
  it('Test 3: ownsShop allows owner of that shop', async () => {
    const mockProfile: MockProfile = {
      id: 'user-3',
      role: 'shop_owner',
      display_name: 'Owner A',
      shop_id: 'shop-A',
    };
    const ctx: TestContext = {
      supabase: createMockSupabase(
        { id: 'user-3' },
        mockProfile,
        [{ shopId: 'shop-A', ownerId: 'user-3' }]
      ) as any,
      user: { id: 'user-3' },
      profile: mockProfile,
    };
    const caller = testRouter.createCaller(ctx);

    const result = await caller.shopResource({ shopId: 'shop-A' });
    expect(result.ok).toBe(true);
    expect(result.shopId).toBe('shop-A');
  });

  it('Test 4: ownsShop rejects owner of different shop with FORBIDDEN', async () => {
    const mockProfile: MockProfile = {
      id: 'user-4',
      role: 'shop_owner',
      display_name: 'Owner B',
      shop_id: 'shop-B',
    };
    const ctx: TestContext = {
      supabase: createMockSupabase(
        { id: 'user-4' },
        mockProfile,
        [{ shopId: 'shop-A', ownerId: 'user-other' }]
      ) as any,
      user: { id: 'user-4' },
      profile: mockProfile,
    };
    const caller = testRouter.createCaller(ctx);

    await expect(caller.shopResource({ shopId: 'shop-A' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('Test 5: ownsShop allows platform_admin bypass', async () => {
    const mockProfile: MockProfile = {
      id: 'admin-1',
      role: 'platform_admin',
      display_name: 'Super Admin',
      shop_id: null,
    };
    const ctx: TestContext = {
      supabase: createMockSupabase(
        { id: 'admin-1' },
        mockProfile,
        [{ shopId: 'shop-A', ownerId: 'user-other' }]
      ) as any,
      user: { id: 'admin-1' },
      profile: mockProfile,
    };
    const caller = testRouter.createCaller(ctx);

    const result = await caller.shopResource({ shopId: 'shop-A' });
    expect(result.ok).toBe(true);
    expect(result.shopId).toBe('shop-A');
  });

  it('Test 6: ownsShop rejects anonymous (no user) with UNAUTHORIZED', async () => {
    const ctx: TestContext = {
      supabase: createMockSupabase(null, null) as any,
    };
    const caller = testRouter.createCaller(ctx);

    await expect(caller.shopResource({ shopId: 'shop-A' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});
