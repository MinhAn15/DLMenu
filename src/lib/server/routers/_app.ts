import { router } from '../trpc';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { menuRouter } from './menu';
import { orderRouter } from './order';
import { adminRouter } from './admin';
import { shopRouter } from './shop';

export const appRouter = router({
  healthcheck: healthRouter.healthcheck,
  auth: authRouter,
  menu: menuRouter,
  order: orderRouter,
  admin: adminRouter,
  shop: shopRouter,
});

export type AppRouter = typeof appRouter;
