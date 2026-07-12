import { z } from 'zod'

const password = z.string()
  .min(12)
  .max(128)
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password must not exceed 72 UTF-8 bytes')

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email().max(320),
    password,
    displayName: z.string().trim().min(1).max(160),
  }).strict(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email().max(320),
    password,
  }).strict(),
})

export const refreshTokenSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1).max(4096) }).strict(),
})
