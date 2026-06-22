'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/hooks/useAdminData';
import Card from '@/components/ui/Card';
import { formatVND } from '@/lib/utils/format';
import { ArrowRight, ShoppingBag, TicketPercent, Settings, Download } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  shopName: string;
  shopColor: string;
  icon: React.ReactNode;
  description: string;
  detail?: string;
}

function generateMockActivity(orders: any[], shops: any[]): Activity[] {
  const items: Activity[] = [];
  const now = Date.now();

  for (const order of orders.slice(0, 5)) {
    const shop = shops.find(s => s.id === order.shop_id);
    items.push({
      id: `act-order-${order.id}`,
      time: order.created_at,
      shopName: shop?.name || '—',
      shopColor: shop?.theme_config?.primary_color || '#6B4226',
      icon: <ShoppingBag size={14} />,
      description: `+1 đơn mới`,
      detail: `${formatVND(order.total)} · ${order.shop_tables?.table_number ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'}`,
    });
  }

  for (const shop of shops) {
    if (shop.subscription_tier === 'free') {
      items.push({
        id: `act-tier-${shop.id}`,
        time: new Date(now - 86400000 * 2).toISOString(),
        shopName: shop.name,
        shopColor: shop.theme_config?.primary_color || '#6B4226',
        icon: <TicketPercent size={14} />,
        description: 'Tạo KM · Flash Sale 20%',
      });
    }
    if (!shop.is_active) {
      items.push({
        id: `act-config-${shop.id}`,
        time: new Date(now - 86400000 * 5).toISOString(),
        shopName: shop.name,
        shopColor: shop.theme_config?.primary_color || '#6B4226',
        icon: <Settings size={14} />,
        description: 'Cập nhật cấu hình quán',
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);
}

export default function ActivityFeed() {
  const { orders, shops } = useAdminData();

  const activities = useMemo(() => generateMockActivity(orders, shops), [orders, shops]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Hoạt động 24 giờ qua</h3>
        <Link href="/platform-admin/orders" className="text-sm text-amber-600 font-semibold hover:underline flex items-center gap-1">
          Xem nhật ký <ArrowRight size={14} />
        </Link>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">Chưa có hoạt động nào gần đây</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="flex flex-col gap-4">
            {activities.map((act, i) => (
              <div key={act.id} className="flex gap-4">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
                    style={{ borderColor: act.shopColor + '40' }}>
                    <span style={{ color: act.shopColor }}>{act.icon}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{act.shopName}</span>
                    <span className="text-xs text-gray-400">{formatTime(act.time)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{act.description}</p>
                  {act.detail && (
                    <p className="text-xs text-gray-400 mt-0.5">{act.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
