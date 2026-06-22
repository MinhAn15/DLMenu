import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartComputed {
  totalItems: number;
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  computed: CartComputed;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleOpen: () => void;
}

function compute(items: CartItem[]): CartComputed {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      computed: compute([]),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            const newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
            return { items: newItems, computed: compute(newItems) };
          }
          const newItems = [...state.items, item];
          return { items: newItems, computed: compute(newItems) };
        }),

      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return { items: newItems, computed: compute(newItems) };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.id !== id);
            return { items: newItems, computed: compute(newItems) };
          }
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          return { items: newItems, computed: compute(newItems) };
        }),

      clearCart: () =>
        set({ items: [], computed: compute([]) }),

      toggleOpen: () =>
        set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'dilinh-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
