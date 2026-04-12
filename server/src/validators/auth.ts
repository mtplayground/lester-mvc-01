import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((email) => email.toLowerCase());

export const RegisterBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100)
  })
  .strict();

export const LoginBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(72)
  })
  .strict();

export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
