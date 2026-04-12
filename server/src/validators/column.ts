import { z } from 'zod';

export const ColumnIdParamsSchema = z
  .object({
    id: z.string().cuid()
  })
  .strict();

export const CreateColumnBodySchema = z
  .object({
    boardId: z.string().cuid(),
    name: z.string().trim().min(1).max(100),
    position: z.number().finite().optional()
  })
  .strict();

export const UpdateColumnBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100)
  })
  .strict();

export const ReorderColumnBodySchema = z
  .object({
    position: z.number().finite()
  })
  .strict();

export type ColumnIdParams = z.infer<typeof ColumnIdParamsSchema>;
export type CreateColumnBody = z.infer<typeof CreateColumnBodySchema>;
export type UpdateColumnBody = z.infer<typeof UpdateColumnBodySchema>;
export type ReorderColumnBody = z.infer<typeof ReorderColumnBodySchema>;
