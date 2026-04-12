"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderColumnBodySchema = exports.UpdateColumnBodySchema = exports.CreateColumnBodySchema = exports.ColumnIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.ColumnIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().cuid()
})
    .strict();
exports.CreateColumnBodySchema = zod_1.z
    .object({
    boardId: zod_1.z.string().cuid(),
    name: zod_1.z.string().trim().min(1).max(100),
    position: zod_1.z.number().finite().optional()
})
    .strict();
exports.UpdateColumnBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(100)
})
    .strict();
exports.ReorderColumnBodySchema = zod_1.z
    .object({
    position: zod_1.z.number().finite()
})
    .strict();
