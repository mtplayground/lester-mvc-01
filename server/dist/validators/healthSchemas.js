"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusSchema = exports.EmptyQuerySchema = void 0;
const zod_1 = require("zod");
exports.EmptyQuerySchema = zod_1.z.object({}).strict();
exports.HealthStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['ok', 'error']),
    database: zod_1.z.enum(['up', 'down']),
    timestamp: zod_1.z.string().datetime()
});
