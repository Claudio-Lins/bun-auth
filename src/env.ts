import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().url().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);