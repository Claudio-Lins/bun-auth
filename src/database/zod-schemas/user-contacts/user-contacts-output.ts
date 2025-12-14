// src/database/zod-schemas/user-contacts/user-contacts-output.ts
import { z } from "zod";

/**
 * USER CONTACT OUTPUT
 * Saída detalhada de contato de usuário
 */
export const UserContactOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  phone: z.string(),
  countryCode: z.string().default("351"),
  isPrimary: z.boolean().default(false),
  verified: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserContactOutputType = z.infer<typeof UserContactOutputSchema>;

