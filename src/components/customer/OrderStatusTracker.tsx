'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import { formatVND } from '@/lib/utils/format';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

interface OrderStatusTrackerProps {
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod?: string;
  bankInfo?: {
    bank_id: string;
    account_no: string;
    account_name: string;
  };
  onClose: () => void;
}

export default function OrderStatusTracker({ orderNumber, status, total, paymentMethod, bankInfo, onClose }: OrderStatusTrackerProps) {
  const t = useTranslations();
  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="animate-slide-up" style={{
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      maxWidth: '420px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-xl)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>
          {isCancelled ? '❌' : currentIndex >= 4 ? '✅' : '🛒'}
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
          {isCancelled ? t('customer.order.cancelled') : currentIndex >= 4 ? t('customer.order.completed') : t('customer.order.placed')}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          {t('customer.order.order_number', { id: orderNumber })} · {formatVND(total)}
        </p>
      </div>

      {/* VietQR Section */}
      {paymentMethod === 'transfer' && bankInfo && (
        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center text-center">
          <h3 className="font-bold text-orange-800 text-sm mb-2">Quét mã để thanh toán</h3>
          <div className="bg-white p-2 rounded-lg shadow-sm w-48 h-48 relative mb-2">
            <img 
              src={`https://img.vietqr.io/image/${bankInfo.bank_id}-${bankInfo.account_no}-compact2.png?amount=${total}&addInfo=${orderNumber}&accountName=${encodeURIComponent(bankInfo.account_name)}`} 
              alt="VietQR"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-xs text-gray-600">
            <p><strong>Ngân hàng:</strong> {bankInfo.bank_id}</p>
            <p><strong>STK:</strong> {bankInfo.account_no}</p>
            <p><strong>Tên:</strong> {bankInfo.account_name}</p>
          </div>
        </div>
      )}

      {/* Status Steps */}
      {!isCancelled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 'var(--space-6)' }}>
          {STATUS_STEPS.map((step, index) => {
            const isPast = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const color = isPast ? ORDER_STATUS_COLORS[step] || 'var(--color-success)' : 'var(--color-border)';

            return (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                {/* Dot and line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' }}>
                  <div style={{
                    width: isCurrent ? '20px' : '14px',
                    height: isCurrent ? '20px' : '14px',
                    borderRadius: '50%',
                    background: isPast ? color : 'var(--color-border-light)',
                    border: isCurrent ? `3px solid ${color}` : 'none',
                    boxShadow: isCurrent ? `0 0 0 4px ${color}20` : 'none',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    marginTop: '2px',
                  }} />
                  {index < STATUS_STEPS.length - 1 && (
                    <div style={{
                      width: '2px', height: '28px',
                      background: isPast && index < currentIndex ? color : 'var(--color-border-light)',
                      transition: 'background 0.3s ease',
                    }} />
                  )}
                </div>

                {/* Label */}
                <div style={{
                  paddingBottom: 'var(--space-3)',
                  opacity: isPast ? 1 : 0.4,
                }}>
                  <div style={{
                    fontWeight: isCurrent ? 700 : 500,
                    fontSize: isCurrent ? 'var(--font-size-base)' : 'var(--font-size-sm)',
                    color: isCurrent ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  }}>
                    {t('customer.order.status_' + step) || ORDER_STATUS_LABELS[step]}
                  </div>
                  {isCurrent && (
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: color,
                      fontWeight: 600,
                      marginTop: '2px',
                    }}>
                      {t('customer.order.current')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-primary)',
          color: 'white',
          fontWeight: 700,
          fontSize: 'var(--font-size-base)',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'inherit',
          transition: 'opacity var(--transition-fast)',
        }}
      >
        {t('customer.order.continue')}
      </button>
    </div>
  );
}
