import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, shopOwnerProcedure, middleware } from '../trpc';
import { ownsShop } from '../middleware/rbac';
import { createPromotionSchema, togglePromotionSchema, toggleTableSchema } from '@dilinh/validation';

function generateShortCode(shopSlug: string, tableNum: number): string {
  const prefix = shopSlug.split('-').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3);
  return `${prefix}-${String(tableNum).padStart(2, '0')}`;
}

export const shopRouter = router({
  // ========== PROMOTIONS ==========
  promotions: router({
    list: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('promotions')
          .select('*')
          .eq('shop_id', input.shopId)
          .order('created_at', { ascending: false });
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    create: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(createPromotionSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('promotions')
          .insert({
            shop_id: input.shopId,
            name: input.name,
            description: input.description ?? null,
            type: input.type,
            discount_percent: input.discount_percent ?? null,
            discount_amount: input.discount_amount ?? null,
            starts_at: input.starts_at,
            ends_at: input.ends_at,
            max_uses: input.max_uses ?? null,
          })
          .select()
          .single();
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    delete: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('promotions')
          .delete()
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    toggle: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(togglePromotionSchema)
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('promotions')
          .update({ is_active: input.isActive })
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== SETTINGS ==========
  settings: router({
    updateInfo: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({
        shopId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().max(500).nullable().optional(),
        phone: z.string().max(20).optional(),
        address: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updates: Record<string, any> = { name: input.name, updated_at: new Date().toISOString() };
        if (input.description !== undefined) updates.description = input.description;
        if (input.phone !== undefined) updates.phone = input.phone;
        if (input.address !== undefined) updates.address = input.address;
        const { error } = await ctx.supabase
          .from('shops')
          .update(updates)
          .eq('id', input.shopId);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    updateTheme: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({
        shopId: z.string(),
        primaryColor: z.string(),
        font: z.string().optional(),
        bankId: z.string().optional(),
        accountNo: z.string().optional(),
        accountName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bankInfo = input.bankId && input.accountNo
          ? { bank_id: input.bankId, account_no: input.accountNo, account_name: input.accountName }
          : undefined;
        const themeConfig: any = { primary_color: input.primaryColor, font: input.font || 'Inter' };
        if (bankInfo) themeConfig.bank_info = bankInfo;
        const { error } = await ctx.supabase
          .from('shops')
          .update({ theme_config: themeConfig, updated_at: new Date().toISOString() })
          .eq('id', input.shopId);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== TABLES ==========
  tables: router({
    list: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('shop_tables')
          .select('*')
          .eq('shop_id', input.shopId)
          .order('table_number');
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    create: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string(), shopSlug: z.string(), tableNumber: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const shortCode = generateShortCode(input.shopSlug, input.tableNumber);
        const { data, error } = await ctx.supabase
          .from('shop_tables')
          .insert({ shop_id: input.shopId, table_number: input.tableNumber, short_code: shortCode })
          .select()
          .single();
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    delete: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('shop_tables')
          .delete()
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),

    toggle: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(toggleTableSchema)
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('shop_tables')
          .update({ is_active: input.isActive })
          .eq('id', input.id);
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return { success: true };
      }),
  }),

  // ========== ANALYTICS ==========
  analytics: router({
    get: shopOwnerProcedure
      .use(middleware(ownsShop))
      .input(z.object({ shopId: z.string(), days: z.number().int().min(1).max(365).optional().default(7) }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (input.days ?? 7));
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        try {
          const { data: orders, error: ordersError } = await ctx.supabase
            .from('orders')
            .select('id, total, status, created_at')
            .eq('shop_id', input.shopId)
            .neq('status', 'cancelled')
            .gte('created_at', startIso)
            .lte('created_at', endIso)
            .order('created_at', { ascending: true });

          if (ordersError) throw new Error(ordersError.message);

          const completedOrders = orders.filter(o => o.status === 'completed');
          const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
          const totalOrdersCount = orders.length;
          const completedOrdersCount = completedOrders.length;
          const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

          const dailyData: Record<string, number> = {};
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyData[d.toISOString().split('T')[0]] = 0;
          }
          completedOrders.forEach(order => {
            if (order.created_at) {
              const dateStr = order.created_at.split('T')[0];
              if (dailyData[dateStr] !== undefined) {
                dailyData[dateStr] += Number(order.total);
              }
            }
          });

          const revenueChartData = Object.keys(dailyData).map(date => ({
            date: date.split('-').slice(1).join('/'),
            revenue: dailyData[date],
          }));

          const { data: orderItems, error: itemsError } = await ctx.supabase
            .from('order_items')
            .select(`
              quantity,
              menu_items ( name ),
              orders!inner ( shop_id, status, created_at )
            `)
            .eq('orders.shop_id', input.shopId)
            .eq('orders.status', 'completed')
            .gte('orders.created_at', startIso)
            .lte('orders.created_at', endIso);

          if (itemsError) throw new Error(itemsError.message);

          const itemCounts: Record<string, number> = {};
          orderItems.forEach((item: any) => {
            const itemName = item.menu_items?.name;
            if (itemName) {
              itemCounts[itemName] = (itemCounts[itemName] || 0) + Number(item.quantity);
            }
          });

          const topItemsData = Object.keys(itemCounts)
            .map(name => ({ name, sold: itemCounts[name] }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

          return {
            kpis: { totalRevenue, totalOrders: totalOrdersCount, completedOrders: completedOrdersCount, averageOrderValue },
            revenueChart: revenueChartData,
            topItems: topItemsData,
          };
        } catch (error: any) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
      }),
  }),
});
