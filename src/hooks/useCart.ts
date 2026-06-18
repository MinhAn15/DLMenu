import { useState, useEffect } from 'react';
import type { CartItem } from '@/lib/types/database';
import type { MenuItem } from '@/lib/types/database';
import toast from 'react-hot-toast';

export function useCart(shopId?: string, maxCartItems: number = 20, maxOrderValue: number = 2000000) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (!shopId) return;
    
    try {
      const savedCart = localStorage.getItem(`cart_${shopId}`);
      if (savedCart) {
        // eslint-disable-next-line
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      // eslint-disable-next-line
      setIsLoaded(true);
    }
  }, [shopId]);

  // Save to local storage on change
  useEffect(() => {
    if (!shopId || !isLoaded) return;
    
    try {
      localStorage.setItem(`cart_${shopId}`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [items, shopId, isLoaded]);

  const addItem = (menuItem: MenuItem, quantity: number = 1, note: string = '') => {
    // Haptic feedback for touch devices
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setItems((prevItems) => {
      // Anti-Spam Protection
      const currentCount = prevItems.reduce((sum, i) => sum + i.quantity, 0);
      const currentSubtotal = prevItems.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
      
      if (currentCount + quantity > maxCartItems) {
        toast.error(`Giỏ hàng chỉ chứa tối đa ${maxCartItems} món.`);
        return prevItems;
      }
      if (currentSubtotal + (menuItem.price * quantity) > maxOrderValue) {
        toast.error(`Tổng đơn hàng không được vượt quá ${new Intl.NumberFormat('vi-VN').format(maxOrderValue)} VNĐ.`);
        return prevItems;
      }

      // Check if exact item with same note exists
      const existingItemIndex = prevItems.findIndex(
        (i) => i.menuItem.id === menuItem.id && i.note === note
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { menuItem, quantity, note }];
    });
  };

  const removeItem = (menuItemId: string, note: string = '') => {
    setItems((prevItems) => 
      prevItems.filter((i) => !(i.menuItem.id === menuItemId && i.note === note))
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number, note: string = '') => {
    if (quantity <= 0) {
      removeItem(menuItemId, note);
      return;
    }

    setItems((prevItems) => {
      const index = prevItems.findIndex(
        (i) => i.menuItem.id === menuItemId && i.note === note
      );
      
      if (index >= 0) {
        const oldQuantity = prevItems[index].quantity;
        const diff = quantity - oldQuantity;
        
        if (diff > 0) {
          const currentCount = prevItems.reduce((sum, i) => sum + i.quantity, 0);
          const currentSubtotal = prevItems.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
          
          if (currentCount + diff > maxCartItems) {
            toast.error(`Giỏ hàng chỉ chứa tối đa ${maxCartItems} món.`);
            return prevItems;
          }
          if (currentSubtotal + (prevItems[index].menuItem.price * diff) > maxOrderValue) {
            toast.error(`Tổng đơn hàng không được vượt quá ${new Intl.NumberFormat('vi-VN').format(maxOrderValue)} VNĐ.`);
            return prevItems;
          }
        }

        const newItems = [...prevItems];
        newItems[index].quantity = quantity;
        return newItems;
      }
      return prevItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    if (shopId) {
      localStorage.removeItem(`cart_${shopId}`);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
  };
}
