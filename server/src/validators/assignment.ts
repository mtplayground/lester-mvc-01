import { z } from 'zod';

export const AssignmentUsersQuerySchema = z
  .object({
    taskId: z.string().cuid()
  })
  .strict();

export const AssignmentBodySchema = z
  .object({
    taskId: z.string().cuid(),
    userId: z.string().cuid()
  })
  .strict();

export type AssignmentUsersQuery = z.infer<typeof AssignmentUsersQuerySchema>;
export type AssignmentBody = z.infer<typeof AssignmentBodySchema>;
