"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommentBodySchema = exports.CreateCommentBodySchema = exports.CommentTaskQuerySchema = exports.CommentIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.CommentIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().cuid()
})
    .strict();
exports.CommentTaskQuerySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid()
})
    .strict();
exports.CreateCommentBodySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid(),
    content: zod_1.z.string().trim().min(1).max(5000)
})
    .strict();
exports.UpdateCommentBodySchema = zod_1.z
    .object({
    content: zod_1.z.string().trim().min(1).max(5000)
})
    .strict();
