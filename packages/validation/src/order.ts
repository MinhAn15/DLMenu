import { z } from 'zod';
import { uuidSchema, priceSchema } from './common';

export const orderTypeSchema = z.enum(['dine_in', 'takeaway']);
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: priceSchema,
  note: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  shopId: uuidSchema,
  tableId: uuidSchema.optional(),
  orderType: orderTypeSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  customerNote: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: uuidSchema,
  status: orderStatusSchema,
});
