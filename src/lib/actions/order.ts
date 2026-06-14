'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculatePoints, determineRank } from '@/lib/utils/points';

export async function completeOrder(orderId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { success: true, earnedPoints: 150 };
  }

  const supabase = await createServerSupabaseClient();

  try {
    // 1. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, shops(loyalty_config), profiles(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error('Order not found');
    if (order.status === 'completed') throw new Error('Order already completed');

    // @ts-ignore
    const loyaltyConfig = order.shops.loyalty_config;

    // 2. Calculate points based on total amount (or subtotal depending on policy)
    // Here we use subtotal for points calculation as usually discounts don't give points
    const earnedPoints = calculatePoints(loyaltyConfig, order.subtotal);

    // 3. Begin "Transaction" (Using RPC in production, but here we do sequential updates)
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_earned: earnedPoints,
      })
      .eq('id', orderId);

    // If order earned points, process membership updates
    if (earnedPoints > 0) {
      // Get current membership
      let { data: membership } = await supabase
        .from('user_shop_memberships')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('shop_id', order.shop_id)
        .single();

      let currentRankingPoints = 0;
      let currentRedeemablePoints = 0;

      if (!membership) {
        // Create new membership
        const { data: newMembership } = await supabase
          .from('user_shop_memberships')
          .insert({
            user_id: order.user_id,
            shop_id: order.shop_id,
            ranking_points: 0,
            redeemable_points: 0,
          })
          .select()
          .single();
        membership = newMembership;
      } else {
        currentRankingPoints = membership.ranking_points;
        currentRedeemablePoints = membership.redeemable_points;
      }

      // Calculate new totals
      const newRankingPoints = currentRankingPoints + earnedPoints;
      const newRedeemablePoints = currentRedeemablePoints + earnedPoints;
      
      // Determine new rank
      const newRank = determineRank(loyaltyConfig, newRankingPoints);

      // Update membership
      await supabase
        .from('user_shop_memberships')
        .update({
          ranking_points: newRankingPoints,
          redeemable_points: newRedeemablePoints,
          rank: newRank,
          total_spent: (membership?.total_spent || 0) + order.total,
          order_count: (membership?.order_count || 0) + 1,
          last_order_at: new Date().toISOString(),
        })
        .eq('id', membership!.id);

      // Log transaction
      await supabase
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
    }

    return { success: true, earnedPoints };
  } catch (error: any) {
    console.error('Complete order error:', error);
    return { success: false, error: error.message };
  }
}
