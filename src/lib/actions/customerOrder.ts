'use server';

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

  const supabase = await createServerSupabaseClient();

  try {
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Vui lòng đăng nhập để đặt món');

    // Generate order number
    const { data: orderNum } = await supabase.rpc('generate_order_number', { p_shop_id: params.shopId });
    const orderNumber = orderNum || `#${Date.now().toString().slice(-3)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id: params.shopId,
        table_id: params.tableId,
        user_id: user.id,
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
      subtotal: item.unitPrice * item.quantity,
      note: item.note,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error('Lỗi khi thêm chi tiết đơn hàng');
    }

    // Auto-create membership if not exists
    const { data: existingMembership } = await supabase
      .from('user_shop_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('shop_id', params.shopId)
      .single();

    if (!existingMembership) {
      await supabase
        .from('user_shop_memberships')
        .insert({ user_id: user.id, shop_id: params.shopId });
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
