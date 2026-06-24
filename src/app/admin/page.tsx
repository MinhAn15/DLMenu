'use client';

import React from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import StatCard from '@/components/admin/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatVND } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const revenueData = [
  { name: 'T2', revenue: 1200000 },
  { name: 'T3', revenue: 1800000 },
  { name: 'T4', revenue: 1400000 },
  { name: 'T5', revenue: 2100000 },
  { name: 'T6', revenue: 1900000 },
  { name: 'T7', revenue: 3200000 },
  { name: 'CN', revenue: 3800000 },
];

const topItemsData = [
  { name: 'Cà phê Sữa Đá', value: 145 },
  { name: 'Trà Đào Cam Sả', value: 98 },
  { name: 'Bánh Tiramisu', value: 65 },
  { name: 'Trà Vải', value: 42 },
];
const COLORS = ['#F97316', '#FBBF24', '#34D399', '#60A5FA'];

export default function AdminDashboardPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const { orders, loading: ordersLoading } = useRealtimeOrders(shop?.id);

  if (shopLoading || ordersLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate stats from orders
  const todayOrders = orders.filter(o => {
    const created = new Date(o.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
  const recentOrders = orders.slice(0, 8);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Xin chào, {shop?.name || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium border border-amber-100 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          Hệ thống đang hoạt động
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Doanh thu hôm nay" value={formatVND(todayRevenue)} icon="💰" />
        <StatCard title="Đơn hôm nay" value={String(todayOrders.length)} icon="🛒" />
        <StatCard title="Đang xử lý" value={String(pendingOrders.length)} icon="⏳" />
        <StatCard title="Tổng đơn" value={String(orders.length)} icon="📋" />
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue Chart */}
        <Card variant="glass" className="hover-lift p-6 col-span-1 lg:col-span-2">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <span>📈</span> Biểu đồ doanh thu
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <RechartsTooltip 
                  formatter={(value) => [formatVND(Number(value) || 0), 'Doanh thu'] as [string, string]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Items Pie Chart */}
        <Card variant="glass" className="hover-lift p-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <span>🏆</span> Món bán chạy
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topItemsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {topItemsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card variant="glass" className="hover-lift p-6">
        <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2"><span>⚡</span> Đơn hàng gần đây</span>
          <a href="/admin/orders" className="text-sm text-[var(--color-primary)] font-semibold hover:underline">Xem tất cả →</a>
        </h3>

        {recentOrders.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] p-8">
            Chưa có đơn hàng nào
          </p>
        ) : (
          <div className="flex flex-col">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center py-3 border-b border-[var(--color-border-light)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[var(--color-primary)] min-w-[48px]">
                    {order.order_number}
                  </span>
                  <div>
                    <span className="font-semibold text-sm block">
                      {order.shop_tables ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatVND(order.total)}</span>
                  <Badge style={{ backgroundColor: ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS], color: 'white', fontSize: '0.65rem' }}>
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/menu', icon: '🍔', label: 'Thực đơn', desc: 'Thêm/sửa món' },
          { href: '/admin/tables', icon: '📱', label: 'QR & Bàn', desc: 'In mã QR' },
          { href: '/admin/promotions', icon: '🎁', label: 'Khuyến mãi', desc: 'Tạo ưu đãi' },
          { href: '/admin/settings', icon: '⚙️', label: 'Cài đặt', desc: 'Giao diện quán' },
        ].map(link => (
          <a key={link.href} href={link.href} className="no-underline text-inherit block">
            <Card variant="glass" className="hover-lift text-center cursor-pointer h-full p-4">
              <span className="text-3xl block mb-2">{link.icon}</span>
              <h4 className="font-heading font-bold text-sm mb-1">{link.label}</h4>
              <p className="text-xs text-[var(--color-text-muted)]">{link.desc}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
