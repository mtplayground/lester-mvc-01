import { z } from 'zod';

export const LabelIdParamsSchema = z
  .object({
    id: z.string().cuid()
  })
  .strict();

export const LabelBoardQuerySchema = z
  .object({
    boardId: z.string().cuid()
  })
  .strict();

export const CreateLabelBodySchema = z
  .object({
    boardId: z.string().cuid(),
    name: z.string().trim().min(1).max(100),
    color: z.string().trim().min(1).max(30)
  })
  .strict();

export const UpdateLabelBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    color: z.string().trim().min(1).max(30).optional()
  })
  .strict();

export const LabelTaskLinkBodySchema = z
  .object({
    taskId: z.string().cuid(),
    labelId: z.string().cuid()
  })
  .strict();

export type LabelIdParams = z.infer<typeof LabelIdParamsSchema>;
export type LabelBoardQuery = z.infer<typeof LabelBoardQuerySchema>;
export type CreateLabelBody = z.infer<typeof CreateLabelBodySchema>;
export type UpdateLabelBody = z.infer<typeof UpdateLabelBodySchema>;
export type LabelTaskLinkBody = z.infer<typeof LabelTaskLinkBodySchema>;
