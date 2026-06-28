'use client';

import React, { useState, useEffect } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { useRealtimeOrders, OrderWithDetails } from '@/hooks/useRealtimeOrders';
import { trpc } from '@/lib/trpc/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import PrintableReceipt from '@/components/admin/PrintableReceipt';
import { formatVND } from '@/lib/utils/format';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const COLUMNS = [
  { id: 'pending', title: '🆕 Chờ xác nhận', statuses: ['pending'] },
  { id: 'preparing', title: '🍳 Đang chuẩn bị', statuses: ['confirmed', 'preparing'] },
  { id: 'completed', title: '✅ Hoàn thành', statuses: ['ready', 'completed'] },
];

export default function AdminOrdersPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const { orders, loading: ordersLoading, refetch } = useRealtimeOrders(shop?.id);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<OrderWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<OrderWithDetails[]>([]);

  // Sync with realtime data
  useEffect(() => {
    if (!actionLoading) {
      setLocalOrders(orders);
    }
  }, [orders, actionLoading]);

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      // Don't show toast for every drag to avoid spam, just silently update
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // Optimistic update
    const newStatusMap: Record<string, 'pending' | 'preparing' | 'completed'> = {
      pending: 'pending',
      preparing: 'preparing',
      completed: 'completed',
    };

    const targetStatus = newStatusMap[destination.droppableId] as any;
    
    setLocalOrders(prev => prev.map(o => 
      o.id === draggableId ? { ...o, status: targetStatus } : o
    ));
    
    setActionLoading(draggableId);
    updateStatusMutation.mutate(
      { orderId: draggableId, status: targetStatus },
      { onSettled: () => setActionLoading(null) }
    );
  };

  const getTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m trước`;
  };

  if (shopLoading || ordersLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Filter out cancelled orders from Kanban view
  const activeOrders = localOrders.filter(o => o.status !== 'cancelled');

  return (
    <div className="flex flex-col h-full bg-gray-50 -m-4 md:-m-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Kanban Bếp (KDS)</h1>
          <p className="text-gray-500 text-sm">
            Kéo thả thẻ để cập nhật trạng thái đơn hàng nhanh chóng
          </p>
        </div>
        <Button variant="secondary" onClick={refetch}>🔄 Làm mới</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-6 min-w-max pb-4">
            {COLUMNS.map(column => {
              const columnOrders = activeOrders.filter(o => column.statuses.includes(o.status));
              
              return (
                <div key={column.id} className="flex flex-col w-80 bg-gray-100/50 rounded-2xl border border-gray-200">
                  <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-2xl flex justify-between items-center">
                    <h2 className="font-bold font-heading text-gray-700">{column.title}</h2>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                      {columnOrders.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                      >
                        {columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedOrder(order)}
                                className={`
                                  bg-white p-4 rounded-xl border border-gray-200 shadow-sm
                                  transition-all hover:shadow-md cursor-grab active:cursor-grabbing
                                  ${snapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-1 z-50 ring-2 ring-[var(--color-primary)]' : ''}
                                `}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-[var(--color-primary)] text-sm">
                                    {order.order_number}
                                  </span>
                                  <span className="text-xs font-medium text-gray-400">
                                    {getTimeAgo(order.created_at)}
                                  </span>
                                </div>
                                
                                <h3 className="font-bold text-gray-900 mb-1">
                                  {order.shop_tables ? `Bàn ${order.shop_tables.table_number}` : 'Mang về'}
                                </h3>
                                
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                  {order.order_items?.map(i => `${i.quantity}x ${i.menu_items?.name}`).join(', ')}
                                </p>
                                
                                {order.customer_note && (
                                  <div className="bg-amber-50 text-amber-700 text-xs p-2 rounded mb-3 border border-amber-100">
                                    📝 {order.customer_note}
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                                  <span className="font-bold text-gray-900">{formatVND(order.total)}</span>
                                  {actionLoading === order.id && <Spinner size="sm" />}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Đơn hàng ${selectedOrder?.order_number}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">{selectedOrder.shop_tables ? `Bàn ${selectedOrder.shop_tables.table_number}` : 'Mang về'}</h3>
                <p className="text-gray-500 text-sm">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-[var(--color-primary)]">{formatVND(selectedOrder.total)}</div>
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => {
                  setOrderToPrint(selectedOrder);
                  setTimeout(() => window.print(), 100);
                }}>
                  🖨️ In Bill
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Chi tiết món:</h4>
              {selectedOrder.order_items?.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-bold">{item.quantity}x</span> {item.menu_items?.name}
                    {item.note && <div className="text-xs text-gray-500 italic ml-4">↳ {item.note}</div>}
                  </div>
                  <span className="font-bold">{formatVND(item.subtotal)}</span>
                </div>
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
