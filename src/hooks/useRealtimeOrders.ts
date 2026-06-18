'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import type { Order, OrderItem, MenuItem, ShopTable, Profile } from '@/lib/types/database';

export interface OrderWithDetails extends Order {
  order_items?: (OrderItem & { menu_items?: MenuItem })[];
  shop_tables?: ShopTable;
  profiles?: Profile;
}

export function useRealtimeOrders(shopId: string | undefined) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await new Promise(r => setTimeout(r, 300));
      // Mock orders for development
      const now = new Date().toISOString();
      setOrders([
        {
          id: 'o1', shop_id: shopId, table_id: 't1', user_id: 'u1',
          order_type: 'dine_in', order_number: '#001', subtotal: 150000,
          discount_amount: 0, discount_type: null, total: 150000, points_earned: 15,
          status: 'pending', customer_note: 'Ít đá', created_at: now,
          confirmed_at: null, completed_at: null,
          shop_tables: { id: 't1', shop_id: shopId, table_number: 1, short_code: 'QCM-01', qr_url: null, is_active: true, created_at: now },
          order_items: [
            { id: 'oi1', order_id: 'o1', menu_item_id: 'i1', quantity: 2, unit_price: 25000, subtotal: 50000, note: null, created_at: now, menu_items: { id: 'i1', shop_id: shopId, category_id: 'c1', name: 'Cà phê Sữa Đá', description: null, price: 25000, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: now, updated_at: now } },
            { id: 'oi2', order_id: 'o1', menu_item_id: 'i3', quantity: 2, unit_price: 35000, subtotal: 70000, note: 'Ít đường', created_at: now, menu_items: { id: 'i3', shop_id: shopId, category_id: 'c2', name: 'Trà Đào Cam Sả', description: null, price: 35000, image_url: null, is_available: true, is_featured: true, sort_order: 1, tags: [], created_at: now, updated_at: now } },
          ],
        },
        {
          id: 'o2', shop_id: shopId, table_id: 't2', user_id: 'u2',
          order_type: 'dine_in', order_number: '#002', subtotal: 85000,
          discount_amount: 0, discount_type: null, total: 85000, points_earned: 8,
          status: 'preparing', customer_note: null, created_at: new Date(Date.now() - 600000).toISOString(),
          confirmed_at: new Date(Date.now() - 300000).toISOString(), completed_at: null,
          shop_tables: { id: 't2', shop_id: shopId, table_number: 2, short_code: 'QCM-02', qr_url: null, is_active: true, created_at: now },
          order_items: [
            { id: 'oi3', order_id: 'o2', menu_item_id: 'i4', quantity: 1, unit_price: 45000, subtotal: 45000, note: null, created_at: now, menu_items: { id: 'i4', shop_id: shopId, category_id: 'c3', name: 'Bánh Tiramisu', description: null, price: 45000, image_url: null, is_available: true, is_featured: false, sort_order: 1, tags: [], created_at: now, updated_at: now } },
          ],
        },
        {
          id: 'o3', shop_id: shopId, table_id: null, user_id: 'u3',
          order_type: 'takeaway', order_number: '#003', subtotal: 320000,
          discount_amount: 16000, discount_type: 'rank_gold_5%', total: 304000, points_earned: 32,
          status: 'completed', customer_note: null, created_at: new Date(Date.now() - 3600000).toISOString(),
          confirmed_at: new Date(Date.now() - 3000000).toISOString(), completed_at: new Date(Date.now() - 1800000).toISOString(),
          order_items: [],
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, menu_items(*)),
          shop_tables(*),
          profiles(*)
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data || []) as OrderWithDetails[]);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId, supabase]);

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Polling every 15 seconds (Fallback / Sync)
    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const { playDingDong } = useNotificationSound();

  // Realtime subscription
  useEffect(() => {
    if (!shopId || process.env.NEXT_PUBLIC_USE_MOCK === 'true') return;

    const channel = supabase
      .channel(`orders-${shopId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            if (newOrder.status === 'pending') {
              playDingDong();
            }
            toast.success(`🔔 Đơn hàng mới: ${newOrder.order_number}`, {
              duration: 5000,
              icon: '🔔',
            });
          }
          // Fetch lại để update giao diện
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, supabase, fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}
