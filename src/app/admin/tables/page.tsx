'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { getTables, createTable, deleteTable, toggleTableActive } from '@/lib/actions/tables';
import QRGenerator from '@/components/admin/QRGenerator';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import type { ShopTable } from '@/lib/types/database';

export default function AdminTablesPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const [tables, setTables] = useState<ShopTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTable, setAddingTable] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const res = await getTables(shop.id);
      if (res.success && res.data) setTables(res.data as ShopTable[]);
    } catch {
      toast.error('Lỗi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    if (shop) fetchTables();
  }, [shop, fetchTables]);

  const handleAddTable = async () => {
    if (!shop) return;
    setAddingTable(true);
    try {
      const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
      const res = await createTable(shop.id, shop.slug, nextNum);
      if (!res.success) throw new Error(res.error);
      toast.success(`Đã thêm Bàn ${nextNum}`);
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thêm bàn');
    } finally {
      setAddingTable(false);
    }
  };

  const handleDelete = async (tableId: string, num: number) => {
    if (!confirm(`Xóa Bàn ${num}? Mã QR sẽ không còn hoạt động.`)) return;
    try {
      const res = await deleteTable(tableId);
      if (!res.success) throw new Error(res.error);
      toast.success(`Đã xóa Bàn ${num}`);
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xóa bàn');
    }
  };

  const handleToggle = async (tableId: string, isActive: boolean) => {
    try {
      await toggleTableActive(tableId, !isActive);
      fetchTables();
    } catch {
      toast.error('Lỗi cập nhật');
    }
  };

  if (shopLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
        {tables.map(table => (
          <div key={table.id} style={{ position: 'relative', opacity: table.is_active ? 1 : 0.5 }}>
            <QRGenerator
              shortCode={table.short_code}
              shopName={shop?.name || ''}
              tableNumber={table.table_number}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <Button size="sm" variant="secondary" onClick={() => handleToggle(table.id, table.is_active)}>
                {table.is_active ? '🚫 Tắt' : '✓ Bật'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleDelete(table.id, table.table_number)}>
                🗑️ Xóa
              </Button>
            </div>
            {!table.is_active && (
              <Badge variant="error" style={{ position: 'absolute', top: 8, right: 8 }}>Đã tắt</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
