import { describe, it, expect } from 'vitest';
import { createCategorySchema, createMenuItemSchema, updateCategorySchema } from '../src/menu';

describe('menu schemas', () => {
  describe('createCategorySchema', () => {
    it('accepts valid input', () => {
      const result = createCategorySchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Khai vị',
      });
      expect(result.name).toBe('Khai vị');
    });

    it('accepts optional description', () => {
      const result = createCategorySchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Khai vị',
        description: 'Các món khai vị',
      });
      expect(result.description).toBe('Các món khai vị');
    });

    it('rejects empty name', () => {
      expect(() =>
        createCategorySchema.parse({
          shopId: '550e8400-e29b-41d4-a716-446655440000',
          name: '',
        })
      ).toThrow();
    });

    it('rejects invalid UUID', () => {
      expect(() =>
        createCategorySchema.parse({
          shopId: 'not-uuid',
          name: 'Khai vị',
        })
      ).toThrow();
    });
  });

  describe('createMenuItemSchema', () => {
    it('accepts valid input with minimum fields', () => {
      const result = createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Phở bò',
        price: 50000,
      });
      expect(result.name).toBe('Phở bò');
    });

    it('accepts full input with all fields', () => {
      const result = createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Phở bò đặc biệt',
        price: 85000,
        description: 'Phở bò tái nạm',
        tags: ['bò', 'phở'],
      });
      expect(result.tags).toEqual(['bò', 'phở']);
    });

    it('rejects negative price', () => {
      expect(() =>
        createMenuItemSchema.parse({
          shopId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Phở',
          price: -5000,
        })
      ).toThrow();
    });

    it('rejects price exceeding max', () => {
      expect(() =>
        createMenuItemSchema.parse({
          shopId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Phở',
          price: 200_000_000,
        })
      ).toThrow();
    });
  });

  describe('updateCategorySchema', () => {
    it('accepts partial update with only name', () => {
      const result = updateCategorySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Mới',
      });
      expect(result.name).toBe('Mới');
    });

    it('accepts setting description to null', () => {
      const result = updateCategorySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        description: null,
      });
      expect(result.description).toBeNull();
    });
  });
});
