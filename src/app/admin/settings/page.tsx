'use client';

import React, { useState } from 'react';
import { useAdminShop } from '@/hooks/useAdminShop';
import { trpc } from '@/lib/trpc/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { Store, Palette, CreditCard, Crown, Smartphone } from 'lucide-react';

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
      toast.success('Đã cập nhật thông tin thành công');
      setSaving(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu');
      setSaving(false);
    },
  });

  const updateThemeMutation = trpc.shop.settings.updateTheme.useMutation({
    onSuccess: () => {
      toast.success('Đã cập nhật cấu hình giao diện & thanh toán');
      setSavingTheme(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu');
      setSavingTheme(false);
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!shop || !name.trim()) { 
      toast.error('Tên cửa hàng không được để trống'); 
      return; 
    }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cài đặt</h1>
        <p className="text-gray-500">Quản lý cấu hình, giao diện hiển thị và thông tin thanh toán của cửa hàng.</p>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* Section: Shop Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin chung</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tên quán, địa chỉ và thông tin liên hệ. Thông tin này sẽ hiển thị trên menu điện tử của khách hàng.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <Card className="flex flex-col gap-5 bg-white border-gray-100 shadow-sm" padding="lg">
            <Input 
              label="Tên cửa hàng" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="VD: Quán Cà Phê Mai" 
              required
            />
            <Input 
              label="Mô tả ngắn" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Giới thiệu không gian hoặc đặc sản của quán..." 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input 
                label="Số điện thoại" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="0901234567" 
                type="tel" 
              />
              <Input 
                label="Đường dẫn (Slug)" 
                value={shop?.slug || ''} 
                disabled 
                className="bg-gray-50 opacity-70 cursor-not-allowed"
              />
            </div>
            <Input 
              label="Địa chỉ" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="123 Đường Hùng Vương, Di Linh" 
            />
            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveInfo} loading={saving} className="min-w-[140px]">
                Lưu thông tin
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* Section: Theme & UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Giao diện</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tùy chỉnh màu sắc thương hiệu. Chọn một màu sắc nổi bật để tạo ấn tượng riêng cho menu của bạn.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <Card className="flex flex-col gap-6 bg-white border-gray-100 shadow-sm" padding="lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Màu chủ đạo</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className="w-10 h-10 rounded-full transition-transform active:scale-95 shadow-sm"
                    style={{
                      background: color, 
                      border: primaryColor === color ? '3px solid #2563EB' : '1px solid #E5E7EB',
                      transform: primaryColor === color ? 'scale(1.1)' : 'scale(1)',
                    }}
                    aria-label={`Chọn màu ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer bg-transparent" 
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Mã HEX</span>
                    <Input 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)} 
                      className="w-32 uppercase text-sm font-mono mt-1" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Banner */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Xem trước hiển thị</span>
              </div>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center text-white font-bold text-lg" style={{ background: primaryColor }}>
                    {name.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900" style={{ color: primaryColor }}>{name || 'Tên Quán'}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Thực đơn điện tử</p>
                  </div>
                </div>
                <div 
                  className="px-4 py-2 rounded-lg text-white font-semibold text-sm shadow-sm opacity-90"
                  style={{ background: primaryColor }}
                >
                  Gọi món
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* Section: Payment Config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Thanh toán (VietQR)</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Hệ thống sẽ tự động tạo mã QR chuyển khoản dựa trên thông tin này để khách hàng quét nhanh.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <Card className="flex flex-col gap-5 bg-white border-gray-100 shadow-sm" padding="lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input 
                label="Mã Ngân Hàng (VD: MB, VCB, ACB)" 
                value={bankId} 
                onChange={e => setBankId(e.target.value.toUpperCase())} 
                placeholder="VD: MB" 
              />
              <Input 
                label="Số Tài Khoản" 
                value={accountNo} 
                onChange={e => setAccountNo(e.target.value)} 
                placeholder="0901234567" 
              />
            </div>
            <Input 
              label="Tên Chủ Tài Khoản" 
              value={accountName} 
              onChange={e => setAccountName(e.target.value.toUpperCase())} 
              placeholder="NGUYEN VAN A" 
            />
            
            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mt-2 flex items-start gap-3">
              <div className="mt-0.5 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </div>
              <p>Mã QR sẽ tự động được tạo động với số tiền chính xác trên mỗi đơn hàng nếu thông tin này được cung cấp đầy đủ.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSaveTheme} loading={savingTheme} className="min-w-[200px]">
                Lưu cấu hình hệ thống
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* Section: Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Gói dịch vụ</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Xem gói dịch vụ hiện tại và hạn mức sử dụng.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <Card className="flex items-center justify-between bg-white border-gray-100 shadow-sm" padding="lg">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Trạng thái hiện tại</span>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                  ${shop?.subscription_tier === 'premium' ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md' :
                    shop?.subscription_tier === 'pro' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 
                    'bg-gray-100 text-gray-700'
                  }
                `}>
                  {shop?.subscription_tier === 'premium' ? 'PREMIUM (Early Adopter)' : shop?.subscription_tier || 'FREE'}
                </span>
                {shop?.subscription_tier === 'premium' && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    Có hiệu lực 3 tháng
                  </span>
                )}
              </div>
            </div>
            <Button variant="secondary" disabled>
              Gia hạn gói
            </Button>
          </Card>
        </div>
      </div>

    </div>
  );
}
