import { describe, it, expect } from 'vitest';
import { priceSchema, slugSchema, uuidSchema } from '../src/common';

describe('common schemas', () => {
  it('priceSchema accepts valid positive number', () => {
    expect(priceSchema.parse(50000)).toBe(50000);
  });

  it('priceSchema rejects zero', () => {
    expect(() => priceSchema.parse(0)).toThrow();
  });

  it('priceSchema rejects negative', () => {
    expect(() => priceSchema.parse(-1000)).toThrow();
  });

  it('slugSchema accepts valid slug', () => {
    expect(slugSchema.parse('my-restaurant-123')).toBe('my-restaurant-123');
  });

  it('slugSchema rejects invalid characters', () => {
    expect(() => slugSchema.parse('My Restaurant!')).toThrow();
  });

  it('uuidSchema accepts valid UUID', () => {
    expect(uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('uuidSchema rejects invalid string', () => {
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
  });
});
