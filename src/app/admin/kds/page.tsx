'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { trpc } from '@/lib/trpc/client';
import { formatRelativeTime } from '@/lib/utils/date';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = [
  { id: 'pending', label: 'Chờ xác nhận', color: 'border-yellow-200 bg-yellow-50', nextStatus: 'confirmed', nextLabel: 'Xác nhận' },
  { id: 'confirmed', label: 'Đã xác nhận', color: 'border-blue-200 bg-blue-50', nextStatus: 'preparing', nextLabel: 'Pha chế' },
  { id: 'preparing', label: 'Đang làm', color: 'border-purple-200 bg-purple-50', nextStatus: 'ready', nextLabel: 'Sẵn sàng' },
  { id: 'ready', label: 'Sẵn sàng giao', color: 'border-green-200 bg-green-50', nextStatus: 'completed', nextLabel: 'Hoàn thành' },
];

export default function KitchenDisplaySystemPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const { orders, loading: ordersLoading, refetch } = useRealtimeOrders(shop?.id);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Đã chuyển trạng thái');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Lỗi chuyển trạng thái'),
  });

  const cancelMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Đã hủy đơn');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Lỗi hủy đơn'),
  });

  const handleUpdateStatus = (orderId: string, nextStatus: string) => {
    setUpdating(orderId);
    updateStatusMutation.mutate(
      { orderId, status: nextStatus as 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' },
      { onSettled: () => setUpdating(null) },
    );
  };

  const handleCancel = (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn này?')) return;
    setUpdating(orderId);
    cancelMutation.mutate(
      { orderId, status: 'cancelled' as const },
      { onSettled: () => setUpdating(null) },
    );
  };

  if (shopLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Lọc ra các đơn hàng chưa hoàn thành và chưa hủy
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col -m-6 p-6 bg-gray-100 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">🍳 Màn hình Bếp (KDS)</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
          Hiển thị realtime • {activeOrders.length} đơn đang chờ
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {STATUS_COLUMNS.map(col => {
          const colOrders = activeOrders.filter(o => o.status === col.id);
          
          return (
            <div key={col.id} className={`flex flex-col w-80 shrink-0 rounded-xl border ${col.color} shadow-sm overflow-hidden`}>
              {/* Header Cột */}
              <div className="p-3 bg-white/50 backdrop-blur-sm border-b border-inherit font-bold text-gray-700 flex justify-between items-center shrink-0">
                <span>{col.label}</span>
                <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">{colOrders.length}</span>
              </div>
              
              {/* Danh sách Order */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colOrders.map(order => (
                  <div key={order.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-2 relative group">
                    {/* Hủy đơn */}
                    {(col.id === 'pending' || col.id === 'confirmed') && (
                      <button 
                        onClick={() => handleCancel(order.id)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hủy đơn"
                      >
                        ✕
                      </button>
                    )}

                    <div className="flex justify-between items-start pr-6">
                      <div className="font-bold text-lg text-gray-800">{order.order_number}</div>
                      <div className="text-xs font-semibold text-[var(--color-primary)]">
                        {order.shop_tables ? `Bàn ${order.shop_tables.table_number}` : 'Mang đi'}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(order.created_at)}
                    </div>

                    <div className="py-2 border-y border-dashed border-gray-200 mt-1 mb-1">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <div className="font-medium">
                            <span className="font-bold text-[var(--color-primary)] mr-1">{item.quantity}x</span>
                            {item.menu_items?.name || 'Món đã xóa'}
                          </div>
                          {item.note && <div className="text-xs text-red-500 ml-2 italic max-w-[40%] text-right line-clamp-2">&ldquo;{item.note}&rdquo;</div>}
                        </div>
                      ))}
                    </div>

                    {order.customer_note && (
                      <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
                        <strong>Ghi chú:</strong> {order.customer_note}
                      </div>
                    )}

                    <button
                      disabled={updating === order.id}
                      onClick={() => handleUpdateStatus(order.id, col.nextStatus)}
                      className="mt-2 w-full py-2 rounded-lg bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {updating === order.id ? <Spinner size="sm" color="white" /> : (
                        <>
                          {col.nextLabel} <span className="text-lg leading-none">→</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div className="text-center p-4 text-sm text-gray-400 italic">
                    Trống
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
