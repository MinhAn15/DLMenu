import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';

function createMockSupabase() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'user-1', role: 'shop_owner', display_name: 'Test' }, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
    },
  };
}

function createTestContext(overrides = {}) {
  return {
    supabase: createMockSupabase() as any,
    user: null as any,
    profile: null as any,
    ...overrides,
  };
}

describe('tRPC public procedures', () => {
  it('healthcheck returns ok', async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthcheck();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});

describe('tRPC protected procedures', () => {
  it('throws UNAUTHORIZED when no user', async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.auth.me()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns profile when authenticated', async () => {
    const ctx = createTestContext({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'shop_owner', display_name: 'Test' },
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result.profile.role).toBe('shop_owner');
    expect(result.profile.display_name).toBe('Test');
  });
});
