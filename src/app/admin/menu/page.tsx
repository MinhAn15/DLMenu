'use client';

import React, { useState, useRef } from 'react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Quản lý Thực đơn</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {categories.length} danh mục · {items.length} món
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={() => openCatModal()}>+ Danh mục</Button>
          <Button onClick={() => openItemModal()}>+ Thêm món</Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
        <button
          onClick={() => setSelectedCatId('all')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            border: 'none',
            cursor: 'pointer',
            background: selectedCatId === 'all' ? 'var(--color-primary)' : 'var(--color-bg)',
            color: selectedCatId === 'all' ? 'white' : 'var(--color-text-secondary)',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          Tất cả ({items.length})
        </button>
        {categories.map(cat => {
          const count = items.filter(i => i.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                border: 'none',
                cursor: 'pointer',
                background: selectedCatId === cat.id ? 'var(--color-primary)' : 'var(--color-bg)',
                color: selectedCatId === cat.id ? 'white' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Category Management Row */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <Card key={cat.id} padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{cat.name}</span>
              <button onClick={() => openCatModal(cat)} style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', background: 'none', border: 'none' }}>✏️</button>
              <button onClick={() => handleDeleteCategory(cat.id)} style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', background: 'none', border: 'none' }}>🗑️</button>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState 
          title="Chưa có món nào" 
          description="Nhấn '+ Thêm món' để bắt đầu tạo thực đơn cho quán của bạn."
          icon={<span style={{ fontSize: '2rem' }}>🍽️</span>}
          actionLabel="+ Thêm món"
          onAction={() => openItemModal()}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Món ăn</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giá</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(item => {
                const catName = categories.find(c => c.id === item.category_id)?.name;
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl opacity-30">🍽️</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <div className="flex gap-1">
                            {(item.tags || []).map((tag: string) => (
                              <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{catName || '—'}</td>
                    <td className="p-4 font-bold text-[var(--color-primary)]">{formatVND(item.price)}</td>
                    <td className="p-4">
                      <Badge variant={item.is_available ? 'success' : 'error'} size="sm">
                        {item.is_available ? 'Đang bán' : 'Hết hàng'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleToggleAvailable(item)} className="p-2 text-gray-400 hover:text-gray-800 transition-colors" title={item.is_available ? 'Ẩn món' : 'Hiện món'}>
                          {item.is_available ? '👁️' : '🚫'}
                        </button>
                        <button onClick={() => openItemModal(item)} className="p-2 text-blue-500 hover:text-blue-700 transition-colors" title="Sửa">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-500 hover:text-red-700 transition-colors" title="Xóa">
                          🗑️
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
