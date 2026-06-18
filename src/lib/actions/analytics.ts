'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getShopAnalytics(shopId: string, days: number = 7) {
  const supabase = await createServerSupabaseClient();
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Format dates for Supabase query (ISO strings)
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  try {
    // Fetch orders within date range (completed only for revenue, or all for order count)
    // We'll fetch all non-cancelled orders to get a full picture
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('shop_id', shopId)
      .neq('status', 'cancelled')
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .order('created_at', { ascending: true });

    if (ordersError) throw new Error(ordersError.message);

    // Calculate KPIs
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrdersCount = orders.length;
    const completedOrdersCount = completedOrders.length;
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

    // Calculate Time-series data (Daily Revenue)
    const dailyData: Record<string, number> = {};
    
    // Initialize all days in range with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    // Populate actual revenue
    completedOrders.forEach(order => {
      if (order.created_at) {
        const dateStr = order.created_at.split('T')[0];
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += Number(order.total);
        }
      }
    });

    const revenueChartData = Object.keys(dailyData).map(date => ({
      date: date.split('-').slice(1).join('/'), // Format MM/DD
      revenue: dailyData[date],
    }));

    // Fetch Top Selling Items
    // We'll query order_items joined with orders
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items ( name ),
        orders!inner ( shop_id, status, created_at )
      `)
      .eq('orders.shop_id', shopId)
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
      .map(name => ({
        name,
        sold: itemCounts[name],
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5); // Top 5

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalOrders: totalOrdersCount,
          completedOrders: completedOrdersCount,
          averageOrderValue,
        },
        revenueChart: revenueChartData,
        topItems: topItemsData,
      }
    };
  } catch (error: any) {
    console.error('getShopAnalytics error:', error);
    return { success: false, error: error.message };
  }
}
