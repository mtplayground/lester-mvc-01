"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentBodySchema = exports.AssignmentUsersQuerySchema = void 0;
const zod_1 = require("zod");
exports.AssignmentUsersQuerySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid()
})
    .strict();
exports.AssignmentBodySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid(),
    userId: zod_1.z.string().cuid()
})
    .strict();
