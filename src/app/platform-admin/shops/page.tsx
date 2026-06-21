'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShopContext } from '@/hooks/useShopContext';
import { useAdminData } from '@/hooks/useAdminData';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Shop } from '@/lib/types/database';

export default function PlatformShopsPage() {
  const { selectedShopId } = useShopContext();
  const { shops: dbShops, loading, tables, items, users } = useAdminData();
  const [shops, setShops] = useState<Shop[]>([]);

  // Update local state when dbShops changes
  React.useEffect(() => {
    if (dbShops.length > 0) setShops(dbShops);
  }, [dbShops]);
  const [modalOpen, setModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [cloneSource, setCloneSource] = useState<Shop | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTier, setFormTier] = useState<'free' | 'pro' | 'premium'>('free');

  const filteredShops = selectedShopId === 'all' ? shops : shops.filter(s => s.id === selectedShopId);

  const openCreateModal = () => {
    setEditingShop(null);
    setFormName(''); setFormSlug(''); setFormPhone(''); setFormAddress(''); setFormTier('free');
    setModalOpen(true);
  };

  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setFormName(shop.name); setFormSlug(shop.slug); setFormPhone(shop.phone || '');
    setFormAddress(shop.address || ''); setFormTier(shop.subscription_tier);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formSlug.trim()) { toast.error('Nhập tên và slug'); return; }
    if (editingShop) {
      setShops(prev => prev.map(s => s.id === editingShop.id ? { ...s, name: formName, slug: formSlug, phone: formPhone, address: formAddress, subscription_tier: formTier, updated_at: new Date().toISOString() } : s));
      toast.success('Đã cập nhật quán');
    } else {
      const newShop: Shop = {
        id: `shop-${Date.now()}`, name: formName, slug: formSlug, description: null, logo_url: null, cover_image_url: null,
        phone: formPhone, address: formAddress, theme_config: { primary_color: '#6B4226', font: 'Inter' }, business_hours: {},
        loyalty_config: { points_formula: { type: 'per_amount', amount_per_point: 10000 }, ranks: [{ name: 'Thành viên', min_points: 0, discount_percent: 0 }, { name: 'Bạc', min_points: 100, discount_percent: 3 }, { name: 'Vàng', min_points: 500, discount_percent: 5 }, { name: 'Kim cương', min_points: 2000, discount_percent: 10 }], bonus_rules: [], discount_stacking: 'take_highest' },
        owner_id: '', is_active: true, subscription_tier: formTier,
        max_order_value: 2000000, max_cart_items: 20,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setShops(prev => [...prev, newShop]);
      toast.success('Đã tạo quán mới');
    }
    setModalOpen(false);
  };

  const handleToggleActive = (shopId: string) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, is_active: !s.is_active } : s));
  };

  const handleDelete = (shopId: string) => {
    if (!confirm('Xóa quán này? Thao tác không thể hoàn tác.')) return;
    setShops(prev => prev.filter(s => s.id !== shopId));
    toast.success('Đã xóa quán');
  };

  const openCloneModal = (shop: Shop) => {
    setCloneSource(shop);
    setFormName(`${shop.name} (Copy)`);
    setFormSlug(`${shop.slug}-copy`);
    setCloneModalOpen(true);
  };

  const handleClone = () => {
    if (!cloneSource || !formName.trim() || !formSlug.trim()) { toast.error('Nhập tên và slug mới'); return; }
    const clonedShop: Shop = {
      ...cloneSource, id: `shop-clone-${Date.now()}`, name: formName, slug: formSlug,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setShops(prev => [...prev, clonedShop]);
    toast.success(`Đã clone "${cloneSource.name}" → "${formName}" (bao gồm Menu, Bàn, Cấu hình)`);
    setCloneModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Quán 🏪</h1>
          <p className="text-sm text-gray-500">{filteredShops.length} quán · {filteredShops.filter(s => s.is_active).length} đang hoạt động</p>
        </div>
        <Button onClick={openCreateModal}>+ Tạo quán mới</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Quán</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold">Chủ quán</th>
              <th className="p-4 font-semibold">Gói</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Bàn</th>
              <th className="p-4 font-semibold text-center">Món</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredShops.map(shop => {
              const tableCount = tables.filter(t => t.shop_id === shop.id).length;
              const itemCount = items.filter(i => i.shop_id === shop.id).length;
              const owner = users.find(u => u.id === shop.owner_id);
              return (
                <tr key={shop.id} className={`hover:bg-gray-50 transition-colors ${!shop.is_active ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <Link href={`/platform-admin/shops/${shop.id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: shop.theme_config.primary_color }}>
                        {shop.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{shop.name}</p>
                        <p className="text-xs text-gray-400">{shop.address}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-500">{shop.slug}</td>
                  <td className="p-4 text-sm text-gray-600">{owner?.display_name || shop.phone || '—'}</td>
                  <td className="py-4">
                    <Badge variant={shop.subscription_tier === 'premium' ? 'warning' : shop.subscription_tier === 'pro' ? 'info' : 'default'} size="sm">
                      {(shop.subscription_tier || 'free').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <button onClick={() => handleToggleActive(shop.id)} className="cursor-pointer">
                      <Badge variant={shop.is_active ? 'success' : 'error'} size="sm">
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4 text-center font-semibold">{tableCount}</td>
                  <td className="p-4 text-center font-semibold">{itemCount}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/platform-admin/shops/${shop.id}`} className="p-2 text-amber-500 hover:text-amber-700 transition-colors" title="Mở workspace">🔍</Link>
                      <button onClick={() => openEditModal(shop)} className="p-2 text-blue-500 hover:text-blue-700 transition-colors" title="Sửa">✏️</button>
                      <button onClick={() => openCloneModal(shop)} className="p-2 text-amber-500 hover:text-amber-700 transition-colors" title="Clone">📋</button>
                      <button onClick={() => handleDelete(shop.id)} className="p-2 text-red-500 hover:text-red-700 transition-colors" title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingShop ? 'Sửa thông tin quán' : 'Tạo quán mới'}>
        <div className="flex flex-col gap-4">
          <Input placeholder="Tên quán *" value={formName} onChange={e => setFormName(e.target.value)} autoFocus />
          <Input placeholder="Slug (URL) *" value={formSlug} onChange={e => setFormSlug(e.target.value)} />
          <Input placeholder="SĐT chủ quán" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
          <Input placeholder="Địa chỉ" value={formAddress} onChange={e => setFormAddress(e.target.value)} />
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Gói cước</label>
            <select value={formTier} onChange={e => setFormTier(e.target.value as any)} className="w-full p-3 border border-gray-200 rounded-lg text-sm font-medium bg-white cursor-pointer">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <Button onClick={handleSave} fullWidth>{editingShop ? 'Cập nhật' : 'Tạo quán'}</Button>
        </div>
      </Modal>

      {/* Clone Modal */}
      <Modal isOpen={cloneModalOpen} onClose={() => setCloneModalOpen(false)} title={`Clone: ${cloneSource?.name}`}>
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            📋 Sẽ sao chép: <strong>Danh mục, Món ăn, Bàn, Cấu hình Loyalty & Theme</strong>. Không sao chép Đơn hàng, Người dùng, Điểm thưởng.
          </div>
          <Input placeholder="Tên quán mới *" value={formName} onChange={e => setFormName(e.target.value)} autoFocus />
          <Input placeholder="Slug mới *" value={formSlug} onChange={e => setFormSlug(e.target.value)} />
          <Button onClick={handleClone} fullWidth>🚀 Clone ngay</Button>
        </div>
      </Modal>
    </div>
  );
}
