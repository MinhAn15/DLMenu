import { useState, useEffect } from 'react';
import type { CartItem } from '@/lib/types/database';
import type { MenuItem } from '@/lib/types/database';

export function useCart(shopId?: string) {
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
    setItems((prevItems) => {
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
      const newItems = [...prevItems];
      const index = newItems.findIndex(
        (i) => i.menuItem.id === menuItemId && i.note === note
      );
      
      if (index >= 0) {
        newItems[index].quantity = quantity;
      }
      return newItems;
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
