'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { createOrder } from '@/lib/actions/customerOrder';
import { resolveDiscount } from '@/lib/utils/discount';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import MenuItemCard from '@/components/customer/MenuItemCard';
import CartBar from '@/components/customer/CartBar';
import Modal from '@/components/ui/Modal';
import CartModalContent from '@/components/customer/CartModalContent';
import CustomerAuthModal from '@/components/customer/CustomerAuthModal';
import LoyaltyBanner from '@/components/customer/LoyaltyBanner';
import OrderStatusTracker from '@/components/customer/OrderStatusTracker';
import toast from 'react-hot-toast';
import type { MenuItem } from '@/lib/types/database';

export default function ShopMenuPage({ params }: { params: Promise<{ slug: string; table: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string; table: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { shop, table, categories, membership, promotions, getItemsByCategory, loading, error } = useShop(
    resolvedParams?.slug || '', 
    resolvedParams?.table || ''
  );
  const { items: cartItems, subtotal, itemCount, addItem, updateQuantity, clearCart } = useCart(shop?.id, shop?.max_cart_items, shop?.max_order_value);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number; status: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Header Skeleton */}
        <div className="h-40 w-full relative">
          <Skeleton height="100%" borderRadius={0} />
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
            <Skeleton width="64px" height="64px" circle />
            <div>
              <Skeleton width="150px" height="24px" className="mb-2" />
              <Skeleton width="80px" height="20px" />
            </div>
          </div>
        </div>
        {/* Categories Skeleton */}
        <div className="container py-3 flex gap-4 mt-6">
          <Skeleton width="80px" height="32px" borderRadius="16px" />
          <Skeleton width="100px" height="32px" borderRadius="16px" />
          <Skeleton width="70px" height="32px" borderRadius="16px" />
        </div>
        {/* Items Skeleton */}
        <div className="container py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </div>
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

  const handleCheckoutClick = async (paymentMethod: string, customerNote: string = '') => {
    // Bỏ qua check login cho phép order ẩn danh (demo)
    // if (!user) {
    //   setIsLoginOpen(true);
    //   return;
    // }

    setIsCheckingOut(true);
    try {
      const finalNote = `Thanh toán: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}${customerNote ? `\nGhi chú: ${customerNote}` : ''}`;
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
        customerNote: finalNote,
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
      <header className="bg-white sticky top-0 z-30 shadow-md">
        <div className="relative h-40 w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 z-10"></div>
          {shop.cover_image_url ? (
            <img src={shop.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <Image src="/images/customer_menu_hero_banner.webp" alt="Cover Fallback" fill sizes="100vw" className="object-cover" />
          )}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-[var(--color-primary)] overflow-hidden border-2 border-white relative">
              <Image src="/images/dilinhmenu_app_logo.webp" alt="Logo" fill sizes="64px" className="object-cover" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold drop-shadow-md">{shop.name}</h1>
              {table && <p className="text-sm font-medium drop-shadow-md bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm inline-block mt-1">Bàn {table.table_number}</p>}
            </div>
          </div>
          {/* Actions Area */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {mounted && (
              <div
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer text-white shadow-sm hover:bg-black/40 transition"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Đổi giao diện Sáng/Tối"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </div>
            )}
            <div
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer text-white shadow-sm hover:bg-black/40 transition"
              onClick={() => !user && setIsLoginOpen(true)}
            >
              {user ? '👤' : <span className="text-xs font-bold">Log in</span>}
            </div>
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
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-[160px] z-20 overflow-x-auto whitespace-nowrap hide-scrollbar shadow-sm transition-all">
        <div className="container py-3 flex gap-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="font-bold text-sm text-gray-500 hover:text-[var(--color-primary)] active:scale-95 transition-all px-3 py-1.5 rounded-full hover:bg-orange-50"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          crossSellItems={
            categories
              .flatMap(c => getItemsByCategory(c.id))
              .filter(item => !cartItems.some(ci => ci.menuItem.id === item.id)) // Chỉ gợi ý món chưa có trong giỏ
              .sort((a, b) => a.price - b.price) // Gợi ý món giá rẻ trước (ví dụ topping, khăn lạnh, trà đá)
              .slice(0, 3) // Lấy top 3
          }
          onAddCrossSell={(item) => addItem(item)}
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
      <CustomerAuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
          if (itemCount > 0) setIsCartOpen(true);
        }}
      />

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
