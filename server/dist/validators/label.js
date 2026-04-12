"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelTaskLinkBodySchema = exports.UpdateLabelBodySchema = exports.CreateLabelBodySchema = exports.LabelBoardQuerySchema = exports.LabelIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.LabelIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().cuid()
})
    .strict();
exports.LabelBoardQuerySchema = zod_1.z
    .object({
    boardId: zod_1.z.string().cuid()
})
    .strict();
exports.CreateLabelBodySchema = zod_1.z
    .object({
    boardId: zod_1.z.string().cuid(),
    name: zod_1.z.string().trim().min(1).max(100),
    color: zod_1.z.string().trim().min(1).max(30)
})
    .strict();
exports.UpdateLabelBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(100).optional(),
    color: zod_1.z.string().trim().min(1).max(30).optional()
})
    .strict();
exports.LabelTaskLinkBodySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid(),
    labelId: zod_1.z.string().cuid()
})
    .strict();
