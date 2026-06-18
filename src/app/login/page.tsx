'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

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
      router.push('/admin');
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
          <Image src="/images/dilinhmenu_app_logo.png" alt="DiLinhMenu Logo" width={64} height={64} className="rounded-2xl shadow-md mb-2" />
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
