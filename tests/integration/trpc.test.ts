import { describe, it, expect } from 'vitest';
import { createCaller, mockAuth } from './helpers';

describe('tRPC public procedures', () => {
  it('healthcheck returns ok', async () => {
    const caller = createCaller();

    const result = await caller.healthcheck();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});

describe('tRPC protected procedures', () => {
  it('throws UNAUTHORIZED when no user', async () => {
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
    expect(result.profile.display_name).toBe('Test');
  });
});
