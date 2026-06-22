'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatVND } from '@/lib/utils/format';
import Button from '@/components/ui/Button';

interface CartBarProps {
  itemCount: number;
  subtotal: number;
  onViewCart: () => void;
}

export default function CartBar({ itemCount, subtotal, onViewCart }: CartBarProps) {
  const t = useTranslations();
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    if (itemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 animate-bounce-in hover-lift">
      <div 
        className={`glass-heavy max-w-lg mx-auto rounded-full flex items-center justify-between p-4 cursor-pointer transition-transform ${animate ? 'scale-105' : ''}`}
        onClick={onViewCart}
      >
        <div className="relative">
          <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-transform ${animate ? 'scale-125' : ''}`}>
            {itemCount}
          </span>
        </div>
        <div className="ml-3 flex flex-col">
          <span className="text-sm font-medium text-[var(--color-primary)]">{t('customer.cart.title')}</span>
          <span className="font-heading font-bold text-lg text-gray-900">{formatVND(subtotal)}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-primary)] font-medium bg-[var(--color-primary)] bg-opacity-10 px-4 py-2 rounded-full">
          {t('customer.cart.view')} <span className="text-xl">→</span>
        </div>
      </div>
    </div>
  );
}
