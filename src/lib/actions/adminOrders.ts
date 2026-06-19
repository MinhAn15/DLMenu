'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AdminOrderWithDetails {
  id: string;
  shop_id: string;
  table_id: string | null;
  user_id: string;
  order_type: 'dine_in' | 'takeaway';
  order_number: string;
  subtotal: number;
  discount_amount: number;
  discount_type: string | null;
  total: number;
  points_earned: number;
  status: string;
  customer_note: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    note: string | null;
    menu_items?: { id: string; name: string; price: number } | null;
  }[];
  shop_tables?: { table_number: number; short_code: string } | null;
  profiles?: { display_name: string | null; phone: string | null } | null;
}

/**
 * Server action: fetch all orders across shops for platform admin.
 * RLS gate via migration 007 (`orders_admin_all`) — non-admin returns [].
 * Joins order_items, shop_tables (for table_number), profiles (for customer name/phone).
 */
export async function getAdminOrders(limit: number = 200): Promise<AdminOrderWithDetails[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(id, quantity, unit_price, subtotal, note, menu_items(id, name, price)),
      shop_tables(table_number, short_code),
      profiles(display_name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getAdminOrders error:', error); return []; }
  return (data || []) as AdminOrderWithDetails[];
}
