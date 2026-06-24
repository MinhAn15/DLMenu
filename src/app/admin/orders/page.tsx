'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { useRealtimeOrders, OrderWithDetails } from '@/hooks/useRealtimeOrders';
import { trpc } from '@/lib/trpc/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import PrintableReceipt from '@/components/admin/PrintableReceipt';
import { formatVND } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'active', label: 'Đang xử lý' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'preparing', label: 'Đang pha chế' },
  { key: 'ready', label: 'Sẵn sàng' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'all', label: 'Tất cả' },
];

const ACTION_BUTTONS: Record<string, { label: string; next: string; variant?: 'primary' | 'secondary' }[]> = {
  pending: [
    { label: '✓ Xác nhận', next: 'confirmed', variant: 'primary' },
    { label: '✕ Hủy', next: 'cancelled', variant: 'secondary' },
  ],
  confirmed: [
    { label: '🔥 Bắt đầu pha chế', next: 'preparing', variant: 'primary' },
    { label: '✕ Hủy', next: 'cancelled', variant: 'secondary' },
  ],
  preparing: [
    { label: '✓ Sẵn sàng', next: 'ready', variant: 'primary' },
  ],
  ready: [
    { label: '✓ Hoàn thành', next: 'completed', variant: 'primary' },
  ],
};

export default function AdminOrdersPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const { orders, loading: ordersLoading, refetch } = useRealtimeOrders(shop?.id);
  const [tab, setTab] = useState<string>('active');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<OrderWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Đã cập nhật → ${ORDER_STATUS_LABELS[vars.status]}`);
      refetch();
      if (selectedOrder?.id === vars.orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: vars.status as OrderWithDetails['status'] } : null);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    updateStatusMutation.mutate(
      { orderId, status: newStatus as OrderWithDetails['status'] },
      { onSettled: () => setActionLoading(null) },
    );
  };

  const filteredOrders = orders.filter(o => {
    if (tab === 'all') return true;
    if (tab === 'active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status);
    return o.status === tab;
  });

  // eslint-disable-next-line react-hooks/purity
  const getTimeAgo = (isoString: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m trước`;
  };

  if (shopLoading || ordersLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="100px" height="40px" borderRadius="var(--radius-md)" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="120px" height="36px" borderRadius="var(--radius-full)" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="100px" borderRadius="var(--radius-xl)" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Quản lý Đơn hàng</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {orders.filter(o => o.status === 'pending').length} đơn chờ xác nhận
            {' · '}
            {orders.filter(o => o.status === 'preparing').length} đang pha chế
          </p>
        </div>
        <Button variant="secondary" onClick={refetch}>🔄 Làm mới</Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', borderBottom: '2px solid var(--color-border-light)', paddingBottom: 'var(--space-2)' }}>
        {TABS.map(t => {
          const count = t.key === 'all' ? orders.length
            : t.key === 'active' ? orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length
            : orders.filter(o => o.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                border: 'none',
                cursor: 'pointer',
                background: tab === t.key ? 'var(--color-primary)' : 'transparent',
                color: tab === t.key ? 'white' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState 
          title="Không có đơn hàng nào" 
          description="Chưa có đơn hàng nào khớp với bộ lọc hiện tại. Chờ đơn hàng mới nhé!"
          icon={<span style={{ fontSize: '2rem' }}>📋</span>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <Card
              key={order.id}
              className="hover-lift"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', padding: 'var(--space-4)',
                borderLeft: `4px solid ${ORDER_STATUS_COLORS[order.status] || 'var(--color-border)'}`,
              }}
              onClick={() => setSelectedOrder(order)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1 }}>
                {/* Order number badge */}
                <div style={{
                  width: '52px', height: '52px',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  {order.order_number}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                      {order.shop_tables ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'}
                    </h3>
                    <Badge
                      style={{ backgroundColor: ORDER_STATUS_COLORS[order.status], color: 'white', fontSize: 'var(--font-size-xs)' }}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {order.order_items?.length || 0} món · {getTimeAgo(order.created_at)}
                    {order.customer_note && <span style={{ color: 'var(--color-warning)' }}> · 📝 Ghi chú</span>}
                  </p>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>
                    {formatVND(order.total)}
                  </div>
                  {order.discount_amount > 0 && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>
                      -{ formatVND(order.discount_amount)}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-4)' }} onClick={e => e.stopPropagation()}>
                {(ACTION_BUTTONS[order.status] || []).map(action => (
                  <Button
                    key={action.next}
                    size="sm"
                    variant={action.variant}
                    loading={actionLoading === order.id}
                    onClick={() => handleStatusChange(order.id, action.next)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Đơn hàng ${selectedOrder?.order_number || ''}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Status & Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>
              <div>
                <Badge style={{ backgroundColor: ORDER_STATUS_COLORS[selectedOrder.status], color: 'white' }}>
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </Badge>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  {selectedOrder.shop_tables ? `Bàn ${selectedOrder.shop_tables.table_number}` : 'Mang về'}
                  {' · '}
                  {selectedOrder.order_type === 'dine_in' ? 'Ăn tại quán' : 'Mang về'}
                </p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--color-primary)' }}>
                  {formatVND(selectedOrder.total)}
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => {
                    setOrderToPrint(selectedOrder);
                    setTimeout(() => window.print(), 100);
                  }}
                >
                  🖨️ In Bill
                </Button>
              </div>
            </div>

            {/* Items */}
            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>Chi tiết món</h4>
                {selectedOrder.order_items.map(oi => (
                  <div key={oi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{oi.quantity}x</span>{' '}
                      {oi.menu_items?.name || 'Món'}
                      {oi.note && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}> — {oi.note}</span>}
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatVND(oi.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Customer note */}
            {selectedOrder.customer_note && (
              <div style={{ background: 'var(--color-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>📝 Ghi chú</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{selectedOrder.customer_note}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {(ACTION_BUTTONS[selectedOrder.status] || []).map(action => (
                <Button
                  key={action.next}
                  variant={action.variant}
                  loading={actionLoading === selectedOrder.id}
                  onClick={() => handleStatusChange(selectedOrder.id, action.next)}
                  fullWidth
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden Printable Receipt */}
      {orderToPrint && <PrintableReceipt order={orderToPrint} shopName={shop?.name || 'DiLinhMenu'} />}
    </div>
  );
}
