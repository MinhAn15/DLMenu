'use client';

import React from 'react';
import { formatVND } from '@/lib/utils/format';
import Button from '@/components/ui/Button';

interface CartBarProps {
  itemCount: number;
  subtotal: number;
  onViewCart: () => void;
}

export default function CartBar({ itemCount, subtotal, onViewCart }: CartBarProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-border)] shadow-[0_-4px_6px_rgba(0,0,0,0.05)] z-40 animate-slide-up">
      <div className="container flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--color-text-secondary)]">
            {itemCount} món
          </span>
          <span className="font-bold text-lg text-[var(--color-text)]">
            {formatVND(subtotal)}
          </span>
        </div>
        <Button onClick={onViewCart} size="lg">
          Xem Giỏ Hàng
        </Button>
      </div>
    </div>
  );
}
