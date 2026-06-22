'use client';

import React, { useState } from 'react';
import { useShopContext, filterByShop } from '@/hooks/useShopContext';
import { trpc } from '@/lib/trpc/client';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function PlatformTablesPage() {
  const { selectedShopId } = useShopContext();
  const { data: shops = [] } = trpc.admin.getShops.useQuery();
  const { data: dbTables = [] } = trpc.admin.getTables.useQuery();

  const tables = filterByShop(dbTables, selectedShopId);
  const isAllMode = selectedShopId === 'all';

  // Batch create
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchShopId, setBatchShopId] = useState('');
  const [batchCount, setBatchCount] = useState('10');
  const [batchPrefix, setBatchPrefix] = useState('B');

  const handleBatchCreate = () => {
    if (!batchShopId || !batchPrefix || !batchCount) { toast.error('Điền đủ thông tin'); return; }
    const count = parseInt(batchCount);
    if (isNaN(count) || count < 1 || count > 100) { toast.error('Số lượng từ 1-100'); return; }
    const shop = shops.find(s => s.id === batchShopId);
    toast.success(`Đã tạo ${count} bàn cho "${shop?.name}" (demo mode)`);
    setBatchModalOpen(false);
  };

  const handleDownloadAllQR = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    toast.success(`Đang tải QR codes của "${shop?.name}"... (demo mode)`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bàn & QR 🪑</h1>
          <p className="text-sm text-gray-500">{tables.length} bàn · {tables.filter(t => t.is_active).length} đang hoạt động</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setBatchModalOpen(true)}>📦 Tạo hàng loạt</Button>
          {!isAllMode && selectedShopId !== 'all' && (
            <Button variant="secondary" onClick={() => handleDownloadAllQR(selectedShopId)}>📥 Tải tất cả QR</Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              {isAllMode && <th className="p-4 font-semibold">Quán</th>}
              <th className="p-4 font-semibold">Bàn</th>
              <th className="p-4 font-semibold">Mã ngắn</th>
              <th className="p-4 font-semibold">URL</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tables.map(table => {
              const shop = shops.find(s => s.id === table.shop_id);
              return (
                <tr key={table.id} className={`hover:bg-gray-50 transition-colors ${!table.is_active ? 'opacity-60' : ''}`}>
                  {isAllMode && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: shop?.theme_config.primary_color }}>
                          {shop?.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{shop?.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="p-4 font-bold text-gray-900 text-lg">Bàn {table.table_number}</td>
                  <td className="p-4 font-mono text-sm text-gray-500">{table.short_code}</td>
                  <td className="p-4 text-xs text-gray-400 font-mono">/s/{shop?.slug}/t/{table.table_number}</td>
                  <td className="p-4">
                    <Badge variant={table.is_active ? 'success' : 'error'} size="sm">
                      {table.is_active ? 'Hoạt động' : 'Đã tắt'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-blue-500 hover:text-blue-700 transition-colors" title="Download QR" onClick={() => toast.success('Downloading QR... (demo)')}>📥</button>
                      <button className="p-2 text-red-500 hover:text-red-700 transition-colors" title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch Create Modal */}
      <Modal isOpen={batchModalOpen} onClose={() => setBatchModalOpen(false)} title="Tạo hàng loạt bàn">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Chọn quán</label>
            <select value={batchShopId} onChange={e => setBatchShopId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
              <option value="">-- Chọn quán --</option>
              {(shops as any[]).filter(s => s.status === 'active' || s.is_active).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <Input type="number" placeholder="Số lượng bàn (1-100)" value={batchCount} onChange={e => setBatchCount(e.target.value)} />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Hệ thống sẽ tự động tạo mã ngắn (Short code) và URL QR cho từng bàn.
          </div>
          <Button onClick={handleBatchCreate} fullWidth>📦 Tạo {batchCount} bàn</Button>
        </div>
      </Modal>
    </div>
  );
}
