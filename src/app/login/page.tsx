'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithOTP, verifyOTP, user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await signInWithOTP(phone);
      setStep(2);
      toast.success('Mã OTP đã được gửi đến điện thoại của bạn');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Mã OTP phải có 6 số');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      toast.success('Đăng nhập thành công!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Mã OTP không chính xác');
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
          <div className={styles.logoIcon}>☕</div>
          <h1 className={styles.logoTitle}>
            DiLinh<span className={styles.logoAccent}>Menu</span>
          </h1>
          <p className={styles.logoSubtitle}>Quản lý cửa hàng của bạn</p>
        </div>

        {/* Login Form */}
        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              type="tel"
              placeholder="Nhập số điện thoại (VD: 0901234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Nhận mã OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Mã 6 số đã gửi đến <strong>{phone}</strong>
              </p>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Nhập mã 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              autoFocus
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Xác nhận đăng nhập
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setStep(1); setOtp(''); }}
              disabled={loading}
            >
              ← Đổi số điện thoại
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p>© 2024 DiLinhMenu. Nền tảng quản lý quán thông minh.</p>
        </div>
      </div>
    </div>
  );
}
