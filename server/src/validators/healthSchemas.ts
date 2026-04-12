import { z } from 'zod';

export const EmptyQuerySchema = z.object({}).strict();

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'error']),
  database: z.enum(['up', 'down']),
  timestamp: z.string().datetime()
});

export type HealthStatusDto = z.infer<typeof HealthStatusSchema>;
