import { router, publicProcedure } from '../trpc';

export const healthRouter = router({
  healthcheck: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
  })),
});
