'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { completeOrder } from './order';

type ActionResult = { success: boolean; error?: string; earnedPoints?: number };

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['completed'],
};

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
    if (newStatus === 'cancelled') updateData.completed_at = new Date().toISOString();

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
