'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import styles from './page.module.css';

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
    } catch (error: any) {
      const errMsg = error.message;
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
    <div className={styles.loginPage}>
      {/* Decorative coffee beans */}
      <div className={styles.beans}>
        <span className={styles.bean}>☕</span>
        <span className={styles.bean}>☕</span>
        <span className={styles.bean}>☕</span>
        <span className={styles.bean}>☕</span>
        <span className={styles.bean}>☕</span>
      </div>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md mx-auto mb-4">
            <Coffee size={32} />
          </div>
          <h1 className={styles.logoTitle}>
            DiLinh<span className={styles.logoAccent}>Menu</span>
          </h1>
          <p className={styles.logoSubtitle}>Dành cho Chủ quán & Đối tác</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            type="email"
            placeholder="Nhập Email (VD: admin@quanmai.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <Input
            type="password"
            placeholder="Nhập Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Đăng nhập
          </Button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>© 2024 DiLinhMenu. Nền tảng quản lý quán thông minh.</p>
        </div>
      </div>
    </div>
  );
}
