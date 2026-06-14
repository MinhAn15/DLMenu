'use client';

import React, { useState } from 'react';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import MenuItemCard from '@/components/customer/MenuItemCard';
import CartBar from '@/components/customer/CartBar';
import Modal from '@/components/ui/Modal';
import CartModalContent from '@/components/customer/CartModalContent';
import PhoneLoginForm from '@/components/customer/PhoneLoginForm';
import type { MenuItem } from '@/lib/types/database';

export default function ShopMenuPage({ params }: { params: { slug: string; table: string } }) {
  const { shop, table, categories, getItemsByCategory, loading, error } = useShop(params.slug, params.table);
  const { items: cartItems, subtotal, itemCount, addItem, updateQuantity, clearCart } = useCart(shop?.id);
  const { user } = useAuth();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-[var(--color-error)] mb-2">Lỗi</h1>
          <p className="text-gray-600">{error?.message || 'Không tìm thấy quán'}</p>
        </div>
      </div>
    );
  }

  // Inject Shop Theme CSS Variables
  const themeStyle = {
    '--color-primary': shop.theme_config.primary_color,
    '--font-sans': shop.theme_config.font + ', sans-serif',
  } as React.CSSProperties;

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsLoginOpen(true);
      return;
    }
    // Proceed to checkout logic (create order in DB)
    // For MVP, just alert
    alert('Đặt món thành công! Vui lòng chờ xác nhận.');
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <div style={themeStyle} className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        {shop.cover_image_url && (
          <div className="h-32 w-full">
            <img src={shop.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{shop.name}</h1>
            {table && <p className="text-sm text-[var(--color-primary)] font-semibold mt-1">Bàn {table.table_number}</p>}
          </div>
          {/* User Profile Area */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {user ? '👤' : <span onClick={() => setIsLoginOpen(true)} className="text-xs cursor-pointer">Login</span>}
          </div>
        </div>
      </header>

      {/* Menu Categories Navigation (Sticky) */}
      <div className="bg-white border-b border-[var(--color-border-light)] sticky top-[72px] z-20 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="container py-3 flex gap-4">
          {categories.map((cat) => (
            <a 
              key={cat.id} 
              href={`#cat-${cat.id}`}
              className="font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors px-2"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <main className="container py-6 flex flex-col gap-8">
        {categories.map((cat) => {
          const categoryItems = getItemsByCategory(cat.id);
          if (categoryItems.length === 0) return null;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
              <h2 className="text-lg font-bold mb-4">{cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryItems.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAdd={handleAddToCart} 
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Cart Bar */}
      <CartBar 
        itemCount={itemCount} 
        subtotal={subtotal} 
        onViewCart={() => setIsCartOpen(true)} 
      />

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Giỏ Hàng">
        <CartModalContent 
          items={cartItems} 
          subtotal={subtotal} 
          onUpdateQuantity={updateQuantity}
          onCheckout={handleCheckoutClick}
        />
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <PhoneLoginForm onSuccess={() => {
          setIsLoginOpen(false);
          if (itemCount > 0) setIsCartOpen(true);
        }} />
      </Modal>
    </div>
  );
}
