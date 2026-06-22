import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import { router, publicProcedure, shopOwnerProcedure, middleware } from '../trpc';
import { ownsShop } from '../middleware/rbac';
import { createOrderSchema, updateOrderStatusSchema } from '@dilinh/validation';
import { calculatePoints, determineRank } from '../../utils/points';

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['completed'],
};

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

async function completeOrderInternal(supabase: any, order: any) {
  try {
    if (order.status === 'completed') {
      return { success: false, error: 'Đơn hàng đã được hoàn thành trước đó' };
    }

    const loyaltyConfig = order.shops?.loyalty_config;
    const earnedPoints = loyaltyConfig ? calculatePoints(loyaltyConfig, order.subtotal) : 0;

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_earned: earnedPoints,
      })
      .eq('id', order.id);

    if (orderUpdateError) throw orderUpdateError;

    // Process loyalty points if customer is logged in
    if (earnedPoints > 0 && order.user_id) {
      // Find or create membership
      let { data: membership, error: memberError } = await supabase
        .from('user_shop_memberships')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('shop_id', order.shop_id)
        .single();

      let currentRankingPoints = 0;
      let currentRedeemablePoints = 0;

      if (memberError || !membership) {
        const { data: newMembership, error: insertMemError } = await supabase
          .from('user_shop_memberships')
          .insert({
            user_id: order.user_id,
            shop_id: order.shop_id,
            ranking_points: 0,
            redeemable_points: 0,
          })
          .select()
          .single();
        if (insertMemError) throw insertMemError;
        membership = newMembership;
      } else {
        currentRankingPoints = membership.ranking_points;
        currentRedeemablePoints = membership.redeemable_points;
      }

      const newRankingPoints = currentRankingPoints + earnedPoints;
      const newRedeemablePoints = currentRedeemablePoints + earnedPoints;
      const newRank = loyaltyConfig ? determineRank(loyaltyConfig, newRankingPoints) : membership.rank;

      const { error: updateMemError } = await supabase
        .from('user_shop_memberships')
        .update({
          ranking_points: newRankingPoints,
          redeemable_points: newRedeemablePoints,
          rank: newRank,
          total_spent: (membership?.total_spent || 0) + order.total,
          order_count: (membership?.order_count || 0) + 1,
          last_order_at: new Date().toISOString(),
        })
        .eq('id', membership.id);

      if (updateMemError) throw updateMemError;

      // Create log transaction
      const { error: txError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: order.user_id,
          shop_id: order.shop_id,
          order_id: order.id,
          type: 'earn',
          ranking_points_delta: earnedPoints,
          redeemable_points_delta: earnedPoints,
          ranking_points_after: newRankingPoints,
          redeemable_points_after: newRedeemablePoints,
          description: `Tích điểm đơn hàng ${order.order_number}`,
        });

      if (txError) throw txError;
    }

    return { success: true, earnedPoints };
  } catch (err: any) {
    console.error('Error in completeOrderInternal:', err);
    return { success: false, error: err.message };
  }
}

export const orderRouter = router({
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const client = getSupabaseAdmin() || ctx.supabase;
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;

      // 1. Generate order number
      const { data: orderNum } = await client.rpc('generate_order_number', {
        p_shop_id: input.shopId,
      });
      const orderNumber = orderNum || `#${Date.now().toString().slice(-3)}`;

      const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const total = subtotal;

      // 2. Insert order
      const { data: order, error: orderError } = await client
        .from('orders')
        .insert({
          shop_id: input.shopId,
          table_id: input.tableId || null,
          user_id: userId,
          order_type: input.orderType,
          order_number: orderNumber,
          subtotal,
          discount_amount: 0,
          discount_type: null,
          total,
          status: 'pending',
          customer_note: input.customerNote || null,
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: orderError?.message || 'Lỗi tạo đơn hàng',
        });
      }

      // 3. Insert order items
      const orderItems = input.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
        note: item.note || null,
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback
        await client.from('orders').delete().eq('id', order.id);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi khi thêm chi tiết đơn hàng',
        });
      }

      // 4. Auto-create membership if logged in and not exists
      if (userId) {
        const { data: existingMembership } = await client
          .from('user_shop_memberships')
          .select('id')
          .eq('user_id', userId)
          .eq('shop_id', input.shopId)
          .single();

        if (!existingMembership) {
          await client
            .from('user_shop_memberships')
            .insert({ user_id: userId, shop_id: input.shopId });
        }
      }

      return {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
      };
    }),

  list: shopOwnerProcedure
    .use(middleware(ownsShop))
    .input(z.object({
      shopId: z.string().uuid(),
      limit: z.number().optional().default(200),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            note,
            menu_items(id, name, price)
          ),
          shop_tables(table_number, short_code),
          profiles(display_name, phone)
        `)
        .eq('shop_id', input.shopId)
        .order('created_at', { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      return data;
    }),

  updateStatus: shopOwnerProcedure
    .input(updateOrderStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch current order
      const { data: order, error: fetchError } = await ctx.supabase
        .from('orders')
        .select('*, shops(loyalty_config)')
        .eq('id', input.orderId)
        .single();

      if (fetchError || !order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Đơn hàng không tồn tại',
        });
      }

      // 2. RBAC check: Owner must own this shop, Platform Admin bypasses
      const profile = ctx.profile as { role: string } | undefined;
      if (profile?.role !== 'platform_admin') {
        const { data: shop } = await ctx.supabase
          .from('shops')
          .select('id')
          .eq('id', order.shop_id)
          .eq('owner_id', ctx.user.id)
          .single();

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Bạn không có quyền quản lý đơn hàng của shop này',
          });
        }
      }

      // 3. Validate status transitions
      const allowedNext = STATUS_FLOW[order.status];
      if (!allowedNext || !allowedNext.includes(input.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Không thể chuyển từ "${order.status}" sang "${input.status}"`,
        });
      }

      // 4. Complete order flow (points, ranks, status updates)
      if (input.status === 'completed') {
        const result = await completeOrderInternal(ctx.supabase, order);
        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Lỗi khi hoàn thành đơn hàng',
          });
        }
        return { success: true, earnedPoints: result.earnedPoints };
      }

      // 5. General status updates
      const updateData: Record<string, any> = { status: input.status };
      if (input.status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error: updateError } = await ctx.supabase
        .from('orders')
        .update(updateData)
        .eq('id', input.orderId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        });
      }

      return { success: true };
    }),
});
