import { z } from 'zod';
import { slugSchema } from './common';

export const createShopSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
});

export const updateShopSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});
