import { describe, it, expect } from 'vitest';
import { createShopSchema, updateShopSchema } from '../src/shop';

describe('shop schemas', () => {
  describe('createShopSchema', () => {
    it('accepts valid shop creation', () => {
      const result = createShopSchema.parse({
        name: 'Quán Cơm Lam',
        slug: 'com-lam',
      });
      expect(result.name).toBe('Quán Cơm Lam');
    });

    it('rejects invalid slug with uppercase', () => {
      expect(() =>
        createShopSchema.parse({
          name: 'Test',
          slug: 'Com Lam',
        })
      ).toThrow();
    });

    it('rejects empty name', () => {
      expect(() =>
        createShopSchema.parse({
          name: '',
          slug: 'test',
        })
      ).toThrow();
    });
  });

  describe('updateShopSchema', () => {
    it('accepts partial update', () => {
      const result = updateShopSchema.parse({ name: 'Tên Mới' });
      expect(result.name).toBe('Tên Mới');
    });

    it('accepts setting description to null', () => {
      const result = updateShopSchema.parse({ description: null });
      expect(result.description).toBeNull();
    });
  });
});
