import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith("postgresql://") || url.startsWith("postgres://"),
    {
      message: "DATABASE_URL must start with postgresql:// or postgres://",
    }
  ),
});

try {
  export const env = envSchema.parse(process.env);
} catch (error) {
  console.error("Environment validation failed:", error);
  console.error("DATABASE_URL:", process.env.DATABASE_URL ? "***configured***" : "missing");
  throw error;
}