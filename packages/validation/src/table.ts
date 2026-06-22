import { z } from 'zod';
import { uuidSchema } from './common';

export const toggleTableSchema = z.object({
  id: uuidSchema,
  isActive: z.boolean(),
});
