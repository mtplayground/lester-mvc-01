import { z } from 'zod';

export const CommentIdParamsSchema = z
  .object({
    id: z.string().cuid()
  })
  .strict();

export const CommentTaskQuerySchema = z
  .object({
    taskId: z.string().cuid()
  })
  .strict();

export const CreateCommentBodySchema = z
  .object({
    taskId: z.string().cuid(),
    content: z.string().trim().min(1).max(5000)
  })
  .strict();

export const UpdateCommentBodySchema = z
  .object({
    content: z.string().trim().min(1).max(5000)
  })
  .strict();

export type CommentIdParams = z.infer<typeof CommentIdParamsSchema>;
export type CommentTaskQuery = z.infer<typeof CommentTaskQuerySchema>;
export type CreateCommentBody = z.infer<typeof CreateCommentBodySchema>;
export type UpdateCommentBody = z.infer<typeof UpdateCommentBodySchema>;
