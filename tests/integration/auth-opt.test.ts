import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../../src/lib/server/routers/_app';

const USER_ID = '00000000-0000-1000-8000-000000000005';

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
    single: vi.fn(() => Promise.resolve({ data: options.singleRow ?? data[0] ?? null, error: options.error ?? null })),
  };
  builder.then = thenable.then.bind(thenable);
  builder.catch = thenable.catch.bind(thenable);
  builder.finally = thenable.finally.bind(thenable);
  return builder;
}

function createAuthOptCaller(options: {
  user?: { id: string; email?: string } | null;
  profile?: any;
  dbError?: any;
  headers?: Headers;
}) {
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        if (options.dbError) {
          return makeBuilder({ error: options.dbError });
        }
        return makeBuilder({ singleRow: options.profile });
      }
      return makeBuilder({ rows: [] });
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: options.user ? null : new Error('no session'),
      }),
    },
  };

  const ctx: any = {
    supabase,
    headers: options.headers ?? new Headers(),
  };
  if (options.user) ctx.user = options.user;
  if (options.profile) ctx.profile = options.profile;
  
  return appRouter.createCaller(ctx);
}

describe('Auth Caching: x-user-role header', () => {
  it('should use cached role from headers and bypass profiles database query', async () => {
    const headers = new Headers();
    headers.set('x-user-role', 'platform_admin');

    const caller = createAuthOptCaller({
      user: { id: USER_ID, email: 'admin@dilinh.vn' },
      headers,
      // DB profiles sẽ trả về error để chứng minh nếu router gọi DB, test sẽ crash/fail
      dbError: new Error('Database should not be queried!'),
    });

    const result = await caller.auth.me();
    
    expect(result.profile).toBeDefined();
    expect(result.profile?.role).toBe('platform_admin');
  });

  it('should fallback to DB profiles query if x-user-role header is missing', async () => {
    const caller = createAuthOptCaller({
      user: { id: USER_ID, email: 'owner@dilinh.vn' },
      profile: { id: USER_ID, role: 'shop_owner', display_name: 'Shop Owner' },
      headers: new Headers(), // No x-user-role header
    });

    const result = await caller.auth.me();

    expect(result.profile).toBeDefined();
    expect(result.profile?.role).toBe('shop_owner');
    expect(result.profile?.display_name).toBe('Shop Owner');
  });
});
