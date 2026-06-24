import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, adminProcedure } from '../trpc';
// import { slugSchema } from '@dilinh/validation';

export const adminRouter = router({
  createShop: adminProcedure
    .input(z.object({ name: z.string().min(1).max(200), slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/) }))
    .mutation(async ({ ctx, input }) => {
      const { data: { user } } = await ctx.supabase.auth.getUser();

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' });
      }

      const { data, error } = await ctx.supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          name: input.name,
          slug: input.slug,
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Đường dẫn (slug) này đã tồn tại, vui lòng chọn tên khác.' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }

      await ctx.supabase
        .from('profiles')
        .update({ role: 'shop_owner' })
        .eq('id', user.id);

      return { success: true, shopId: data.id };
    }),

  getShops: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  getCategories: adminProcedure
    .input(z.object({ shopId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (input?.shopId) {
        query = query.eq('shop_id', input.shopId);
      }

      const { data, error } = await query;
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  getMenuItems: adminProcedure
    .input(z.object({ shopId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (input?.shopId) {
        const { data: cats } = await ctx.supabase
          .from('menu_categories')
          .select('id')
          .eq('shop_id', input.shopId);
        
        if (cats && cats.length > 0) {
          query = query.in('category_id', cats.map(c => c.id));
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  getTables: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('shop_tables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  getUsers: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('id, phone, display_name, role, created_at, avatar_url, last_login_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  getOrders: adminProcedure
    .input(z.object({ limit: z.number().optional().default(200) }).optional())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('orders')
        .select(`
          *,
          order_items(id, quantity, unit_price, subtotal, note, menu_items(id, name, price)),
          shop_tables(table_number, short_code),
          profiles(display_name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(input?.limit ?? 200);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),
});
