'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatVND } from '@/lib/utils/format';
import type { MenuItem } from '@/lib/types/database';

interface ItemOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem, quantity: number, note: string) => void;
}

export default function ItemOptionsSheet({ isOpen, onClose, item, onAddToCart }: ItemOptionsSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [ice, setIce] = useState('100%');
  const [sugar, setSugar] = useState('100%');
  const [toppings, setToppings] = useState<string[]>([]);
  const [extraPrice, setExtraPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSize('M');
      setIce('100%');
      setSugar('100%');
      setToppings([]);
      setExtraPrice(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let extra = 0;
    if (size === 'L') extra += 10000;
    extra += toppings.length * 8000;
    setExtraPrice(extra);
  }, [size, toppings]);

  if (!item) return null;

  // Mock logic: Show options only for drinks
  const isDrink = item.category_id === 'c1' || item.category_id === 'c2' || item.category_id === 'c3-1';

  const handleToppingToggle = (topping: string) => {
    setToppings(prev => 
      prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]
    );
  };

  const handleAdd = () => {
    const optionsText = isDrink 
      ? `Size ${size}, Đá ${ice}, Đường ${sugar}${toppings.length > 0 ? ', ' + toppings.join(', ') : ''}`
      : '';
      
    // Create a modified item with the updated price so the cart calculates correctly
    const finalItem = {
      ...item,
      price: item.price + extraPrice,
      id: `${item.id}_${size}_${toppings.join('-')}`, // Unique ID for this configuration in cart
      name: `${item.name}${size === 'L' ? ' (L)' : ''}`,
    };
    
    onAddToCart(finalItem, quantity, optionsText);
    onClose();
  };

  const currentTotal = (item.price + extraPrice) * quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="-mx-4 -mt-4 relative mb-4">
        {item.image_url ? (
          <div className="w-full h-56 relative bg-gray-100 rounded-t-[var(--radius-xl)] overflow-hidden">
            <Image src={item.image_url} alt={item.name} fill sizes="100vw" className="object-cover" />
            {/* Fade overlay at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[var(--color-surface)]"></div>
          </div>
        ) : (
          <div className="w-full h-32 bg-[var(--color-primary-light)] opacity-20 rounded-t-[var(--radius-xl)] flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-sm"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-1">{item.name}</h2>
        {item.description && <p className="text-gray-500 text-sm mb-3">{item.description}</p>}
        <div className="font-bold text-xl text-[var(--color-primary)]">
          {formatVND(item.price)}
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 mb-6"></div>

      {isDrink && (
        <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto hide-scrollbar pr-1 pb-4">
          {/* Size */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900 dark:text-gray-100">Kích cỡ</h4>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Bắt buộc</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSize('M')}
                className={`p-3 rounded-xl border ${size === 'M' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-5' : 'border-gray-200 dark:border-gray-700'} text-left transition-all`}
              >
                <div className="font-semibold text-sm">Size M</div>
                <div className="text-xs text-gray-500 mt-1">+ 0đ</div>
              </button>
              <button 
                onClick={() => setSize('L')}
                className={`p-3 rounded-xl border ${size === 'L' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-5' : 'border-gray-200 dark:border-gray-700'} text-left transition-all`}
              >
                <div className="font-semibold text-sm">Size L</div>
                <div className="text-xs text-[var(--color-primary)] mt-1">+ 10.000đ</div>
              </button>
            </div>
          </div>

          {/* Ice & Sugar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-sm">Lượng Đá</h4>
              <div className="flex flex-col gap-2">
                {['100%', '50%', '0% (Không đá)'].map(lvl => (
                  <label key={lvl} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <input type="radio" name="ice" checked={ice === lvl} onChange={() => setIce(lvl)} className="w-4 h-4 text-[var(--color-primary)] accent-[var(--color-primary)]" />
                    <span className="text-sm font-medium">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-sm">Lượng Đường</h4>
              <div className="flex flex-col gap-2">
                {['100%', '50%', '0% (Không đường)'].map(lvl => (
                  <label key={lvl} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <input type="radio" name="sugar" checked={sugar === lvl} onChange={() => setSugar(lvl)} className="w-4 h-4 text-[var(--color-primary)] accent-[var(--color-primary)]" />
                    <span className="text-sm font-medium">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Toppings */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900 dark:text-gray-100">Topping thêm</h4>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Không bắt buộc</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { id: 'TranChauDen', name: 'Trân châu đen', price: 8000 },
                { id: 'TranChauTrang', name: 'Trân châu trắng', price: 8000 },
                { id: 'ThachNhaDam', name: 'Thạch nha đam', price: 8000 },
                { id: 'KemMacchiato', name: 'Kem Macchiato', price: 8000 }
              ].map(t => (
                <label key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={toppings.includes(t.name)} 
                      onChange={() => handleToppingToggle(t.name)} 
                      className="w-5 h-5 rounded text-[var(--color-primary)] accent-[var(--color-primary)] border-gray-300" 
                    />
                    <span className="text-sm font-medium">{t.name}</span>
                  </div>
                  <span className="text-sm text-[var(--color-primary)] font-semibold">+{formatVND(t.price)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer sticky area */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 mt-2">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden h-12">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-12 h-full flex items-center justify-center font-bold text-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="w-12 h-full flex items-center justify-center font-bold text-xl text-[var(--color-primary)] hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            +
          </button>
        </div>
        
        <Button 
          onClick={handleAdd}
          className="flex-grow h-12 rounded-full font-bold shadow-lg shadow-orange-500/30 flex justify-between items-center px-6"
        >
          <span>Thêm vào giỏ</span>
          <span>{formatVND(currentTotal)}</span>
        </Button>
      </div>
    </Modal>
  );
}
