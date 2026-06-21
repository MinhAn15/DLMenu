import { describe, it, expect } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema } from '../src/order';

describe('order schemas', () => {
  describe('createOrderSchema', () => {
    it('accepts dine_in order with tableId', () => {
      const result = createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        tableId: '550e8400-e29b-41d4-a716-446655440001',
        orderType: 'dine_in',
        items: [{ menuItemId: 'id-1', quantity: 2, unitPrice: 50000 }],
        customerNote: 'Không hành',
      });
      expect(result.orderType).toBe('dine_in');
    });

    it('accepts takeaway without tableId', () => {
      const result = createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        orderType: 'takeaway',
        items: [{ menuItemId: 'id-1', quantity: 1, unitPrice: 50000 }],
      });
      expect(result.orderType).toBe('takeaway');
    });

    it('rejects empty items', () => {
      expect(() =>
        createOrderSchema.parse({
          shopId: '550e8400-e29b-41d4-a716-446655440000',
          orderType: 'takeaway',
          items: [],
        })
      ).toThrow();
    });

    it('rejects unknown orderType', () => {
      expect(() =>
        createOrderSchema.parse({
          shopId: '550e8400-e29b-41d4-a716-446655440000',
          orderType: 'delivery',
          items: [{ menuItemId: 'id', quantity: 1, unitPrice: 50000 }],
        })
      ).toThrow();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('accepts valid status transition', () => {
      const result = updateOrderStatusSchema.parse({
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'confirmed',
      });
      expect(result.status).toBe('confirmed');
    });

    it('rejects invalid status', () => {
      expect(() =>
        updateOrderStatusSchema.parse({
          orderId: '550e8400-e29b-41d4-a716-446655440000',
          status: 'invalid_status',
        })
      ).toThrow();
    });
  });
});
