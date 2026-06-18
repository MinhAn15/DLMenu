'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function PhoneLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Đăng nhập thành công');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold">Đăng nhập</h2>
        <p className="text-gray-500 text-sm">Nhập email để tiếp tục</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <Input
          type="email"
          placeholder="Ví dụ: name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
        <Input
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button type="submit" loading={loading} fullWidth>
        Đăng nhập
      </Button>
    </form>
  );
}
