'use client';

import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { trpc } from '@/lib/trpc/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatVND } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import type { MenuCategory, MenuItem } from '@/lib/types/database';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ImageGenerator from '@/components/ai/ImageGenerator';

export default function AdminMenuPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const shopId = shop?.id ?? '';
  const utils = trpc.useUtils();

  const { data: categories = [], isLoading: catsLoading } = trpc.menu.getCategories.useQuery(
    { shopId },
    { enabled: !!shop },
  );
  const { data: items = [], isLoading: itemsLoading } = trpc.menu.getMenuItems.useQuery(
    { shopId },
    { enabled: !!shop },
  );

  const loading = shopLoading || catsLoading || itemsLoading;

  const createCatMutation = trpc.menu.createCategory.useMutation({
    onSuccess: () => { utils.menu.getCategories.invalidate(); },
  });
  const updateCatMutation = trpc.menu.updateCategory.useMutation({
    onSuccess: () => { utils.menu.getCategories.invalidate(); },
  });
  const deleteCatMutation = trpc.menu.deleteCategory.useMutation({
    onSuccess: () => { utils.menu.getCategories.invalidate(); },
  });
  const createItemMutation = trpc.menu.createMenuItem.useMutation({
    onSuccess: () => { utils.menu.getMenuItems.invalidate(); },
  });
  const updateItemMutation = trpc.menu.updateMenuItem.useMutation({
    onSuccess: () => { utils.menu.getMenuItems.invalidate(); },
  });
  const deleteItemMutation = trpc.menu.deleteMenuItem.useMutation({
    onSuccess: () => { utils.menu.getMenuItems.invalidate(); },
  });

  // Modal states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFeatured, setItemFeatured] = useState(false);

  // Active filter
  const [selectedCatId, setSelectedCatId] = useState<string | 'all'>('all');
  // eslint-disable-next-line react-hooks/purity
  const newItemIdRef = useRef(`new-${Date.now()}`);
  const newItemId = newItemIdRef.current; // eslint-disable-line

  // ========== CATEGORY HANDLERS ==========
  const openCatModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) { toast.error('Nhập tên danh mục'); return; }
    try {
      if (editingCategory) {
        await updateCatMutation.mutateAsync({ id: editingCategory.id, name: catName, description: catDesc || undefined });
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCatMutation.mutateAsync({ shopId, name: catName, description: catDesc || undefined });
        toast.success('Đã thêm danh mục mới');
      }
      setCatModalOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu danh mục');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Xóa danh mục này? Các món trong danh mục sẽ mất liên kết.')) return;
    try {
      await deleteCatMutation.mutateAsync({ id: catId });
      toast.success('Đã xóa danh mục');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xóa');
    }
  };

  // ========== ITEM HANDLERS ==========
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemPrice(item.price.toString());
      setItemDesc(item.description || '');
      setItemCategoryId(item.category_id || '');
      setItemImageUrl(item.image_url || '');
      setItemAvailable(item.is_available);
      setItemFeatured(item.is_featured);
    } else {
      setEditingItem(null);
      setItemName('');
      setItemPrice('');
      setItemDesc('');
      setItemCategoryId(selectedCatId !== 'all' ? selectedCatId : (categories[0]?.id || ''));
      setItemImageUrl('');
      setItemAvailable(true);
      setItemFeatured(false);
    }
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) { toast.error('Nhập tên món'); return; }
    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) { toast.error('Giá phải là số dương'); return; }
    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          name: itemName,
          categoryId: itemCategoryId || null,
          price: Number(itemPrice),
          description: itemDesc || null,
          imageUrl: itemImageUrl || null,
          isAvailable: itemAvailable,
        });
        toast.success('Đã cập nhật món');
      } else {
        await createItemMutation.mutateAsync({
          shopId,
          name: itemName,
          categoryId: itemCategoryId || null,
          price: Number(itemPrice),
          description: itemDesc || undefined,
          imageUrl: itemImageUrl || undefined,
        });
        toast.success('Đã thêm món mới');
      }
      setItemModalOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Xóa món này?')) return;
    try {
      await deleteItemMutation.mutateAsync({ id: itemId });
      toast.success('Đã xóa món');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xóa');
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await updateItemMutation.mutateAsync({ id: item.id, isAvailable: !item.is_available });
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  };

  // Filter items
  const filteredItems = selectedCatId === 'all'
    ? items
    : items.filter(i => i.category_id === selectedCatId);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="200px" height="32px" />
          <div className="flex gap-2">
            <Skeleton width="100px" height="40px" borderRadius="var(--radius-md)" />
            <Skeleton width="100px" height="40px" borderRadius="var(--radius-md)" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 flex gap-4">
              <Skeleton width="60px" height="60px" borderRadius="var(--radius-md)" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <Skeleton width="40%" height="20px" />
                <Skeleton width="20%" height="16px" />
              </div>
              <Skeleton width="80px" height="24px" className="self-center" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thực đơn</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length} danh mục · {items.length} món
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => openCatModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Danh mục
          </Button>
          <Button onClick={() => openItemModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm món
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <div className="font-semibold text-gray-900 mb-2 px-2">Danh mục</div>
          <button
            onClick={() => setSelectedCatId('all')}
            className={`flex justify-between items-center px-4 py-3 rounded-xl text-left transition-all font-medium text-sm ${
              selectedCatId === 'all' 
                ? 'bg-[var(--color-primary)] text-white shadow-md' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span>Tất cả món</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCatId === 'all' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
              {items.length}
            </span>
          </button>
          
          {categories.map(cat => {
            const count = items.filter(i => i.category_id === cat.id).length;
            const isActive = selectedCatId === cat.id;
            return (
              <div key={cat.id} className="group relative flex items-center">
                <button
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex-1 flex justify-between items-center px-4 py-3 rounded-xl text-left transition-all font-medium text-sm ${
                    isActive 
                      ? 'bg-[var(--color-primary)] text-white shadow-md' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
                {/* Hover Actions */}
                <div className={`absolute right-0 flex items-center pr-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  <button onClick={(e) => { e.stopPropagation(); openCatModal(cat); }} className="p-1.5 rounded hover:bg-black/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="p-1.5 rounded hover:bg-black/10 transition-colors text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => openCatModal()}
            className="flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 w-full min-w-0">
          <Card className="shadow-sm border border-gray-200 overflow-hidden bg-white">
            {filteredItems.length === 0 ? (
              <EmptyState 
                title="Chưa có món nào" 
                description="Nhấn '+ Thêm món' để bắt đầu tạo thực đơn cho quán của bạn."
                icon={<div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4 mx-auto"><ImageIcon className="w-8 h-8" /></div>}
                actionLabel="+ Thêm món"
                onAction={() => openItemModal()}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-4 pl-6">Món ăn</th>
                      <th className="p-4">Danh mục</th>
                      <th className="p-4">Giá bán</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredItems.map(item => {
                      const catName = categories.find(c => c.id === item.category_id)?.name;
                      return (
                        <tr key={item.id} className={`group hover:bg-gray-50/50 transition-colors ${!item.is_available ? 'opacity-60 bg-gray-50/30' : ''}`}>
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{item.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.is_featured && <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Hot</span>}
                                  {(item.tags || []).map((tag: string) => (
                                    <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 text-sm font-medium">{catName || '—'}</td>
                          <td className="p-4 font-bold text-gray-900">{formatVND(item.price)}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={item.is_available} 
                                  onChange={() => handleToggleAvailable(item)} 
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                              </label>
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openItemModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input placeholder="Tên danh mục (VD: Cà phê)" value={catName} onChange={e => setCatName(e.target.value)} autoFocus />
          <Input placeholder="Mô tả (tùy chọn)" value={catDesc} onChange={e => setCatDesc(e.target.value)} />
          <Button onClick={handleSaveCategory} loading={createCatMutation.isPending || updateCatMutation.isPending} fullWidth>
            {editingCategory ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal isOpen={itemModalOpen} onClose={() => setItemModalOpen(false)} title={editingItem ? 'Sửa món' : 'Thêm món mới'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input placeholder="Tên món *" value={itemName} onChange={e => setItemName(e.target.value)} autoFocus />
          <Input type="number" placeholder="Giá (VND) *" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
              Danh mục
            </label>
            <select
              value={itemCategoryId}
              onChange={e => setItemCategoryId(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)',
                fontSize: 'var(--font-size-base)', fontFamily: 'inherit',
                background: 'white', cursor: 'pointer',
              }}
            >
              <option value="">-- Không chọn --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input placeholder="Mô tả ngắn" value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text-secondary)',
            }}>
              Hình ảnh món ăn
            </label>
            {shop && (
              <ImageGenerator
                shopId={shop.id}
                itemId={editingItem?.id || newItemId}
                onImageGenerated={(url) => setItemImageUrl(url)}
                currentImageUrl={itemImageUrl || null}
              />
            )}
          </div>
          <details style={{ marginBottom: 'var(--space-4)' }}>
            <summary style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              Hoặc nhập URL thủ công
            </summary>
            <Input placeholder="URL hình ảnh (tùy chọn)" value={itemImageUrl} onChange={e => setItemImageUrl(e.target.value)} />
          </details>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
              <input type="checkbox" checked={itemAvailable} onChange={e => setItemAvailable(e.target.checked)} />
              Còn hàng
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
              <input type="checkbox" checked={itemFeatured} onChange={e => setItemFeatured(e.target.checked)} />
              Nổi bật (Hot)
            </label>
          </div>
          <Button onClick={handleSaveItem} loading={createItemMutation.isPending || updateItemMutation.isPending} fullWidth>
            {editingItem ? 'Cập nhật' : 'Thêm món'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
