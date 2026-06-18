'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function createOrder(params: {
  shopId: string;
  tableId: string | null;
  items: { menuItemId: string; quantity: number; unitPrice: number; note: string | null }[];
  subtotal: number;
  discountAmount: number;
  discountType: string | null;
  total: number;
  orderType: 'dine_in' | 'takeaway';
  customerNote: string | null;
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    await new Promise(r => setTimeout(r, 800));
    return {
      success: true,
      data: {
        id: `order-${Date.now()}`,
        order_number: `#${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        total: params.total,
        points_earned: Math.floor(params.subtotal / 10000),
      },
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    // Get user if authenticated from standard server client
    const supabaseAuth = await createServerSupabaseClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const userId = user ? user.id : null;

    // Generate order number using admin client
    const { data: orderNum } = await supabaseAdmin.rpc('generate_order_number', { p_shop_id: params.shopId });
    const orderNumber = orderNum || `#${Date.now().toString().slice(-3)}`;

    // Create order using admin client to bypass RLS
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        shop_id: params.shopId,
        table_id: params.tableId,
        user_id: userId,
        order_type: params.orderType,
        order_number: orderNumber,
        subtotal: params.subtotal,
        discount_amount: params.discountAmount,
        discount_type: params.discountType,
        total: params.total,
        status: 'pending',
        customer_note: params.customerNote,
      })
      .select()
      .single();

    if (orderError || !order) throw new Error(orderError?.message || 'Lỗi tạo đơn hàng');

    // Create order items
    const orderItems = params.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      note: item.note,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback: delete the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw new Error('Lỗi khi thêm chi tiết đơn hàng');
    }

    // Auto-create membership if not exists (only if logged in)
    if (userId) {
      const { data: existingMembership } = await supabaseAdmin
        .from('user_shop_memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('shop_id', params.shopId)
        .single();

      if (!existingMembership) {
        await supabaseAdmin
          .from('user_shop_memberships')
          .insert({ user_id: userId, shop_id: params.shopId });
      }
    }

    return {
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        points_earned: 0, // Points earned when completed
      },
    };
  } catch (err: any) {
    console.error('Create order error:', err);
    return { success: false, error: err.message };
  }
}
