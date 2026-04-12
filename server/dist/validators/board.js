"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBoardBodySchema = exports.CreateBoardBodySchema = exports.BoardIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.BoardIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().cuid()
})
    .strict();
exports.CreateBoardBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(100)
})
    .strict();
exports.UpdateBoardBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(100)
})
    .strict();
