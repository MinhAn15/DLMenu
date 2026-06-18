'use client';

import React, { useState } from 'react';
import { useShopContext, filterByShop } from '@/hooks/useShopContext';
import { useAdminData } from '@/hooks/useAdminData';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatVND } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/lib/types/database';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function PlatformOrdersPage() {
  const { selectedShopId } = useShopContext();
  const { shops, orders: allOrders } = useAdminData();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const isAllMode = selectedShopId === 'all';

  let orders = filterByShop(allOrders, selectedShopId);
  if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Giám sát Đơn hàng 🛒</h1>
        <p className="text-sm text-gray-500">{orders.length} đơn hàng</p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${statusFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
          Tất cả ({filterByShop(allOrders, selectedShopId).length})
        </button>
        {statusOptions.map(s => {
          const count = filterByShop(allOrders, selectedShopId).filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${statusFilter === s ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              style={statusFilter === s ? { background: ORDER_STATUS_COLORS[s] } : {}}>
              {ORDER_STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Mã đơn</th>
              {isAllMode && <th className="p-4 font-semibold">Quán</th>}
              <th className="p-4 font-semibold">Bàn</th>
              <th className="p-4 font-semibold">Khách hàng</th>
              <th className="p-4 font-semibold">Tổng tiền</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => {
              const shop = shops.find(s => s.id === order.shop_id);
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-amber-700">{order.order_number}</td>
                  {isAllMode && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: shop?.theme_config.primary_color }}>
                          {shop?.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{shop?.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="p-4 text-gray-600">Bàn {order.table_number}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                  </td>
                  <td className="p-4 font-bold">{formatVND(order.total)}</td>
                  <td className="p-4">
                    <Badge style={{ backgroundColor: ORDER_STATUS_COLORS[order.status], color: 'white', fontSize: '0.7rem' }}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-gray-400">Không có đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
