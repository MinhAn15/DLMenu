import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../src/auth';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.parse({
        email: 'test@example.com',
        password: '123456',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('rejects invalid email', () => {
      expect(() =>
        loginSchema.parse({
          email: 'not-email',
          password: '123456',
        })
      ).toThrow();
    });

    it('rejects short password', () => {
      expect(() =>
        loginSchema.parse({
          email: 'test@example.com',
          password: '12',
        })
      ).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration', () => {
      const result = registerSchema.parse({
        email: 'new@example.com',
        password: '123456',
        displayName: 'Nguyễn Văn A',
      });
      expect(result.displayName).toBe('Nguyễn Văn A');
    });

    it('rejects missing displayName', () => {
      expect(() =>
        registerSchema.parse({
          email: 'new@example.com',
          password: '123456',
        })
      ).toThrow();
    });
  });
});
