import { z } from 'zod';

const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const TaskIdParamsSchema = z
  .object({
    id: z.string().cuid()
  })
  .strict();

export const TaskColumnParamsSchema = z
  .object({
    columnId: z.string().cuid()
  })
  .strict();

export const CreateTaskBodySchema = z
  .object({
    columnId: z.string().cuid(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    position: z.number().finite().optional()
  })
  .strict();

export const UpdateTaskBodySchema = z
  .object({
    columnId: z.string().cuid().optional(),
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    position: z.number().finite().optional()
  })
  .strict();

export const BulkReorderTasksBodySchema = z
  .object({
    tasks: z
      .array(
        z
          .object({
            id: z.string().cuid(),
            columnId: z.string().cuid(),
            position: z.number().finite()
          })
          .strict()
      )
      .min(1)
  })
  .strict();

export type TaskIdParams = z.infer<typeof TaskIdParamsSchema>;
export type TaskColumnParams = z.infer<typeof TaskColumnParamsSchema>;
export type CreateTaskBody = z.infer<typeof CreateTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof UpdateTaskBodySchema>;
export type BulkReorderTasksBody = z.infer<typeof BulkReorderTasksBodySchema>;
