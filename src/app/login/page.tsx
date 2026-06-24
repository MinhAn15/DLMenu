'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'platform_admin') {
        router.push('/platform-admin');
      } else {
        router.push('/admin');
      }
    }
  }, [user, profile, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Đăng nhập thành công!');
      // Redirection is handled by useEffect when profile is loaded
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng nhập';
      if (errMsg === 'Invalid login credentials') {
        toast.error('Tài khoản hoặc mật khẩu không chính xác');
      } else {
        toast.error(errMsg || 'Đã xảy ra lỗi khi đăng nhập');
      }
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
            <Coffee size={32} strokeWidth={2.5} />
          </div>
          <h1 className={styles.authTitle}>Chào mừng trở lại</h1>
          <p className={styles.authSubtitle}>Đăng nhập để quản lý quán của bạn</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email quản trị</label>
            <Input
              type="email"
              placeholder="VD: admin@quanmai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mật khẩu</label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mt-2">
            <Button type="submit" loading={loading} fullWidth size="lg">
              Đăng nhập
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.authFooter}>
          <p>
            Chưa có tài khoản?{' '}
            <a href="/register" className={styles.authLink}>Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
}
