import { router } from '../trpc';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { menuRouter } from './menu';

export const appRouter = router({
  healthcheck: healthRouter.healthcheck,
  auth: authRouter,
  menu: menuRouter,
});

export type AppRouter = typeof appRouter;
