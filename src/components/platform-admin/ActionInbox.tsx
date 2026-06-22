'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useShopContext } from '@/hooks/useShopContext';
import { Store, MessageSquare, AlertTriangle, TrendingUp, Clock, ArrowRight } from 'lucide-react';

interface InboxItem {
  id: string;
  shopId: string;
  shopName: string;
  shopColor: string;
  priority: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  agent?: string;
}

const PRIORITY_CONFIG = {
  urgent: { dot: 'bg-red-500', label: 'Khẩn', bg: 'bg-red-50 border-red-100', icon: AlertTriangle },
  warning: { dot: 'bg-amber-500', label: 'Cảnh báo', bg: 'bg-amber-50 border-amber-100', icon: Clock },
  info: { dot: 'bg-blue-500', label: 'Đề xuất', bg: 'bg-blue-50 border-blue-100', icon: TrendingUp },
};

function generateMockInbox(shops: any[]): InboxItem[] {
  const items: InboxItem[] = [];
  const now = Date.now();

  for (const shop of shops) {
    if (!shop.is_active) {
      items.push({
        id: `inbox-${shop.id}-1`,
        shopId: shop.id,
        shopName: shop.name,
        shopColor: shop.theme_config?.primary_color || '#6B4226',
        priority: 'warning',
        title: 'Quán tạm ngưng hoạt động',
        description: `Chủ quán cần được liên hệ để kích hoạt lại — đã ngưng ${Math.floor((now - new Date(shop.updated_at || shop.created_at).getTime()) / 86400000)} ngày`,
        timestamp: new Date(shop.updated_at || shop.created_at).toISOString(),
        agent: 'Hệ thống tự động',
      });
    }
    if (shop.subscription_tier === 'free') {
      items.push({
        id: `inbox-${shop.id}-2`,
        shopId: shop.id,
        shopName: shop.name,
        shopColor: shop.theme_config?.primary_color || '#6B4226',
        priority: 'info',
        title: 'Đề xuất nâng cấp lên Pro',
        description: `${shop.name} đang dùng gói Free — ước tính doanh thu phù hợp để nâng cấp`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        agent: 'Phân tích tự động',
      });
    }
    if (shop.subscription_tier === 'pro') {
      items.push({
        id: `inbox-${shop.id}-3`,
        shopId: shop.id,
        shopName: shop.name,
        shopColor: shop.theme_config?.primary_color || '#6B4226',
        priority: 'urgent',
        title: 'Tier Pro sắp hết hạn',
        description: `Gói Pro của ${shop.name} sắp hết hạn — cần gia hạn để tránh gián đoạn dịch vụ`,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      });
    }
    items.push({
      id: `inbox-${shop.id}-4`,
      shopId: shop.id,
      shopName: shop.name,
      shopColor: shop.theme_config?.primary_color || '#6B4226',
      priority: 'info',
      title: 'Cập nhật thông tin quán',
      description: `Số điện thoại và địa chỉ của ${shop.name} chưa được xác nhận`,
      timestamp: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 7 + 1)).toISOString(),
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function ActionInbox() {
  const { data: shops = [] } = trpc.admin.getShops.useQuery();
  const { setSelectedShopId } = useShopContext();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'warning' | 'info'>('all');

  const inboxItems = useMemo(() => generateMockInbox(shops), [shops]);

  const filtered = filter === 'all' ? inboxItems : inboxItems.filter(i => i.priority === filter);

  const counts = useMemo(() => ({
    all: inboxItems.length,
    urgent: inboxItems.filter(i => i.priority === 'urgent').length,
    warning: inboxItems.filter(i => i.priority === 'warning').length,
    info: inboxItems.filter(i => i.priority === 'info').length,
  }), [inboxItems]);

  if (inboxItems.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Không có gì cần xử lý</h3>
        <p className="text-gray-500">Hôm nay yên tĩnh — tất cả quán đều hoạt động tốt</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-gray-100">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Hôm nay cần xử lý</h3>
          <p className="text-sm text-gray-500 mt-0.5">{counts.all} việc cần làm</p>
        </div>
        <Link href="/platform-admin/shops?filter=needing-action" className="text-sm text-amber-600 font-semibold hover:underline flex items-center gap-1">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>

      <div className="px-6 py-3 flex gap-2 flex-wrap border-b border-gray-100">
        {(['all', 'urgent', 'warning', 'info'] as const).map(p => {
          const label = p === 'all' ? 'Tất cả' : PRIORITY_CONFIG[p].label;
          const count = counts[p];
          const isActive = filter === p;
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
                isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[p].dot}`} />}
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.map(item => {
          const config = PRIORITY_CONFIG[item.priority];
          const Icon = config.icon;
          return (
            <div key={item.id} className={`p-5 transition-colors hover:bg-gray-50`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}
                  style={{ background: item.shopColor + '20' }}>
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{item.shopName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg.split(' ')[0]} ${config.bg.split(' ')[1]}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href={`/platform-admin/shops/${item.shopId}`}
                      onClick={() => setSelectedShopId(item.shopId)}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <Store size={14} /> Mở shop
                    </Link>
                    {item.priority !== 'info' && (
                      <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <MessageSquare size={14} /> Soạn phản hồi
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {item.agent && (
                    <p className="text-[10px] text-gray-400 mb-1">{item.agent}</p>
                  )}
                  <p className="text-[10px] text-gray-400">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length < inboxItems.length && (
        <div className="p-4 text-center">
          <p className="text-xs text-gray-400">
            Hiển thị {filtered.length} / {inboxItems.length} ·{' '}
            <button onClick={() => setFilter('all')} className="text-amber-600 font-semibold hover:underline">
              Xem tất cả
            </button>
          </p>
        </div>
      )}
    </Card>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
