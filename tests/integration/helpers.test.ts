import { describe, it, expect } from 'vitest';
import {
  createMockSupabase,
  createMockContext,
  createCaller,
  mockAuth,
} from './helpers';

describe('createMockSupabase', () => {
  it('builds chainable query builder', async () => {
    const supabase = createMockSupabase();
    const result = await supabase.from('profiles').select('*').eq('id', 'x').single();
    expect(result).toEqual({ data: null, error: expect.any(Object) });
  });

  it('returns user when authenticated', async () => {
    const supabase = createMockSupabase({ user: { id: 'user-1' } });
    const { data } = await supabase.auth.getUser();
    expect(data.user?.id).toBe('user-1');
  });

  it('returns no user when not authenticated', async () => {
    const supabase = createMockSupabase();
    const { data } = await supabase.auth.getUser();
    expect(data.user).toBeNull();
  });

  it('returns profile data when profile provided', async () => {
    const supabase = createMockSupabase({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'shop_owner', display_name: 'Test' },
    });
    const { data } = await supabase.from('profiles').select('*').eq('id', 'user-1').single();
    expect(data?.role).toBe('shop_owner');
  });
});

describe('createMockContext', () => {
  it('creates context with mock supabase', () => {
    const ctx = createMockContext();
    expect(ctx).toHaveProperty('supabase');
    expect(typeof ctx.supabase.from).toBe('function');
  });

  it('merges overrides', () => {
    const ctx = createMockContext({ customField: 'hello' });
    expect((ctx as any).customField).toBe('hello');
  });
});

describe('createCaller', () => {
  it('calls public procedures', async () => {
    const caller = createCaller();
    const result = await caller.healthcheck();
    expect(result.status).toBe('ok');
  });

  it('throws UNAUTHORIZED for protected procedures without auth', async () => {
    const caller = createCaller();
    await expect(caller.auth.me()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns profile when authenticated', async () => {
    const caller = createCaller({
      user: mockAuth.user,
      profile: mockAuth.profile,
    });
    const result = await caller.auth.me();
    expect(result.profile.role).toBe('shop_owner');
    expect(result.user.id).toBe('user-1');
  });
});
