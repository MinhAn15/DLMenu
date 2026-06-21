'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminData } from '@/hooks/useAdminData';
import { formatVND } from '@/lib/utils/format';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Store, ShoppingBag, TrendingUp, Users, Activity } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'menu', label: 'Menu' },
  { id: 'promotions', label: 'Khuyến mãi' },
  { id: 'settings', label: 'Cài đặt' },
  { id: 'activity', label: 'Hoạt động' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ShopWorkspacePage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { shops, items: dbItems, orders: dbOrders, categories } = useAdminData();

  const shop = shops.find(s => s.id === shopId);
  const shopItems = dbItems.filter(i => i.shop_id === shopId);
  const shopOrders = dbOrders.filter(o => o.shop_id === shopId);
  const shopCategories = categories.filter(c => c.shop_id === shopId);

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-semibold text-gray-500">Không tìm thấy quán</h2>
        <Link href="/platform-admin/shops" className="text-amber-600 hover:underline">← Quay lại danh sách</Link>
      </div>
    );
  }

  const completedOrders = shopOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrders = shopOrders.filter(o => {
    const d = new Date(o.created_at);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="flex items-start gap-4">
        <Link href="/platform-admin/shops" className="mt-1 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: shop.theme_config?.primary_color || '#6B4226' }}>
              {shop.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <p className="text-sm text-gray-500">
                ID: {shop.id.substring(0, 8)} · Tier: <span className="font-semibold">{shop.subscription_tier || 'Free'}</span>
                {shop.subscription_tier && (
                  <> · {shop.subscription_tier !== 'free' ? 'Tier đang hoạt động' : ''}</>
                )}
              </p>
            </div>
            <Badge variant={shop.is_active ? 'success' : 'error'}>{shop.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Chủ quán: {shop.owner_id?.substring(0, 8)} · /{shop.slug}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 -mb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          shop={shop}
          totalRevenue={totalRevenue}
          completedOrders={completedOrders}
          todayOrders={todayOrders}
          shopItems={shopItems}
          shopCategories={shopCategories}
          shopOrders={shopOrders}
        />
      )}

      {activeTab === 'menu' && (
        <MenuTab items={shopItems} categories={shopCategories} shopName={shop.name} />
      )}

      {activeTab === 'promotions' && (
        <PromotionsTab shopId={shopId} shopName={shop.name} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab shop={shop} />
      )}

      {activeTab === 'activity' && (
        <ActivityTab orders={shopOrders} />
      )}
    </div>
  );
}

/* =============================================================
   TAB: TỔNG QUAN
   ============================================================= */
function OverviewTab({
  shop, totalRevenue, completedOrders, todayOrders, shopItems, shopCategories, shopOrders,
}: {
  shop: any; totalRevenue: number; completedOrders: any[]; todayOrders: any[]; shopItems: any[]; shopCategories: any[]; shopOrders: any[];
}) {
  const avgOrderValue = completedOrders.length ? Math.round(totalRevenue / completedOrders.length) : 0;
  const daysWithOrders = Math.max(1, Math.ceil((Date.now() - new Date(shop.created_at || Date.now()).getTime()) / 86400000));
  const ordersPerDay = Math.round(shopOrders.length / daysWithOrders);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile title="Đơn hôm nay" value={`${todayOrders.length}`} subtitle="Tất cả trạng thái" icon={<ShoppingBag size={20} />} color="#3B82F6" />
        <KpiTile title="Doanh thu tổng" value={formatVND(totalRevenue)} subtitle="Từ đơn hoàn tất" icon={<TrendingUp size={20} />} color="#15803D" />
        <KpiTile title="Giá trị TB" value={formatVND(avgOrderValue)} subtitle="Mỗi đơn" icon={<Activity size={20} />} color="#D97706" />
        <KpiTile title="Món trong menu" value={`${shopItems.length}`} subtitle={`${shopCategories.length} danh mục`} icon={<Store size={20} />} color="#7C3AED" />
      </div>

      {/* Health + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Sức khỏe quán
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Đơn TB/ngày" value={`${ordersPerDay} đơn`} />
            <Row label="Tổng đơn" value={`${shopOrders.length} đơn`} />
            <Row label="Món đang bán" value={`${shopItems.filter(i => i.is_available).length}/${shopItems.length}`} />
            <Row label="Tier" value={shop.subscription_tier || 'Free'} />
            <Row label="Trạng thái" value={shop.is_active ? 'Đang hoạt động' : 'Tạm ngưng'} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-500" /> Doanh thu
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Tổng doanh thu" value={formatVND(totalRevenue)} bold />
            <Row label="Đơn hoàn tất" value={`${completedOrders.length}`} />
            <Row label="Giá trị TB/đơn" value={formatVND(avgOrderValue)} />
            <Row label="Đơn hôm nay" value={`${todayOrders.length}`} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-end gap-2 h-20">
              {Array.from({ length: 7 }).map((_, i) => {
                const dayOrders = shopOrders.filter(o => {
                  const d = new Date(o.created_at);
                  const t = new Date();
                  t.setDate(t.getDate() - i);
                  return d.toDateString() === t.toDateString();
                });
                const maxOrders = Math.max(1, ...Array.from({ length: 7 }, (_, j) => shopOrders.filter(o => {
                  const d = new Date(o.created_at);
                  const t2 = new Date();
                  t2.setDate(t2.getDate() - j);
                  return d.toDateString() === t2.toDateString();
                }).length));
                const h = (dayOrders.length / maxOrders) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-100 rounded-t" style={{ height: `${Math.max(4, h)}%` }}>
                      <div className="w-full h-full bg-amber-500 rounded-t" />
                    </div>
                    <span className="text-[10px] text-gray-400">{['CN', 'T7', 'T6', 'T5', 'T4', 'T3', 'T2'][i]}</span>
                  </div>
                );
              }).reverse()}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">Đơn hàng gần đây</h3>
        {shopOrders.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            {shop.name} chưa có đơn nào. Khách quét QR bàn đầu tiên sẽ xuất hiện ở đây.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                  <th className="pb-3 font-semibold">Mã đơn</th>
                  <th className="pb-3 font-semibold">Bàn</th>
                  <th className="pb-3 font-semibold">Tổng</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shopOrders.slice(0, 10).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3">{order.shop_tables?.table_number || 'Mang về'}</td>
                    <td className="py-3 font-semibold">{formatVND(order.total)}</td>
                    <td className="py-3">
                      <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* =============================================================
   TAB: MENU
   ============================================================= */
function MenuTab({ items, categories, shopName }: { items: any[]; categories: any[]; shopName: string }) {
  const [selectedCat, setSelectedCat] = useState<string | 'all'>('all');
  const filtered = selectedCat === 'all' ? items : items.filter(i => i.category_id === selectedCat);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {items.length} món · {categories.length} danh mục
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
            selectedCat === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả ({items.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              selectedCat === cat.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name} ({items.filter(i => i.category_id === cat.id).length})
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
              <th className="p-4 font-semibold">Món</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Giá</th>
              <th className="p-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => {
              const cat = categories.find(c => c.id === item.category_id);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg opacity-30">🍽️</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{cat?.name || '—'}</td>
                  <td className="p-4 font-bold text-amber-600">{formatVND(item.price)}</td>
                  <td className="p-4">
                    <Badge variant={item.is_available ? 'success' : 'error'} size="sm">
                      {item.is_available ? 'Đang bán' : 'Hết hàng'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =============================================================
   TAB: KHUYẾN MÃI
   ============================================================= */
function PromotionsTab({ shopId, shopName }: { shopId: string; shopName: string }) {
  return (
    <Card className="p-12 text-center">
      <span className="text-4xl block mb-4">🎟️</span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Khuyến mãi của {shopName}</h3>
      <p className="text-gray-500 mb-6">Tính năng quản lý khuyến mãi riêng cho từng quán đang được phát triển.</p>
      <Link href="/platform-admin/promotions" className="text-amber-600 font-semibold hover:underline">
        Xem khuyến mãi toàn platform →
      </Link>
    </Card>
  );
}

/* =============================================================
   TAB: CÀI ĐẶT
   ============================================================= */
function SettingsTab({ shop }: { shop: any }) {
  const theme = shop.theme_config || {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">Thông tin quán</h3>
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Tên quán" value={shop.name} />
          <Row label="Slug" value={`/${shop.slug}`} />
          <Row label="Tier" value={shop.subscription_tier || 'Free'} />
          <Row label="Trạng thái" value={shop.is_active ? 'Đang hoạt động' : 'Tạm ngưng'} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">Giao diện (Theme)</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ background: theme.primary_color || '#6B4226' }} />
            <div>
              <p className="text-sm font-semibold">Màu chủ đạo</p>
              <p className="text-xs text-gray-500 font-mono">{theme.primary_color || '#6B4226'}</p>
            </div>
          </div>
          {theme.secondary_color && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ background: theme.secondary_color }} />
              <div>
                <p className="text-sm font-semibold">Màu phụ</p>
                <p className="text-xs text-gray-500 font-mono">{theme.secondary_color}</p>
              </div>
            </div>
          )}
          <div className="p-4 rounded-xl mt-2" style={{ background: theme.primary_color || '#6B4226' }}>
            <p className="text-white text-sm font-semibold">{shop.name}</p>
            <p className="text-white/70 text-xs mt-1">Preview giao diện quán</p>
            <div className="mt-3 flex gap-2">
              <div className="px-3 py-1 bg-white/20 rounded-full text-white text-xs">Món chính</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">Đồ uống</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =============================================================
   TAB: HOẠT ĐỘNG
   ============================================================= */
function ActivityTab({ orders }: { orders: any[] }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-gray-900 mb-4">Nhật ký hoạt động</h3>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">Chưa có hoạt động nào.</p>
      ) : (
        <div className="flex flex-col">
          {orders.slice(0, 20).map(order => (
            <div key={order.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5 min-w-[70px]">
                {new Date(order.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
              </span>
              <div className="min-w-[8px] mt-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  +1 đơn mới · {formatVND(order.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {order.order_number} · {order.shop_tables?.table_number ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'} · {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* =============================================================
   SHARED COMPONENTS
   ============================================================= */
function KpiTile({ title, value, subtitle, icon, color }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; color: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-gray-900' : 'text-gray-700'}>{value}</span>
    </div>
  );
}