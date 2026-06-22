import { TRPCError } from '@trpc/server';
import type { UserRole } from '@dilinh/types';

/**
 * RBAC Middleware: hasRole
 *
 * Factory function tạo middleware kiểm tra role.
 * Chạy SAU isAuthenticated — ctx.profile đã có sẵn.
 * Không import middleware từ trpc.ts để tránh circular dependency.
 * Trả về MiddlewareFunction tương thích với tRPC .use()
 *
 * @example
 *   protectedProcedure.use(hasRole('platform_admin'))
 *   protectedProcedure.use(hasRole('shop_owner', 'platform_admin'))
 */
export const hasRole = (...roles: UserRole[]) =>
  async ({ ctx, next }: { ctx: any; next: (opts?: any) => Promise<any> }) => {
    const profile = ctx.profile as { role: UserRole } | null;

    if (!profile || !roles.includes(profile.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Bạn cần quyền ${roles.join(' hoặc ')} để thực hiện hành động này`,
      });
    }

    return next({ ctx });
  };

/**
 * RBAC Middleware: ownsShop
 *
 * Kiểm tra user có phải owner của shop được request không.
 * Platform_admin bypass — có thể truy cập mọi shop.
 * Chạy SAU isAuthenticated — ctx.user + ctx.profile đã có sẵn.
 *
 * Lấy shopId từ input (getRawInput().shopId).
 *
 * @example
 *   protectedProcedure
 *     .use(ownsShop)
 *     .input(z.object({ shopId: z.string() }))
 *     .query(...)
 */
export const ownsShop = async ({
  ctx,
  next,
  getRawInput,
}: {
  ctx: any;
  next: (opts?: any) => Promise<any>;
  getRawInput: () => Promise<unknown>;
}) => {
  const user = ctx.user as { id: string } | undefined;
  const profile = ctx.profile as { role: UserRole; shop_id: string | null } | null;

  if (!user || !profile) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Vui lòng đăng nhập',
    });
  }

  // Platform admin bypass — có thể truy cập mọi shop
  if (profile.role === 'platform_admin') {
    return next({ ctx });
  }

  // Lấy shopId từ input
  const rawInput = (await getRawInput()) as { shopId?: string } | undefined;
  const shopId = rawInput?.shopId;

  if (!shopId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Thiếu shopId trong request',
    });
  }

  // Check ownership: so sánh profile.shop_id với shopId được request
  if (profile.shop_id !== shopId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Bạn không có quyền truy cập cửa hàng này',
    });
  }

  return next({ ctx });
};
