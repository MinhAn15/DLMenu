import { router } from '../trpc';
import { authRouter } from './auth';
import { healthRouter } from './health';

export const appRouter = router({
  healthcheck: healthRouter.healthcheck,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
