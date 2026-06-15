'use client';

import React, { useState } from 'react';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { createOrder } from '@/lib/actions/customerOrder';
import { resolveDiscount } from '@/lib/utils/discount';
import Spinner from '@/components/ui/Spinner';
import MenuItemCard from '@/components/customer/MenuItemCard';
import CartBar from '@/components/customer/CartBar';
import Modal from '@/components/ui/Modal';
import CartModalContent from '@/components/customer/CartModalContent';
import PhoneLoginForm from '@/components/customer/PhoneLoginForm';
import LoyaltyBanner from '@/components/customer/LoyaltyBanner';
import OrderStatusTracker from '@/components/customer/OrderStatusTracker';
import toast from 'react-hot-toast';
import type { MenuItem } from '@/lib/types/database';

export default function ShopMenuPage({ params }: { params: { slug: string; table: string } }) {
  const { shop, table, categories, membership, promotions, getItemsByCategory, loading, error } = useShop(params.slug, params.table);
  const { items: cartItems, subtotal, itemCount, addItem, updateQuantity, clearCart } = useCart(shop?.id);
  const { user } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number; status: string } | null>(null);

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
    toast.success(`Đã thêm ${item.name}`, { duration: 1500, style: { fontSize: '0.875rem' } });
  };

  // Calculate discount
  const discount = membership && shop.loyalty_config
    ? resolveDiscount(subtotal, membership.rank, shop.loyalty_config, promotions)
    : { discountAmount: 0, discountType: null, discountLabel: null };

  const total = subtotal - discount.discountAmount;

  const handleCheckoutClick = async () => {
    if (!user) {
      setIsCartOpen(false);
      setIsLoginOpen(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await createOrder({
        shopId: shop.id,
        tableId: table?.id || null,
        items: cartItems.map(ci => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
          unitPrice: ci.menuItem.price,
          note: ci.note || null,
        })),
        subtotal,
        discountAmount: discount.discountAmount,
        discountType: discount.discountType,
        total,
        orderType: table ? 'dine_in' : 'takeaway',
        customerNote: null,
      });

      if (!res.success) throw new Error(res.error);

      clearCart();
      setIsCartOpen(false);
      setOrderResult({
        orderNumber: res.data!.order_number,
        total: res.data!.total,
        status: 'pending',
      });
      toast.success('Đặt món thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đặt món. Vui lòng thử lại.');
    } finally {
      setIsCheckingOut(false);
    }
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
          <div
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => !user && setIsLoginOpen(true)}
          >
            {user ? '👤' : <span className="text-xs">Login</span>}
          </div>
        </div>
      </header>

      {/* Loyalty Banner */}
      {membership && shop.loyalty_config && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <LoyaltyBanner membership={membership} loyaltyConfig={shop.loyalty_config} />
        </div>
      )}

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
        {/* Discount info */}
        {discount.discountAmount > 0 && (
          <div style={{
            background: 'var(--color-success)', color: 'white',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            marginTop: 'var(--space-3)',
            textAlign: 'center',
          }}>
            🎉 {discount.discountLabel} — Giảm {new Intl.NumberFormat('vi-VN').format(discount.discountAmount)}₫
          </div>
        )}
        {isCheckingOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-xl)',
          }}>
            <Spinner size="lg" />
          </div>
        )}
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <PhoneLoginForm onSuccess={() => {
          setIsLoginOpen(false);
          if (itemCount > 0) setIsCartOpen(true);
        }} />
      </Modal>

      {/* Order Confirmation */}
      <Modal isOpen={!!orderResult} onClose={() => setOrderResult(null)}>
        {orderResult && (
          <OrderStatusTracker
            orderNumber={orderResult.orderNumber}
            status={orderResult.status}
            total={orderResult.total}
            onClose={() => setOrderResult(null)}
          />
        )}
      </Modal>
    </div>
  );
}
