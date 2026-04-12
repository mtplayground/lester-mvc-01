"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginBodySchema = exports.RegisterBodySchema = void 0;
const zod_1 = require("zod");
const emailSchema = zod_1.z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase());
exports.RegisterBodySchema = zod_1.z
    .object({
    email: emailSchema,
    password: zod_1.z.string().min(8).max(72),
    name: zod_1.z.string().trim().min(1).max(100)
})
    .strict();
exports.LoginBodySchema = zod_1.z
    .object({
    email: emailSchema,
    password: zod_1.z.string().min(1).max(72)
})
    .strict();
