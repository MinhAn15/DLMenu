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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>
          Xin chào, {shop?.name || 'Admin'} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <StatCard title="Doanh thu hôm nay" value={formatVND(todayRevenue)} icon="💰" />
        <StatCard title="Đơn hôm nay" value={String(todayOrders.length)} icon="🛒" />
        <StatCard title="Đang xử lý" value={String(pendingOrders.length)} icon="⏳" />
        <StatCard title="Tổng đơn" value={String(orders.length)} icon="📋" />
      </div>

      {/* Recent Orders */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Đơn hàng gần đây</span>
          <a href="/admin/orders" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>Xem tất cả →</a>
        </h3>

        {recentOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>
            Chưa có đơn hàng nào
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentOrders.map(order => (
              <div key={order.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', minWidth: '48px' }}>
                    {order.order_number}
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                      {order.shop_tables ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                      {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600 }}>{formatVND(order.total)}</span>
                  <Badge style={{ backgroundColor: ORDER_STATUS_COLORS[order.status], color: 'white', fontSize: '0.65rem' }}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { href: '/admin/menu', icon: '🍔', label: 'Quản lý Thực đơn', desc: 'Thêm/sửa/xóa món' },
          { href: '/admin/tables', icon: '📱', label: 'Mã QR & Bàn', desc: 'In QR cho từng bàn' },
          { href: '/admin/promotions', icon: '🎁', label: 'Khuyến mãi', desc: 'Tạo ưu đãi mới' },
          { href: '/admin/settings', icon: '⚙️', label: 'Cài đặt', desc: 'Thông tin & giao diện' },
        ].map(link => (
          <a key={link.href} href={link.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="hover-lift" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-2)' }}>{link.icon}</span>
              <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{link.label}</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{link.desc}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
