'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { trpc } from '@/lib/trpc/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#6B4226', '#8B4513', '#D2691E', '#A0522D',
  '#2D5016', '#1B4332', '#14532D', '#166534',
  '#1E3A5F', '#1E40AF', '#1D4ED8', '#2563EB',
  '#7C3AED', '#6D28D9', '#9333EA', '#A855F7',
  '#BE185D', '#DB2777', '#EC4899', '#F43F5E',
  '#000000', '#374151', '#6B7280', '#9CA3AF',
];

export default function AdminSettingsPage() {
  const { shop, loading: shopLoading } = useAdminShop();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const [primaryColor, setPrimaryColor] = useState('');
  const [bankId, setBankId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savingTheme, setSavingTheme] = useState(false);

  const updateInfoMutation = trpc.shop.settings.updateInfo.useMutation({
    onSuccess: () => {
      toast.success('Đã cập nhật thông tin');
      setSaving(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi lưu');
      setSaving(false);
    },
  });

  const updateThemeMutation = trpc.shop.settings.updateTheme.useMutation({
    onSuccess: () => {
      toast.success('Đã cập nhật giao diện');
      setSavingTheme(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi lưu');
      setSavingTheme(false);
    },
  });

  // Initialize from shop
  React.useEffect(() => {
    if (shop) {
      setName(shop.name);
      setDescription(shop.description || '');
      setPhone(shop.phone || '');
      setAddress(shop.address || '');
      setPrimaryColor(shop.theme_config.primary_color);
      setBankId(shop.theme_config.bank_info?.bank_id || '');
      setAccountNo(shop.theme_config.bank_info?.account_no || '');
      setAccountName(shop.theme_config.bank_info?.account_name || '');
    }
  }, [shop]);

  const handleSaveInfo = async () => {
    if (!shop || !name.trim()) { toast.error('Tên cửa hàng không được trống'); return; }
    setSaving(true);
    updateInfoMutation.mutate({ shopId: shop.id, name, description, phone, address });
  };

  const handleSaveTheme = async () => {
    if (!shop) return;
    setSavingTheme(true);
    updateThemeMutation.mutate({
      shopId: shop.id,
      primaryColor,
      font: shop.theme_config.font,
      bankId,
      accountNo,
      accountName,
    });
  };

  if (shopLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#111' }}>Cài đặt cửa hàng</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Cập nhật thông tin và giao diện
        </p>
      </div>

      {/* Shop Info */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          🏪 Thông tin cửa hàng
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Tên cửa hàng *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Quán Cà Phê Mai" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Mô tả</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Giới thiệu ngắn về quán..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Số điện thoại</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0901234567" type="tel" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Slug</label>
              <Input value={shop?.slug || ''} disabled />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Địa chỉ</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Đường Hùng Vương, Di Linh" />
          </div>
          <Button onClick={handleSaveInfo} loading={saving}>Lưu thông tin</Button>
        </div>
      </Card>

      {/* Theme */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          🎨 Giao diện
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Màu chủ đạo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: color, border: primaryColor === color ? '3px solid var(--color-text)' : '2px solid var(--color-border)',
                    cursor: 'pointer', transition: 'transform var(--transition-fast)',
                    transform: primaryColor === color ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} />
              <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ maxWidth: '140px' }} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Xem trước</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: primaryColor }} />
              <div>
                <div style={{ fontWeight: 700, color: primaryColor }}>Tên quán</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Khách hàng sẽ thấy màu này</div>
              </div>
              <button style={{
                marginLeft: 'auto', padding: 'var(--space-2) var(--space-4)',
                background: primaryColor, color: 'white', border: 'none',
                borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--font-size-sm)',
              }}>
                Thêm món
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-2) 0' }} />
          
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>💳 Thông tin Nhận chuyển khoản (VietQR)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Mã Ngân Hàng (VD: MB, VCB)</label>
                <Input value={bankId} onChange={e => setBankId(e.target.value.toUpperCase())} placeholder="VD: MB" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Số Tài Khoản</label>
                <Input value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="0901234567" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Tên Chủ Tài Khoản</label>
                <Input value={accountName} onChange={e => setAccountName(e.target.value.toUpperCase())} placeholder="NGUYEN VAN A" />
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              * Thông tin này sẽ dùng để tạo mã VietQR tự động cho khách hàng khi thanh toán chuyển khoản.
            </p>
          </div>

          <Button onClick={handleSaveTheme} loading={savingTheme}>Lưu Giao diện & Ngân hàng</Button>
        </div>
      </Card>

      {/* Subscription Info */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          💎 Gói dịch vụ
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              display: 'inline-block', padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)', fontWeight: 700,
              background: shop?.subscription_tier === 'premium' ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                shop?.subscription_tier === 'pro' ? 'linear-gradient(135deg, #6B4226, #8B6842)' : 'var(--color-bg)',
              color: shop?.subscription_tier === 'free' ? 'var(--color-text-secondary)' : 'white',
              fontSize: 'var(--font-size-sm)',
              textTransform: 'uppercase',
            }}>
              {shop?.subscription_tier || 'free'}
            </span>
          </div>
          <Button variant="secondary" size="sm" disabled>Nâng cấp (Sắp có)</Button>
        </div>
      </Card>
    </div>
  );
}
