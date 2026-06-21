import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';

interface AuthUser {
  id: string;
  email?: string;
}

interface AuthProfile {
  id: string;
  role: string;
  display_name: string;
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

export const isAuthenticated = middleware(async ({ ctx, next }) => {
  const ctxAuth = ctx as TRPCContext & { user?: AuthUser; profile?: AuthProfile };
  const user = ctxAuth.user ?? (await ctx.supabase.auth.getUser()).data.user;
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' });
  }
  const profile = ctxAuth.profile ?? (await ctx.supabase.from('profiles').select('id, role, display_name').eq('id', user.id).single()).data as AuthProfile | null;
  return next({ ctx: { ...ctx, user, profile } });
});

export const protectedProcedure = publicProcedure.use(isAuthenticated);
