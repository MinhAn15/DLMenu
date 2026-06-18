'use client';

import React from 'react';
import { useShopContext, filterByShop } from '@/hooks/useShopContext';
import { useAdminData } from '@/hooks/useAdminData';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatVND } from '@/lib/utils/format';

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: string; trend?: string }) {
  return (
    <Card style={{ padding: 'var(--space-5)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 font-medium mt-1">{trend}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </Card>
  );
}

export default function PlatformDashboardPage() {
  const { selectedShopId } = useShopContext();
  const { shops: dbShops, items: dbItems, tables: dbTables, orders: dbOrders } = useAdminData();

  const shops = selectedShopId === 'all' ? dbShops : dbShops.filter(s => s.id === selectedShopId);
  const items = filterByShop(dbItems, selectedShopId);
  const tables = filterByShop(dbTables, selectedShopId);
  
  // Real orders based on selected shop
  const filteredOrders = selectedShopId === 'all' ? dbOrders : dbOrders.filter(o => o.shop_id === selectedShopId);

  const activeShops = shops.filter(s => s.is_active).length;
  const totalItems = items.length;
  const totalTables = tables.length;
  const activeTables = tables.filter(t => t.is_active).length;

  // Real revenue data from filteredOrders
  const mockTotalRevenue = filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
  
  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mockTodayOrders = filteredOrders.filter(o => new Date(o.created_at).getTime() >= today.getTime()).length;

  const tierCounts = {
    free: shops.filter(s => s.subscription_tier === 'free').length,
    pro: shops.filter(s => s.subscription_tier === 'pro').length,
    premium: shops.filter(s => s.subscription_tier === 'premium').length,
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tổng quan Hệ thống 🎛️
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {selectedShopId === 'all' ? 'Dữ liệu toàn platform' : `Đang xem: ${shops[0]?.name}`} · Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng số quán" value={`${activeShops}/${shops.length}`} icon="🏪" trend={`${activeShops} đang hoạt động`} />
        <StatCard title="Doanh thu hôm nay" value={formatVND(mockTotalRevenue)} icon="💰" trend="+12% so với hôm qua" />
        <StatCard title="Đơn hàng hôm nay" value={String(mockTodayOrders)} icon="🛒" />
        <StatCard title="Tổng món ăn" value={String(totalItems)} icon="🍽️" />
      </div>

      {/* Two columns: Shops list + Tier breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop list */}
        <div className="lg:col-span-2">
          <Card style={{ padding: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Danh sách Quán</h3>
              <a href="/platform-admin/shops" className="text-sm text-amber-600 font-semibold hover:underline">Xem tất cả →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                    <th className="pb-3 font-semibold">Tên quán</th>
                    <th className="pb-3 font-semibold">Gói</th>
                    <th className="pb-3 font-semibold">Trạng thái</th>
                    <th className="pb-3 font-semibold text-right">Bàn</th>
                    <th className="pb-3 font-semibold text-right">Món</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shops.map(shop => {
                    const shopTables = tables.filter(t => t.shop_id === shop.id);
                    const shopItems = items.filter(i => i.shop_id === shop.id);
                    return (
                      <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: shop.theme_config.primary_color }}>
                              {shop.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{shop.name}</p>
                              <p className="text-xs text-gray-400">/{shop.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={shop.subscription_tier === 'premium' ? 'warning' : shop.subscription_tier === 'pro' ? 'info' : 'default'}
                            size="sm"
                          >
                            {shop.subscription_tier.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={shop.is_active ? 'success' : 'error'} size="sm">
                            {shop.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-gray-600">{shopTables.length}</td>
                        <td className="py-3 text-right text-gray-600">{shopItems.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Tier breakdown */}
        <div>
          <Card style={{ padding: 'var(--space-6)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Gói cước</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Free', count: tierCounts.free, color: '#9CA3AF', percent: Math.round((tierCounts.free / shops.length) * 100) || 0 },
                { label: 'Pro', count: tierCounts.pro, color: '#3B82F6', percent: Math.round((tierCounts.pro / shops.length) * 100) || 0 },
                { label: 'Premium', count: tierCounts.premium, color: '#F59E0B', percent: Math.round((tierCounts.premium / shops.length) * 100) || 0 },
              ].map(tier => (
                <div key={tier.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{tier.label}</span>
                    <span className="text-gray-500">{tier.count} quán</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${tier.percent}%`, background: tier.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Tóm tắt Bàn</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng bàn</span>
                <span className="font-bold">{totalTables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đang hoạt động</span>
                <span className="font-bold text-green-600">{activeTables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đã tắt</span>
                <span className="font-bold text-red-500">{totalTables - activeTables}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
