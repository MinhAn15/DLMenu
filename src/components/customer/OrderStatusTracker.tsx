'use client';

import React from 'react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import { formatVND } from '@/lib/utils/format';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

interface OrderStatusTrackerProps {
  orderNumber: string;
  status: string;
  total: number;
  onClose: () => void;
}

export default function OrderStatusTracker({ orderNumber, status, total, onClose }: OrderStatusTrackerProps) {
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
          {isCancelled ? 'Đơn hàng đã hủy' : currentIndex >= 4 ? 'Hoàn thành!' : 'Đã đặt món!'}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          Đơn {orderNumber} · {formatVND(total)}
        </p>
      </div>

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
                    {ORDER_STATUS_LABELS[step]}
                  </div>
                  {isCurrent && (
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: color,
                      fontWeight: 600,
                      marginTop: '2px',
                    }}>
                      ● Hiện tại
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
        Tiếp tục xem menu
      </button>
    </div>
  );
}
