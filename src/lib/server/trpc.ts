import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';
import { hasRole } from './middleware/rbac';

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
  const ctxAuth = ctx as TRPCContext & { 
    user?: AuthUser; 
    profile?: AuthProfile | null; 
    headers?: Headers | null; 
  };
  const user = ctxAuth.user ?? (await ctx.supabase.auth.getUser()).data.user;
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' });
  }

  const roleHeader = ctxAuth.headers?.get ? ctxAuth.headers.get('x-user-role') : undefined;
  let profile = ctxAuth.profile;

  if (!profile) {
    if (roleHeader) {
      profile = {
        id: user.id,
        role: roleHeader,
        display_name: user.email || 'Cached User',
      } as AuthProfile;
    } else {
      const { data } = await ctx.supabase
        .from('profiles')
        .select('id, role, display_name')
        .eq('id', user.id)
        .single();
      profile = data as AuthProfile | null;
    }
  }

  return next({ ctx: { ...ctx, user, profile } });
});

export const protectedProcedure = publicProcedure.use(isAuthenticated);

/** Platform admin only — rejects all non-admin roles */
export const adminProcedure = protectedProcedure.use(middleware(hasRole('platform_admin')));

/** Shop owner or platform admin — rejects customer role */
export const shopOwnerProcedure = protectedProcedure.use(middleware(hasRole('shop_owner', 'platform_admin')));

