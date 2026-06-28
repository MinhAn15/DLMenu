'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerAuthModal({ isOpen, onClose, onSuccess }: CustomerAuthModalProps) {
  const { signInWithPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    
    setLoading(true);
    try {
      if (signInWithPhone) {
        await signInWithPhone(phone, name);
        toast.success('Đăng nhập thành công! Bắt đầu tích điểm thôi.');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        toast.error('Lỗi: Tính năng chưa được tích hợp đầy đủ.');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng nhập để tích điểm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="bg-orange-50 text-[var(--color-primary)] p-3 rounded-lg text-sm mb-2 text-center border border-orange-100">
          Chỉ cần nhập Số điện thoại, chúng tôi sẽ khởi tạo ví điểm cho bạn ngay lập tức!
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
          <Input 
            type="tel" 
            placeholder="Ví dụ: 0988123456" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            disabled={loading}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tên của bạn (Tùy chọn)</label>
          <Input 
            type="text" 
            placeholder="Nhân viên sẽ dễ dàng gọi bạn hơn" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            disabled={loading}
          />
        </div>
        
        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.5rem' }}>
          Bắt đầu tích điểm
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc nhanh hơn nữa</span>
          </div>
        </div>

        <a 
          href={`/api/auth/zalo?redirect_to=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0068FF] text-white rounded-lg font-semibold hover:bg-[#0054cc] transition-colors shadow-sm"
        >
          <div className="bg-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-[#0068FF] font-bold text-xs">Z</div>
          Đăng nhập 1-chạm bằng Zalo
        </a>
      </form>
    </Modal>
  );
}
