'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { getCategories, getMenuItems, createCategory, updateCategory, deleteCategory, createMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/actions/menu';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatVND } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import type { MenuCategory, MenuItem } from '@/lib/types/database';

export default function AdminMenuPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);

  // Active filter
  const [selectedCatId, setSelectedCatId] = useState<string | 'all'>('all');

  const fetchData = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        getCategories(shop.id),
        getMenuItems(shop.id),
      ]);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data as MenuCategory[]);
      if (itemsRes.success && itemsRes.data) setItems(itemsRes.data as MenuItem[]);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    if (shop) fetchData();
  }, [shop, fetchData]);

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
    if (!shop) return;

    setCatSaving(true);
    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, { name: catName, description: catDesc || undefined });
        if (!res.success) throw new Error(res.error);
        toast.success('Đã cập nhật danh mục');
      } else {
        const res = await createCategory(shop.id, catName, catDesc || undefined);
        if (!res.success) throw new Error(res.error);
        toast.success('Đã thêm danh mục mới');
      }
      setCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Xóa danh mục này? Các món trong danh mục sẽ mất liên kết.')) return;
    try {
      const res = await deleteCategory(catId);
      if (!res.success) throw new Error(res.error);
      toast.success('Đã xóa danh mục');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa');
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
    if (!shop) return;

    setItemSaving(true);
    try {
      if (editingItem) {
        const res = await updateMenuItem(editingItem.id, {
          name: itemName,
          category_id: itemCategoryId || null,
          price: Number(itemPrice),
          description: itemDesc || null,
          image_url: itemImageUrl || null,
          is_available: itemAvailable,
          is_featured: itemFeatured,
        });
        if (!res.success) throw new Error(res.error);
        toast.success('Đã cập nhật món');
      } else {
        const res = await createMenuItem(shop.id, {
          name: itemName,
          category_id: itemCategoryId || null,
          price: Number(itemPrice),
          description: itemDesc || undefined,
          image_url: itemImageUrl || undefined,
          is_available: itemAvailable,
          is_featured: itemFeatured,
        });
        if (!res.success) throw new Error(res.error);
        toast.success('Đã thêm món mới');
      }
      setItemModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu');
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Xóa món này?')) return;
    try {
      const res = await deleteMenuItem(itemId);
      if (!res.success) throw new Error(res.error);
      toast.success('Đã xóa món');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa');
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      fetchData();
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  };

  // Filter items
  const filteredItems = selectedCatId === 'all'
    ? items
    : items.filter(i => i.category_id === selectedCatId);

  if (shopLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
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

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <Card style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🍽️</p>
          <p>Chưa có món nào. Nhấn "+ Thêm món" để bắt đầu.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredItems.map(item => {
            const catName = categories.find(c => c.id === item.category_id)?.name;
            return (
              <Card key={item.id} className="hover-lift" style={{ display: 'flex', gap: 'var(--space-3)', overflow: 'hidden', opacity: item.is_available ? 1 : 0.6 }}>
                {/* Image */}
                <div style={{
                  width: '80px', height: '80px', flexShrink: 0,
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  background: item.image_url ? undefined : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>🍽️</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                      {item.is_featured && <Badge variant="warning" size="sm">Hot</Badge>}
                      {!item.is_available && <Badge variant="error" size="sm">Hết</Badge>}
                    </div>
                    {catName && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{catName}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatVND(item.price)}</span>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button onClick={() => handleToggleAvailable(item)} style={{ cursor: 'pointer', fontSize: '1rem', background: 'none', border: 'none' }} title={item.is_available ? 'Ẩn món' : 'Hiện món'}>
                        {item.is_available ? '👁️' : '🚫'}
                      </button>
                      <button onClick={() => openItemModal(item)} style={{ cursor: 'pointer', fontSize: '1rem', background: 'none', border: 'none' }}>✏️</button>
                      <button onClick={() => handleDeleteItem(item.id)} style={{ cursor: 'pointer', fontSize: '1rem', background: 'none', border: 'none' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input placeholder="Tên danh mục (VD: Cà phê)" value={catName} onChange={e => setCatName(e.target.value)} autoFocus />
          <Input placeholder="Mô tả (tùy chọn)" value={catDesc} onChange={e => setCatDesc(e.target.value)} />
          <Button onClick={handleSaveCategory} loading={catSaving} fullWidth>
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
          <Input placeholder="URL hình ảnh (tùy chọn)" value={itemImageUrl} onChange={e => setItemImageUrl(e.target.value)} />
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
          <Button onClick={handleSaveItem} loading={itemSaving} fullWidth>
            {editingItem ? 'Cập nhật' : 'Thêm món'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
