'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.authHeader}>
          <div className={styles.logoIcon}>
            <Store size={32} strokeWidth={2.5} />
          </div>
          <h1 className={styles.authTitle}>Đăng ký quán mới</h1>
          <p className={styles.authSubtitle}>Bắt đầu dùng thử DiLinhMenu miễn phí</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tên quán (Hiển thị cho khách)</label>
            <Input
              type="text"
              name="shopName"
              placeholder="VD: Cà Phê Mai"
              value={formData.shopName}
              onChange={handleChange}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email quản trị</label>
            <Input
              type="email"
              name="email"
              placeholder="admin@quancua-ban.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mật khẩu</label>
            <Input
              type="password"
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Xác nhận mật khẩu</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="mt-2">
            <Button type="submit" loading={loading} fullWidth size="lg">
              Đăng ký ngay
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.authFooter}>
          <p>
            Đã có tài khoản?{' '}
            <a href="/login" className={styles.authLink}>Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
}
