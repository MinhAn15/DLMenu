import { z } from 'zod';
import { uuidSchema } from './common';

export const createPromotionSchema = z.object({
  shopId: uuidSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(['flash_sale', 'discount', 'bogo']),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  max_uses: z.number().int().positive().optional(),
});

export const togglePromotionSchema = z.object({
  id: uuidSchema,
  isActive: z.boolean(),
});
