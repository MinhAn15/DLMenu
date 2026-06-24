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
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error('Vui lòng nhập email và mật khẩu (tối thiểu 6 ký tự)');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success('Đăng nhập thành công');
      } else {
        await signUpWithEmail(email, password, name || 'Khách hàng');
        toast.success('Đăng ký thành công');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên</label>
            <Input 
              type="text" 
              placeholder="Nhập họ tên của bạn" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <Input 
            type="email" 
            placeholder="Ví dụ: khach@email.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
          <Input 
            type="password" 
            placeholder="Tối thiểu 6 ký tự" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        
        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.5rem' }}>
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </Button>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[var(--color-primary)] font-semibold hover:underline"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
}
