import { z } from 'zod';

export const ActivityTaskQuerySchema = z
  .object({
    taskId: z.string().cuid()
  })
  .strict();

export type ActivityTaskQuery = z.infer<typeof ActivityTaskQuerySchema>;
