import { z } from 'zod';

export const BoardIdParamsSchema = z
  .object({
    id: z.string().cuid()
  })
  .strict();

export const CreateBoardBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100)
  })
  .strict();

export const UpdateBoardBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100)
  })
  .strict();

export type BoardIdParams = z.infer<typeof BoardIdParamsSchema>;
export type CreateBoardBody = z.infer<typeof CreateBoardBodySchema>;
export type UpdateBoardBody = z.infer<typeof UpdateBoardBodySchema>;
