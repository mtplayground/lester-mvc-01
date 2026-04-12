"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTaskQuerySchema = void 0;
const zod_1 = require("zod");
exports.ActivityTaskQuerySchema = zod_1.z
    .object({
    taskId: zod_1.z.string().cuid()
})
    .strict();
