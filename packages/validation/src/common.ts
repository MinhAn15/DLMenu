import { z } from 'zod';

export const priceSchema = z.number().positive().max(100_000_000);
export const sortOrderSchema = z.number().int().nonnegative();
export const tagsSchema = z.array(z.string().max(50)).max(10);
export const slugSchema = z.string().min(2).max(100).regex(/^[a-z0-9-]+$/);
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
