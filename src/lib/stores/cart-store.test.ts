import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, type CartItem } from './cart-store';

const sampleItem: CartItem = {
  id: 'item-1',
  name: 'Cà phê sữa đá',
  price: 25000,
  quantity: 1,
  imageUrl: '/images/cafe-sua-da.jpg',
};

const sampleItem2: CartItem = {
  id: 'item-2',
  name: 'Bánh mì ốp la',
  price: 15000,
  quantity: 2,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with empty cart', () => {
    const { items, isOpen } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(isOpen).toBe(false);
  });

  it('adds item to empty cart', () => {
    useCartStore.getState().addItem(sampleItem);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Cà phê sữa đá');
  });

  it('increments quantity when adding duplicate item', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().addItem(sampleItem);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('removes item from cart', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().removeItem('item-1');
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('removes nonexistent item silently', () => {
    useCartStore.getState().removeItem('nonexistent');
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('updates item quantity', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateQuantity('item-1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item when updating quantity to 0', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateQuantity('item-1', 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('clamps negative quantity to 0 and removes item', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateQuantity('item-1', -5);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('adds multiple different items', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().addItem(sampleItem2);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items[1].price).toBe(15000);
  });

  it('clears entire cart', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().addItem(sampleItem2);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('toggles cart open state', () => {
    expect(useCartStore.getState().isOpen).toBe(false);
    useCartStore.getState().toggleOpen();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().toggleOpen();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('computes totalItems count', () => {
    expect(useCartStore.getState().computed.totalItems).toBe(0);
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().addItem(sampleItem2);
    expect(useCartStore.getState().computed.totalItems).toBe(3);
  });

  it('computes totalPrice correctly', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().addItem(sampleItem2);
    const total = useCartStore.getState().computed.totalPrice;
    expect(total).toBe(25000 + 15000 * 2);
  });

  it('has zero total for empty cart', () => {
    expect(useCartStore.getState().computed.totalPrice).toBe(0);
  });
});
