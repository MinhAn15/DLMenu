'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { getPromotions, createPromotion, deletePromotion, togglePromotionActive } from '@/lib/actions/shop';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import type { Promotion } from '@/lib/types/database';

export default function AdminPromotionsPage() {
  const { shop, loading: shopLoading } = useAdminShop();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoType, setPromoType] = useState('discount');
  const [promoPercent, setPromoPercent] = useState('');
  const [promoStartsAt, setPromoStartsAt] = useState('');
  const [promoEndsAt, setPromoEndsAt] = useState('');
  const [promoMaxUses, setPromoMaxUses] = useState('');

  const fetchPromos = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const res = await getPromotions(shop.id);
      if (res.success && res.data) setPromos(res.data as Promotion[]);
    } catch {
      toast.error('Lỗi tải khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    if (shop) fetchPromos();
  }, [shop, fetchPromos]);

  const openModal = () => {
    setPromoName('');
    setPromoDesc('');
    setPromoType('discount');
    setPromoPercent('10');
    const now = new Date();
    setPromoStartsAt(now.toISOString().slice(0, 16));
    const weekLater = new Date(now.getTime() + 7 * 86400000);
    setPromoEndsAt(weekLater.toISOString().slice(0, 16));
    setPromoMaxUses('');
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!promoName.trim()) { toast.error('Nhập tên khuyến mãi'); return; }
    if (!shop) return;
    setSaving(true);
    try {
      const res = await createPromotion(shop.id, {
        name: promoName,
        description: promoDesc || undefined,
        type: promoType,
        discount_percent: promoPercent ? Number(promoPercent) : undefined,
        starts_at: new Date(promoStartsAt).toISOString(),
        ends_at: new Date(promoEndsAt).toISOString(),
        max_uses: promoMaxUses ? Number(promoMaxUses) : undefined,
      });
      if (!res.success) throw new Error(res.error);
      toast.success('Đã tạo khuyến mãi');
      setModalOpen(false);
      fetchPromos();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo khuyến mãi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa khuyến mãi này?')) return;
    try {
      await deletePromotion(id);
      toast.success('Đã xóa');
      fetchPromos();
    } catch {
      toast.error('Lỗi xóa');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await togglePromotionActive(id, !isActive);
      fetchPromos();
    } catch {
      toast.error('Lỗi cập nhật');
    }
  };

  const isPromoActive = (promo: Promotion) => {
    const now = new Date();
    return promo.is_active && new Date(promo.starts_at) <= now && new Date(promo.ends_at) >= now;
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
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Khuyến mãi</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {promos.filter(p => isPromoActive(p)).length} đang hoạt động
          </p>
        </div>
        <Button onClick={openModal}>+ Tạo khuyến mãi</Button>
      </div>

      {promos.length === 0 ? (
        <Card style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🎁</p>
          <p>Chưa có khuyến mãi. Tạo chương trình mới để thu hút khách hàng!</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {promos.map(promo => (
            <Card key={promo.id} className="hover-lift" style={{ opacity: isPromoActive(promo) ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontWeight: 700 }}>{promo.name}</h3>
                  {promo.description && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>{promo.description}</p>}
                </div>
                <Badge variant={isPromoActive(promo) ? 'success' : 'default'} size="sm">
                  {isPromoActive(promo) ? 'Đang chạy' : promo.is_active ? 'Chưa/Hết hạn' : 'Đã tắt'}
                </Badge>
              </div>

              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                {promo.discount_percent && <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: 'var(--font-size-lg)' }}>-{promo.discount_percent}%</span>}
                <br />
                📅 {new Date(promo.starts_at).toLocaleDateString('vi-VN')} → {new Date(promo.ends_at).toLocaleDateString('vi-VN')}
                <br />
                {promo.max_uses ? `🎯 ${promo.current_uses}/${promo.max_uses} lượt` : '♾️ Không giới hạn'}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button size="sm" variant="secondary" onClick={() => handleToggle(promo.id, promo.is_active)}>
                  {promo.is_active ? '⏸ Tắt' : '▶️ Bật'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleDelete(promo.id)}>🗑️ Xóa</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Promo Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tạo khuyến mãi mới">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input placeholder="Tên khuyến mãi *" value={promoName} onChange={e => setPromoName(e.target.value)} autoFocus />
          <Input placeholder="Mô tả (tùy chọn)" value={promoDesc} onChange={e => setPromoDesc(e.target.value)} />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Loại</label>
            <select
              value={promoType}
              onChange={e => setPromoType(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'inherit' }}
            >
              <option value="discount">Giảm giá %</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="bogo">Mua 1 tặng 1</option>
            </select>
          </div>
          <Input type="number" placeholder="Phần trăm giảm (VD: 10)" value={promoPercent} onChange={e => setPromoPercent(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Bắt đầu</label>
              <input type="datetime-local" value={promoStartsAt} onChange={e => setPromoStartsAt(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Kết thúc</label>
              <input type="datetime-local" value={promoEndsAt} onChange={e => setPromoEndsAt(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontFamily: 'inherit' }} />
            </div>
          </div>
          <Input type="number" placeholder="Giới hạn lượt (để trống = vô hạn)" value={promoMaxUses} onChange={e => setPromoMaxUses(e.target.value)} />
          <Button onClick={handleCreate} loading={saving} fullWidth>Tạo khuyến mãi</Button>
        </div>
      </Modal>
    </div>
  );
}
