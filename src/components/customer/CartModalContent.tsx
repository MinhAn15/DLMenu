import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatVND } from '@/lib/utils/format';
import type { CartItem, MenuItem } from '@/lib/types/database';
import Button from '@/components/ui/Button';

interface CartModalProps {
  items: CartItem[];
  subtotal: number;
  onUpdateQuantity: (menuItemId: string, qty: number, note: string) => void;
  onCheckout: (paymentMethod: string, note: string) => void;
  crossSellItems?: MenuItem[];
  onAddCrossSell?: (item: MenuItem) => void;
}

export default function CartModalContent({ items, subtotal, onUpdateQuantity, onCheckout, crossSellItems = [], onAddCrossSell }: CartModalProps) {
  const t = useTranslations();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [customerNote, setCustomerNote] = useState('');
  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">{t('customer.cart.empty')}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[50vh] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div key={`${item.menuItem.id}-${index}`} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-sm">{item.menuItem.name}</h4>
              <div className="text-[var(--color-primary)] font-medium mt-1">
                {formatVND(item.menuItem.price)}
              </div>
              {item.note && <div className="text-xs text-gray-500 mt-1 italic">{t('customer.cart.note')} {item.note}</div>}
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

      {crossSellItems.length > 0 && onAddCrossSell && (
        <div className="bg-orange-50 -mx-4 px-4 py-3 border-y border-orange-100">
          <h4 className="text-sm font-bold text-orange-800 mb-2">{t('customer.cart.cross_sell')}</h4>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {crossSellItems.map(item => (
              <div key={item.id} className="bg-white p-2 rounded-lg border border-orange-200 min-w-[140px] flex-shrink-0 shadow-sm flex flex-col gap-1">
                <div className="text-xs font-bold truncate" title={item.name}>{item.name}</div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-orange-600 font-semibold">{formatVND(item.price)}</span>
                  <button onClick={() => onAddCrossSell(item)} className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-2">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Phương thức thanh toán</h4>
        <div className="flex gap-3 mb-4">
          <label className={`flex-1 border rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-5' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="sr-only" />
            <span className="text-xl">💵</span>
            <span className="text-xs font-medium text-center">Tiền mặt</span>
          </label>
          <label className={`flex-1 border rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-5' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="sr-only" />
            <span className="text-xl">🏦</span>
            <span className="text-xs font-medium text-center">Chuyển khoản</span>
          </label>
        </div>

        {paymentMethod === 'transfer' && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-xs mb-4 flex flex-col items-center border border-blue-100">
            <p className="font-bold mb-2 text-sm text-center">Quét mã VietQR để thanh toán</p>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://img.vietqr.io/image/970436-1012345678-compact2.jpg?amount=${subtotal}&addInfo=Thanh toan DiLinhMenu&accountName=NGUYEN VAN A`}
                alt="VietQR"
                className="w-[200px] h-[200px] object-contain mix-blend-multiply"
              />
            </div>
            <p className="text-center text-gray-600 mt-1">Hệ thống sẽ tự động xác nhận đơn khi nhận được tiền.</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold text-gray-800 mb-2 text-sm">Ghi chú cho quán (Tùy chọn)</label>
          <textarea 
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Ví dụ: Không hành, ít đá, làm cay..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
            rows={2}
          />
        </div>

        <div className="flex justify-between items-center mb-4 mt-2">
          <span className="font-semibold text-gray-600">Tổng cộng</span>
          <span className="font-bold text-xl text-[var(--color-primary)]">{formatVND(subtotal)}</span>
        </div>
        
        <Button fullWidth size="lg" onClick={() => onCheckout(paymentMethod, customerNote)}>
          Gửi Order
        </Button>
      </div>
    </div>
  );
}
