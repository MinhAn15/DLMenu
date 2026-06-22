import { vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';
import type { AppRouter } from '../../src/lib/server/routers/_app';


interface MockAuthUser {
  id: string;
  email?: string;
}

interface MockAuthProfile {
  id: string;
  role: string;
  display_name: string;
  shop_id?: string | null;
}

interface MockSupabaseOptions {
  user?: MockAuthUser | null;
  profile?: MockAuthProfile | null;
}

interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  [key: string]: any;
}

interface MockSupabase {
  from: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
}

function createQueryBuilder(profile?: MockAuthProfile | null): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      profile
        ? { data: profile, error: null }
        : { data: null, error: { message: 'not found' } },
    ),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };
  return builder;
}

export function createMockSupabase(options?: MockSupabaseOptions): MockSupabase {
  const user = options?.user ?? null;
  const profile = options?.profile ?? null;
  return {
    from: vi.fn(() => createQueryBuilder(profile)),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('no session'),
      }),
    },
  };
}

export function createMockContext(overrides: Record<string, unknown> = {}) {
  const ctx = { supabase: createMockSupabase() as any, ...overrides };
  return ctx as any;
}

export const mockAuth = {
  user: { id: 'user-1' } as MockAuthUser,
  profile: { id: 'user-1', role: 'shop_owner', display_name: 'Test', shop_id: '00000000-0000-0000-0000-000000000001' } as MockAuthProfile,
  userAlt: { id: 'user-2' } as MockAuthUser,
  profileAlt: { id: 'user-2', role: 'customer', display_name: 'Khách', shop_id: null } as MockAuthProfile,
};

export function createCaller(options?: {
  user?: MockAuthUser | null;
  profile?: MockAuthProfile | null;
  overrides?: Record<string, unknown>;
}) {
  const supabase = createMockSupabase({
    user: options?.user ?? null,
    profile: options?.profile ?? null,
  });
  const ctx = { supabase: supabase as any, headers: null, ...options?.overrides };
  if (options?.user) {
    (ctx as any).user = options.user;
  }
  if (options?.profile) {
    (ctx as any).profile = options.profile;
  }
  return appRouter.createCaller(ctx);
}

export type { MockAuthUser, MockAuthProfile, MockSupabaseOptions, AppRouter };
