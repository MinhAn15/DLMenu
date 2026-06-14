'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

// Mock data for MVP
const mockOrders = [
  { id: '1', order_number: '#001', table: 'Bàn 1', status: 'pending', total: 150000, time: '10:30' },
  { id: '2', order_number: '#002', table: 'Bàn 5', status: 'preparing', total: 85000, time: '10:15' },
  { id: '3', order_number: '#003', table: 'Bàn 2', status: 'completed', total: 320000, time: '09:45' },
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-500">Theo dõi và cập nhật trạng thái</p>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {['all', 'pending', 'preparing', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === f ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f === 'all' ? 'Tất cả' : ORDER_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockOrders.filter(o => filter === 'all' || o.status === filter).map(order => (
          <Card key={order.id} className="flex justify-between items-center p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center font-bold text-[var(--color-primary)]">
                {order.order_number}
              </div>
              <div>
                <h3 className="font-bold">{order.table}</h3>
                <p className="text-sm text-gray-500">{order.time} • {order.total.toLocaleString()}đ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                style={{ backgroundColor: ORDER_STATUS_COLORS[order.status], color: 'white' }}
                className="px-3 py-1"
              >
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <button className="text-[var(--color-primary)] font-medium text-sm">Chi tiết</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
