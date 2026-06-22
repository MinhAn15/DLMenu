import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createCategorySchema, updateCategorySchema, createMenuItemSchema } from '@dilinh/validation';

export const menuRouter = router({
  getCategories: publicProcedure
    .input(z.object({ shopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('menu_categories')
        .select('*')
        .eq('shop_id', input.shopId)
        .order('sort_order');
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from('menu_categories')
        .select('sort_order')
        .eq('shop_id', input.shopId)
        .order('sort_order', { ascending: false })
        .limit(1);
      const nextSort = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;
      const { data, error } = await ctx.supabase
        .from('menu_categories')
        .insert({ shop_id: input.shopId, name: input.name, description: input.description ?? null, sort_order: nextSort })
        .select()
        .single();
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const dbUpdates: Record<string, any> = {};
      if (input.name !== undefined) dbUpdates.name = input.name;
      if (input.description !== undefined) dbUpdates.description = input.description;
      if (input.isActive !== undefined) dbUpdates.is_active = input.isActive;
      const { error } = await ctx.supabase
        .from('menu_categories')
        .update(dbUpdates)
        .eq('id', input.id);
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('menu_categories')
        .delete()
        .eq('id', input.id);
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),

  getMenuItems: publicProcedure
    .input(z.object({ shopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('menu_items')
        .select('*')
        .eq('shop_id', input.shopId)
        .order('sort_order');
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  createMenuItem: protectedProcedure
    .input(createMenuItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from('menu_items')
        .select('sort_order')
        .eq('shop_id', input.shopId)
        .order('sort_order', { ascending: false })
        .limit(1);
      const nextSort = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;
      const { data, error } = await ctx.supabase
        .from('menu_items')
        .insert({
          shop_id: input.shopId,
          category_id: input.categoryId ?? null,
          name: input.name,
          price: input.price,
          description: input.description ?? null,
          image_url: input.imageUrl ?? null,
          tags: input.tags ?? [],
          sort_order: nextSort,
        })
        .select()
        .single();
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  updateMenuItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      categoryId: z.string().nullable().optional(),
      price: z.number().positive().optional(),
      description: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbUpdates: Record<string, any> = {};
      if (input.name !== undefined) dbUpdates.name = input.name;
      if (input.categoryId !== undefined) dbUpdates.category_id = input.categoryId;
      if (input.price !== undefined) dbUpdates.price = input.price;
      if (input.description !== undefined) dbUpdates.description = input.description;
      if (input.imageUrl !== undefined) dbUpdates.image_url = input.imageUrl;
      if (input.isAvailable !== undefined) dbUpdates.is_available = input.isAvailable;
      if (input.isFeatured !== undefined) dbUpdates.is_featured = input.isFeatured;
      const { error } = await ctx.supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', input.id);
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),

  deleteMenuItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('menu_items')
        .delete()
        .eq('id', input.id);
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),
});
