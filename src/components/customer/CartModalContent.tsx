import React from 'react';
import { formatVND } from '@/lib/utils/format';
import type { CartItem } from '@/lib/types/database';
import Button from '@/components/ui/Button';

interface CartModalProps {
  items: CartItem[];
  subtotal: number;
  onUpdateQuantity: (menuItemId: string, qty: number, note: string) => void;
  onCheckout: () => void;
}

export default function CartModalContent({ items, subtotal, onUpdateQuantity, onCheckout }: CartModalProps) {
  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">Giỏ hàng trống</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[50vh] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div key={`${item.menuItem.id}-${index}`} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{item.menuItem.name}</h4>
              <div className="text-[var(--color-primary)] font-medium mt-1">
                {formatVND(item.menuItem.price)}
              </div>
              {item.note && <div className="text-xs text-gray-500 mt-1 italic">Ghi chú: {item.note}</div>}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1, item.note)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600"
              >
                -
              </button>
              <span className="w-4 text-center font-semibold">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1, item.note)}
                className="w-8 h-8 rounded-full bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)] flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-600">Tổng cộng</span>
          <span className="font-bold text-xl text-[var(--color-primary)]">{formatVND(subtotal)}</span>
        </div>
        
        <Button fullWidth size="lg" onClick={onCheckout}>
          Gửi Order
        </Button>
      </div>
    </div>
  );
}
