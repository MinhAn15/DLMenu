'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { trpc } from '@/lib/trpc/client';
import QRGenerator from '@/components/admin/QRGenerator';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function AdminTablesPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const utils = trpc.useUtils();
  const [addingTable, setAddingTable] = useState(false);

  const { data: tables = [], isLoading } = trpc.shop.tables.list.useQuery(
    { shopId: shop?.id ?? '' },
    { enabled: !!shop }
  );

  const createMutation = trpc.shop.tables.create.useMutation({
    onSuccess: (data) => {
      utils.shop.tables.list.invalidate();
      toast.success(`Đã thêm Bàn ${data.table_number}`);
      setAddingTable(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi thêm bàn');
      setAddingTable(false);
    },
  });

  const deleteMutation = trpc.shop.tables.delete.useMutation({
    onSuccess: () => {
      utils.shop.tables.list.invalidate();
      toast.success('Đã xóa bàn');
    },
    onError: (err) => toast.error(err.message || 'Lỗi xóa bàn'),
  });

  const toggleMutation = trpc.shop.tables.toggle.useMutation({
    onSuccess: () => {
      utils.shop.tables.list.invalidate();
    },
    onError: () => toast.error('Lỗi cập nhật'),
  });

  const handleAddTable = () => {
    if (!shop) return;
    setAddingTable(true);
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    createMutation.mutate({ shopId: shop.id, shopSlug: shop.slug, tableNumber: nextNum });
  };

  const handleDelete = (tableId: string, num: number) => {
    if (!confirm(`Xóa Bàn ${num}? Mã QR sẽ không còn hoạt động.`)) return;
    deleteMutation.mutate({ id: tableId });
  };

  const handleToggle = (tableId: string, isActive: boolean) => {
    toggleMutation.mutate({ id: tableId, isActive: !isActive });
  };

  if (shopLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="120px" height="40px" borderRadius="var(--radius-md)" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <Skeleton width="64px" height="64px" borderRadius="var(--radius-md)" />
                <div className="flex flex-col gap-2">
                  <Skeleton width="80px" height="20px" />
                  <Skeleton width="120px" height="16px" />
                </div>
              </div>
              <Skeleton width="100px" height="32px" borderRadius="var(--radius-md)" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Mã QR & Bàn</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {tables.length} bàn · {tables.filter(t => t.is_active).length} đang hoạt động
          </p>
        </div>
        <Button onClick={handleAddTable} loading={addingTable}>+ Thêm bàn</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Bàn / QR Code</th>
              <th className="p-4 font-semibold">Mã ngắn</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tables.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  Chưa có bàn nào. Nhấn &ldquo;+ Thêm bàn&rdquo; để tạo mã QR.
                </td>
              </tr>
            ) : (
              tables.map(table => (
                <tr key={table.id} className={`hover:bg-gray-50 transition-colors ${!table.is_active ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white p-1">
                        <QRGenerator
                          shortCode={table.short_code}
                          shopName={shop?.name || ''}
                          tableNumber={table.table_number}
                          hideDownload
                        />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Bàn {table.table_number}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-600">{table.short_code}</td>
                  <td className="p-4">
                    <Badge variant={table.is_active ? 'success' : 'error'} size="sm">
                      {table.is_active ? 'Hoạt động' : 'Đã tắt'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleToggle(table.id, table.is_active)}>
                        {table.is_active ? '🚫 Tắt' : '✓ Bật'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDelete(table.id, table.table_number)}>
                        🗑️ Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
