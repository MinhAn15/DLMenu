'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculatePoints, determineRank } from '@/lib/utils/points';

type ActionResult = { success: boolean; error?: string; earnedPoints?: number };

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['completed'],
};

async function completeOrder(orderId: string): Promise<ActionResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, shops(loyalty_config)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) throw new Error('Đơn hàng không tồn tại');
    if (order.status === 'completed') {
      return { success: false, error: 'Đơn hàng đã được hoàn thành trước đó' };
    }

    const loyaltyConfig = order.shops?.loyalty_config;
    const earnedPoints = loyaltyConfig ? calculatePoints(loyaltyConfig, order.subtotal) : 0;

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_earned: earnedPoints,
      })
      .eq('id', order.id);

    if (orderUpdateError) throw orderUpdateError;

    if (earnedPoints > 0 && order.user_id) {
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
    return { success: false, error: err.message };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<ActionResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();

  try {
    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, shop_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) throw new Error('Đơn hàng không tồn tại');

    // Validate status flow
    const allowedNext = STATUS_FLOW[order.status];
    if (!allowedNext || !allowedNext.includes(newStatus)) {
      throw new Error(`Không thể chuyển từ "${order.status}" sang "${newStatus}"`);
    }

    // If completing, use the full completeOrder flow (with points)
    if (newStatus === 'completed') {
      return await completeOrder(orderId);
    }

    // Build update
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'confirmed') updateData.confirmed_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
