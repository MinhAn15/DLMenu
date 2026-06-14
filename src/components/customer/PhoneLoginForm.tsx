'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function PhoneLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signInWithOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.success('Mã OTP đã được gửi');
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
      toast.success('Đăng nhập thành công');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold">Đăng nhập</h2>
          <p className="text-gray-500 text-sm">Nhập số điện thoại để tiếp tục</p>
        </div>
        <Input
          type="tel"
          placeholder="Ví dụ: 0901234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <Button type="submit" loading={loading} fullWidth>
          Nhận mã OTP
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold">Xác thực OTP</h2>
        <p className="text-gray-500 text-sm">Mã 6 số đã được gửi đến {phone}</p>
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
      <Button type="submit" loading={loading} fullWidth>
        Xác nhận
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setStep(1)}
        disabled={loading}
      >
        Đổi số điện thoại
      </Button>
    </form>
  );
}
