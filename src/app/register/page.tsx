'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Gọi API nội bộ thay vì dùng client trực tiếp vì cần quyền SuperAdmin (Service Role)
      // để tự động tạo Shop record và gán User vào đó.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký thất bại!');
      }

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--color-primary)] opacity-5 z-0"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image src="/images/dilinhmenu_app_logo.png" alt="DiLinhMenu Logo" width={64} height={64} className="rounded-2xl shadow-lg mb-4 hover:scale-105 transition-transform" />
          <h1 className="text-3xl font-heading font-bold text-[var(--color-text)] mb-2">
            Đăng ký cửa hàng mới
          </h1>
          <p className="text-[var(--color-text-secondary)]">Bắt đầu dùng thử DiLinhMenu miễn phí</p>
        </div>

        <Card variant="glass" className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Tên quán (Hiển thị cho khách)
              </label>
              <input
                type="text"
                name="shopName"
                required
                value={formData.shopName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Ví dụ: Cà Phê Mai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Email quản trị
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="admin@quancua-ban.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 mt-6 shadow-md"
              disabled={loading}
            >
              {loading ? 'Đang tạo cửa hàng...' : 'Đăng ký ngay'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Đã có tài khoản?{' '}
              <a
                href="/login"
                className="font-semibold text-[var(--color-primary)] hover:underline transition-all"
              >
                Đăng nhập
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
