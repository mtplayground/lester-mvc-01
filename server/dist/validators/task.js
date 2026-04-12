"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkReorderTasksBodySchema = exports.UpdateTaskBodySchema = exports.CreateTaskBodySchema = exports.TaskColumnParamsSchema = exports.TaskIdParamsSchema = void 0;
const zod_1 = require("zod");
const taskPrioritySchema = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']);
exports.TaskIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().cuid()
})
    .strict();
exports.TaskColumnParamsSchema = zod_1.z
    .object({
    columnId: zod_1.z.string().cuid()
})
    .strict();
exports.CreateTaskBodySchema = zod_1.z
    .object({
    columnId: zod_1.z.string().cuid(),
    title: zod_1.z.string().trim().min(1).max(200),
    description: zod_1.z.string().trim().max(5000).nullable().optional(),
    dueDate: zod_1.z.string().datetime().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    position: zod_1.z.number().finite().optional()
})
    .strict();
exports.UpdateTaskBodySchema = zod_1.z
    .object({
    columnId: zod_1.z.string().cuid().optional(),
    title: zod_1.z.string().trim().min(1).max(200).optional(),
    description: zod_1.z.string().trim().max(5000).nullable().optional(),
    dueDate: zod_1.z.string().datetime().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    position: zod_1.z.number().finite().optional()
})
    .strict();
exports.BulkReorderTasksBodySchema = zod_1.z
    .object({
    tasks: zod_1.z
        .array(zod_1.z
        .object({
        id: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        position: zod_1.z.number().finite()
    })
        .strict())
        .min(1)
})
    .strict();
