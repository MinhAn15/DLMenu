import { router } from '../trpc';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { menuRouter } from './menu';
import { orderRouter } from './order';

export const appRouter = router({
  healthcheck: healthRouter.healthcheck,
  auth: authRouter,
  menu: menuRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
