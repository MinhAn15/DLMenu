import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, adminProcedure } from '../trpc';

export const adminRouter = router({
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
