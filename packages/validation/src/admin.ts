import { z } from 'zod';
import { uuidSchema } from './common';

export const updateUserRoleSchema = z.object({
  userId: uuidSchema,
  role: z.enum(['customer', 'shop_owner', 'platform_admin']),
});

export const suspendShopSchema = z.object({
  shopId: uuidSchema,
  reason: z.string().min(1).max(500),
});
