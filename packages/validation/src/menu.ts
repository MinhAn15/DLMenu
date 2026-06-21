import { z } from 'zod';
import { priceSchema, tagsSchema, uuidSchema } from './common';

export const createCategorySchema = z.object({
  shopId: uuidSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateCategorySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createMenuItemSchema = z.object({
  shopId: uuidSchema,
  categoryId: uuidSchema.nullable().optional(),
  name: z.string().min(1).max(200),
  price: priceSchema,
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  tags: tagsSchema.optional(),
});

export const updateMenuItemSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(200).optional(),
  categoryId: uuidSchema.nullable().optional(),
  price: priceSchema.optional(),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: tagsSchema.optional(),
});
