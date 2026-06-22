'use client';

import React, { useState } from 'react';
import { useShopContext, filterByShop } from '@/hooks/useShopContext';
import { trpc } from '@/lib/trpc/client';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { formatVND } from '@/lib/utils/format';
import type { MenuItem, MenuCategory } from '@/lib/types/database';

export default function PlatformMenuPage() {
  const { selectedShopId } = useShopContext();
  const { data: dbItems = [] } = trpc.admin.getMenuItems.useQuery();
  const { data: dbCats = [] } = trpc.admin.getCategories.useQuery();
  const { data: shops = [] } = trpc.admin.getShops.useQuery();
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  // 1. Data Source
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  React.useEffect(() => {
    setItems(filterByShop(dbItems, selectedShopId));
    setCategories(filterByShop(dbCats, selectedShopId));
  }, [dbItems, dbCats, selectedShopId]);
  
  const isAllMode = selectedShopId === 'all';

  // Clone modal
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneItems, setCloneItems] = useState<string[]>([]);
  const [cloneTargetShop, setCloneTargetShop] = useState('');

  const handleCloneItems = () => {
    if (!cloneTargetShop) { toast.error('Chọn quán để clone đến'); return; }
    const targetShop = shops.find(s => s.id === cloneTargetShop);
    toast.success(`Đã clone ${cloneItems.length} món sang "${targetShop?.name}"`);
    setCloneModalOpen(false);
    setCloneItems([]);
  };

  const toggleCloneItem = (itemId: string) => {
    setCloneItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kho Menu Toàn Cục 🍔</h1>
          <p className="text-sm text-gray-500">{categories.length} danh mục · {items.length} món</p>
        </div>
        <div className="flex gap-2">
          {cloneItems.length > 0 && (
            <Button variant="secondary" onClick={() => setCloneModalOpen(true)}>
              📋 Clone {cloneItems.length} món
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'items' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Món ăn ({items.length})
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'categories' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Danh mục ({categories.length})
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-8">
                  <input type="checkbox" onChange={(e) => { if (e.target.checked) setCloneItems(items.map(i => i.id)); else setCloneItems([]); }} checked={cloneItems.length === items.length && items.length > 0} className="cursor-pointer" />
                </th>
                <th className="p-4 font-semibold">Món ăn</th>
                {isAllMode && <th className="p-4 font-semibold">Quán</th>}
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giá</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => {
                const cat = categories.find(c => c.id === item.category_id);
                const shop = shops.find(s => s.id === item.shop_id);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <input type="checkbox" checked={cloneItems.includes(item.id)} onChange={() => toggleCloneItem(item.id)} className="cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                          {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-lg opacity-30">🍽️</span>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          {item.is_featured && <Badge variant="warning" size="sm">Nổi bật</Badge>}
                          {item.tags?.length > 0 && item.tags.map(t => <Badge key={t} size="sm" variant="default" style={{ marginLeft: 4, background: '#f3f4f6', color: '#4b5563' }}>{t}</Badge>)}
                        </div>
                      </div>
                    </td>
                    {isAllMode && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: shop?.theme_config?.primary_color || '#3b82f6' }}>
                            {shop?.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-600">{shop?.name}</span>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-sm text-gray-600">{cat?.name || '—'}</td>
                    <td className="p-4 font-bold text-amber-700">{formatVND(item.price)}</td>
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
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Danh mục</th>
                {isAllMode && <th className="p-4 font-semibold">Quán</th>}
                <th className="p-4 font-semibold">Số món</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(cat => {
                const shop = shops.find(s => s.id === cat.shop_id);
                const itemCount = dbItems.filter(i => i.category_id === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{cat.name}</td>
                    {isAllMode && <td className="p-4 text-sm text-gray-600">{shop?.name}</td>}
                    <td className="p-4 text-sm text-gray-600">{itemCount} món</td>
                    <td className="p-4">
                      <Badge variant={cat.is_active ? 'success' : 'error'} size="sm">
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Clone Items Modal */}
      <Modal isOpen={cloneModalOpen} onClose={() => setCloneModalOpen(false)} title={`Clone ${cloneItems.length} món sang quán khác`}>
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            📋 Sẽ sao chép tên, giá, mô tả, hình ảnh. Danh mục sẽ được tạo mới nếu quán đích chưa có.
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Chọn quán đích</label>
            <select value={cloneTargetShop} onChange={e => setCloneTargetShop(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
              <option value="">-- Chọn quán --</option>
              {(shops as any[]).filter(s => s.status === 'active' || s.is_active).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleCloneItems} fullWidth>🚀 Clone ngay</Button>
        </div>
      </Modal>
    </div>
  );
}
